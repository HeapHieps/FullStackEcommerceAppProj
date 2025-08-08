
// Importing tools
const express = require('express');   //webserver framework
const cors = require('cors');         // send/receive messages from a server on the same domain that the JS was served from
const jwt = require('jsonwebtoken');  // JSON Web Token for authentication
const bcrypt = require('bcryptjs');   // Password hashing
const { Pool } = require('pg');       // PostgreSql database conencter
require('dotenv').config();           // help read environment variables from .env file


// ==================== SERVER SETUP ====================
// Initialize/Creating webserver app
const app = express();
const PORT = process.env.PORT || 5000;



// ==================== DATABASE SETUP ====================
// Database connection
const pool = new Pool({               // pool is a connection pool to manage database connections
  user: process.env.DB_USER,          // uses stuff from .env file
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


// Middleware to authenticate JWT token
// This function checks if the request has a valid JWT token in the Authorization header
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token format

  // If no token is provided, return 401 Unauthorized
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // Verify the token using the secret key
  // If the token is valid, the user information is added to the request object
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });

};


// Test database connection
const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
};



// ==================== DATABASE INITIALIZATION ====================
// Initialize database tables when the server starts
const initDatabase = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_type VARCHAR(10) CHECK (user_type IN ('buyer', 'seller')) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Stores table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        store_name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
        shipping_address TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL
      )
    `);

    // Cart table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(buyer_id, product_id)
      )
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  }
};



// ==================== MIDDLEWARE SETUP ====================
// Middleware
app.use(cors()); 
app.use(express.json()); 


// Test routes
// The URLs below can be used to test the backend server and database connection
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ 
      message: 'Database connection successful!',
      current_time: result.rows[0].current_time 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});



// ==================== AUTH ROUTES ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, userType, fullName } = req.body;               // Extracting user details from request body  
    
    // Validate input
    if (!email || !password || !userType || !fullName) {
      return res.status(400).json({ message: 'All fields are required' });  // Check if all fields are provided
    }

    if (!['buyer', 'seller'].includes(userType)) {
      return res.status(400).json({ message: 'User type must be buyer or seller' }); // Check if userType is valid
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds); 

    // Create new user
    const newUser = await pool.query(
      'INSERT INTO users (email, password, user_type, full_name) VALUES ($1, $2, $3, $4) RETURNING id, email, user_type, full_name, created_at',
      [email, hashedPassword, userType, fullName]
    );

    // Generate JWT token with user information
    const token = jwt.sign( 
      { 
        userId: newUser.rows[0].id, 
        userType: newUser.rows[0].user_type,
        email: newUser.rows[0].email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({                      // Respond with success message, token, and user info
      message: 'User registered successfully', 
      token,
      user: newUser.rows[0]
    });

  } catch (error) {                             // Handle errors during registration
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );
    // If user not found, return error
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    // If password is invalid, return error
    if (!validPassword) { 
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token with user information
    const token = jwt.sign(
      { 
        userId: user.rows[0].id, 
        userType: user.rows[0].user_type,
        email: user.rows[0].email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        user_type: user.rows[0].user_type,
        full_name: user.rows[0].full_name,
        created_at: user.rows[0].created_at
      }
    });
    
  } catch (error) {                                 // Handle errors during login
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user info (protected route example)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, email, user_type, full_name, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server with database initialization
const startServer = async () => {
  await testDatabaseConnection();
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Test at: http://localhost:5000/api/test`);
    console.log(`🗄️  Database test at: http://localhost:5000/api/db-test`);
    console.log(`🔐 Register at: POST http://localhost:5000/api/auth/register`);
    console.log(`🔓 Login at: POST http://localhost:5000/api/auth/login`);
  });
};

startServer();