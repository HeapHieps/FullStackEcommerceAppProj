
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
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>" format

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



// ==================== SELLER ROUTES ====================

// Create or update seller's store
app.post('/api/seller/store', authenticateToken, async (req, res) => {
  try {
    // Only sellers can create stores
    if (req.user.userType !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can create stores' });
    }

    const { storeName, description } = req.body;

    // Check if store name is provided
    if (!storeName) {
      return res.status(400).json({ message: 'Store name is required' });
    }

    // Check if seller already has a store
    const existingStore = await pool.query(
      'SELECT * FROM stores WHERE seller_id = $1',
      [req.user.userId]
    );

    // If store exists, update it; otherwise, create a new store
    let store;
    if (existingStore.rows.length > 0) { 
      // Update existing store
      store = await pool.query(
        'UPDATE stores SET store_name = $1, description = $2 WHERE seller_id = $3 RETURNING *',
        [storeName, description, req.user.userId]
      );
    } else {
      // Create new store
      store = await pool.query(
        'INSERT INTO stores (seller_id, store_name, description) VALUES ($1, $2, $3) RETURNING *',
        [req.user.userId, storeName, description]
      );
    }

    res.status(201).json({
      message: 'Store saved successfully',
      store: store.rows[0]
    });

  } catch (error) {
    console.error('Store creation/update error:', error);
    res.status(500).json({ message: 'Server error during store operation' });
  }
});

// Get seller's store information
app.get('/api/seller/store', authenticateToken, async (req, res) => {
  try {
    // Only sellers can access this route
    if (req.user.userType !== 'seller') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const store = await pool.query(
      'SELECT * FROM stores WHERE seller_id = $1',
      [req.user.userId]
    );

    if (store.rows.length === 0) {
      return res.status(404).json({ message: 'No store found. Please create a store first.' });
    }

    res.json(store.rows[0]);

  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new product
app.post('/api/seller/products', authenticateToken, async (req, res) => {
  try {
    // Only sellers can add products
    if (req.user.userType !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can add products' });
    }

    // Extract product details from request body
    const { name, description, price, stockQuantity, imageUrl } = req.body;

    
    // check if all required fields are provided
    if (!name || !price || stockQuantity === undefined) {
      return res.status(400).json({ message: 'Name, price, and stock quantity are required' });
    }

    // Validate price and stock quantity
    if (price <= 0 || stockQuantity < 0) {
      return res.status(400).json({ message: 'Price must be positive and stock cannot be negative' });
    }

    // Get seller's store (required for adding products)
    const store = await pool.query(
      'SELECT id FROM stores WHERE seller_id = $1',
      [req.user.userId]
    );

    // If seller does not have a store, return error
    if (store.rows.length === 0) {
      return res.status(400).json({ message: 'Please create a store first before adding products' });
    }

    // Add product to database
    const newProduct = await pool.query(
      'INSERT INTO products (seller_id, store_id, name, description, price, stock_quantity, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.userId, store.rows[0].id, name, description, price, stockQuantity, imageUrl]
    );

    res.status(201).json({
      message: 'Product added successfully',
      product: newProduct.rows[0]
    });

  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ message: 'Server error during product creation' });
  }
});

// Get all products for a seller
app.get('/api/seller/products', authenticateToken, async (req, res) => {
  try {
    // Only sellers can access this route
    if (req.user.userType !== 'seller') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const products = await pool.query(
      'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json(products.rows);

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update existing product
app.put('/api/seller/products/:id', authenticateToken, async (req, res) => {
  try {
    // Only sellers can update products
    if (req.user.userType !== 'seller') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params; // Get product ID from URL
    const { name, description, price, stockQuantity, imageUrl } = req.body;

    // Validate input
    if (!name || !price || stockQuantity === undefined) {
      return res.status(400).json({ message: 'Name, price, and stock quantity are required' });
    }

    if (price <= 0 || stockQuantity < 0) {
      return res.status(400).json({ message: 'Price must be positive and stock cannot be negative' });
    }

    // Update product (only if it belongs to this seller)
    const updatedProduct = await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3, stock_quantity = $4, image_url = $5 WHERE id = $6 AND seller_id = $7 RETURNING *',
      [name, description, price, stockQuantity, imageUrl, id, req.user.userId]
    );

    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found or you do not have permission to update it' });
    }

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct.rows[0]
    });

  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ message: 'Server error during product update' });
  }
});

// Delete product
app.delete('/api/seller/products/:id', authenticateToken, async (req, res) => {
  try {
    // Only sellers can delete products
    if (req.user.userType !== 'seller') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params; // Get product ID from URL

    // Delete product (only if it belongs to this seller)
    const deletedProduct = await pool.query(
      'DELETE FROM products WHERE id = $1 AND seller_id = $2 RETURNING *',
      [id, req.user.userId]
    );

    if (deletedProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found or you do not have permission to delete it' });
    }

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({ message: 'Server error during product deletion' });
  }
});

// Get orders for seller (orders containing seller's products)
app.get('/api/seller/orders', authenticateToken, async (req, res) => {
  try {
    // Only sellers can access this route
    if (req.user.userType !== 'seller') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get orders that contain this seller's products - FIXED QUERY
    const orders = await pool.query(`
      SELECT DISTINCT o.*, u.full_name as buyer_name, u.email as buyer_email
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN users u ON o.buyer_id = u.id
      WHERE oi.seller_id = $1
      ORDER BY o.created_at DESC
    `, [req.user.userId]);

    // Get order items for each order (only this seller's items) - FIXED QUERY
    for (let order of orders.rows) {
      const items = await pool.query(`
        SELECT oi.*, p.name as product_name, p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1 AND oi.seller_id = $2
      `, [order.id, req.user.userId]);
      order.items = items.rows;
    }

    res.json(orders.rows);

  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (seller can update status of their orders)
app.put('/api/seller/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    // Only sellers can update order status
    if (req.user.userType !== 'seller') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params; // Order ID
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be: pending, shipped, delivered, or cancelled' });
    }

    // Check if seller has items in this order
    const orderItems = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1 AND seller_id = $2',
      [id, req.user.userId]
    );

    if (orderItems.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found or you do not have items in this order' });
    }

    // Update order status
    const updatedOrder = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder.rows[0]
    });

  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ message: 'Server error during order status update' });
  }
});


// ==================== BUYER ROUTES ====================

// Get all products (public - no auth needed, anyone can browse)
app.get('/api/products', async (req, res) => {
  try {
    // Get all products with store and seller information
    const products = await pool.query(`
      SELECT p.*, s.store_name, u.full_name as seller_name
      FROM products p
      JOIN stores s ON p.store_id = s.id
      JOIN users u ON p.seller_id = u.id
      WHERE p.stock_quantity > 0
      ORDER BY p.created_at DESC
    `);

    res.json(products.rows);

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// Get specific product details
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params; 
    
    const product = await pool.query(` 
      SELECT p.*, s.store_name, s.description as store_description, u.full_name as seller_name, u.email as seller_email
      FROM products p
      JOIN stores s ON p.store_id = s.id
      JOIN users u ON p.seller_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (product.rows.length === 0) { 
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product.rows[0]);    // Return product details along with store and seller information

  } catch (error) {               // Handle errors while fetching product details
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
});

// Get seller profile and their products
app.get('/api/sellers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get seller and store information
    const seller = await pool.query(`
      SELECT u.id, u.full_name, u.email, s.store_name, s.description as store_description, s.created_at as store_created
      FROM users u
      LEFT JOIN stores s ON u.id = s.seller_id
      WHERE u.id = $1 AND u.user_type = 'seller'
    `, [id]);

    if (seller.rows.length === 0) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Get seller's products
    const products = await pool.query(
      'SELECT * FROM products WHERE seller_id = $1 AND stock_quantity > 0 ORDER BY created_at DESC',
      [id]
    );

    // Return seller profile and their products
    res.json({ 
      seller: seller.rows[0], 
      products: products.rows 
    });

  } catch (error) {
    console.error('Get seller error:', error);
    res.status(500).json({ message: 'Server error while fetching seller information' });
  }
});

// Add product to cart
app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    // Only buyers can add to cart
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can add items to cart' });
    }

    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Product ID and positive quantity are required' });
    }

    // Check if product exists and has enough stock
    const product = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.rows[0].stock_quantity < quantity) {
      return res.status(400).json({ 
        message: `Only ${product.rows[0].stock_quantity} items available in stock` 
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await pool.query(
      'SELECT * FROM cart WHERE buyer_id = $1 AND product_id = $2',
      [req.user.userId, productId]
    );

    if (existingCartItem.rows.length > 0) {
      // Update existing cart item quantity
      const newQuantity = existingCartItem.rows[0].quantity + quantity;
      
      // Check if new total quantity exceeds stock
      if (newQuantity > product.rows[0].stock_quantity) {
        return res.status(400).json({ 
          message: `Cannot add ${quantity} more. Only ${product.rows[0].stock_quantity} items available in stock. You already have ${existingCartItem.rows[0].quantity} in cart.` 
        });
      }

      const updatedItem = await pool.query(
        'UPDATE cart SET quantity = quantity + $1 WHERE buyer_id = $2 AND product_id = $3 RETURNING *',
        [quantity, req.user.userId, productId]
      );

      res.json({
        message: 'Cart updated successfully',
        cartItem: updatedItem.rows[0]
      });
    } else {
      // Add new item to cart
      const newCartItem = await pool.query(
        'INSERT INTO cart (buyer_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [req.user.userId, productId, quantity]
      );

      res.status(201).json({
        message: 'Item added to cart successfully',
        cartItem: newCartItem.rows[0]
      });
    }

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error while adding to cart' });
  }
});

// Get cart items
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    // Only buyers can view cart
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can view cart' });
    }

    // Get cart items with product and store information
    const cartItems = await pool.query(`
      SELECT c.*, p.name, p.price, p.image_url, p.stock_quantity, s.store_name, u.full_name as seller_name
      FROM cart c
      JOIN products p ON c.product_id = p.id
      JOIN stores s ON p.store_id = s.id
      JOIN users u ON p.seller_id = u.id
      WHERE c.buyer_id = $1
      ORDER BY c.added_at DESC
    `, [req.user.userId]);

    // Calculate total price
    const total = cartItems.rows.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);

    res.json({
      items: cartItems.rows,
      total: total.toFixed(2),
      itemCount: cartItems.rows.length
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error while fetching cart' });
  }
});

// Update cart item quantity
app.put('/api/cart/:productId', authenticateToken, async (req, res) => {
  try {
    // Only buyers can update cart
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can update cart' });
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate input
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Positive quantity is required' });
    }

    // Check product stock
    const product = await pool.query(
      'SELECT stock_quantity FROM products WHERE id = $1',
      [productId]
    );

    // If product not found, return error
    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if requested quantity exceeds stock
    if (quantity > product.rows[0].stock_quantity) { 
      return res.status(400).json({ 
        message: `Only ${product.rows[0].stock_quantity} items available in stock` 
      });
    }

    // Update cart item quantity
    const updatedItem = await pool.query(
      'UPDATE cart SET quantity = $1 WHERE buyer_id = $2 AND product_id = $3 RETURNING *',
      [quantity, req.user.userId, productId]
    );

    // If no item was updated, return error
    if (updatedItem.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    res.json({
      message: 'Cart item updated successfully',
      cartItem: updatedItem.rows[0]
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error while updating cart' });
  }
});

// Remove item from cart
app.delete('/api/cart/:productId', authenticateToken, async (req, res) => {
  try {
    // Only buyers can remove from cart
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can remove items from cart' });
    }

    const { productId } = req.params;

    const deletedItem = await pool.query(
      'DELETE FROM cart WHERE buyer_id = $1 AND product_id = $2 RETURNING *',
      [req.user.userId, productId]
    );

    // If no item was deleted, return error
    if (deletedItem.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    res.json({ message: 'Item removed from cart successfully' });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error while removing from cart' });
  }
});

// Checkout - create order from cart
app.post('/api/checkout', authenticateToken, async (req, res) => {
  try {
    // Only buyers can checkout
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can checkout' });
    }

    const { shippingAddress } = req.body;

    // Validate input
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Get cart items with product information
    const cartItems = await pool.query(`
      SELECT c.*, p.price, p.seller_id, p.stock_quantity, p.name as product_name
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.buyer_id = $1
    `, [req.user.userId]);

    if (cartItems.rows.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Check stock availability for all items
    for (let item of cartItems.rows) {
      if (item.stock_quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.product_name}. Only ${item.stock_quantity} available.` 
        });
      }
    }

    // Calculate total amount
    const totalAmount = cartItems.rows.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);

    // Create order
    const newOrder = await pool.query(
      'INSERT INTO orders (buyer_id, total_amount, shipping_address) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, totalAmount, shippingAddress]
    );

    const orderId = newOrder.rows[0].id;

    // Create order items and update stock
    for (let item of cartItems.rows) {
      // Add order item
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, seller_id, quantity, price) VALUES ($1, $2, $3, $4, $5)',
        [orderId, item.product_id, item.seller_id, item.quantity, item.price]
      );

      // Update product stock
      await pool.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart after successful order
    await pool.query(
      'DELETE FROM cart WHERE buyer_id = $1',
      [req.user.userId]
    );

    res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder.rows[0]
    });

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Server error during checkout' });
  }
});

// Get buyer's order history
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    // Only buyers can view their orders
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can view order history' });
    }

    // Get orders for this buyer
    const orders = await pool.query(
      'SELECT * FROM orders WHERE buyer_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );

    // Get order items for each order
    for (let order of orders.rows) {
      const items = await pool.query(`
        SELECT oi.*, p.name as product_name, p.image_url, s.store_name, u.full_name as seller_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN stores s ON p.store_id = s.id
        JOIN users u ON oi.seller_id = u.id
        WHERE oi.order_id = $1
      `, [order.id]);
      order.items = items.rows;
    }

    res.json(orders.rows);

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// Cancel order (only if status is pending)
app.put('/api/orders/:id/cancel', authenticateToken, async (req, res) => {
  try {
    // Only buyers can cancel their orders
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can cancel orders' });
    }

    const { id } = req.params;

    // Get order details
    const order = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND buyer_id = $2',
      [id, req.user.userId]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.rows[0].status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending orders' });
    }

    // Update order status to cancelled
    const cancelledOrder = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      ['cancelled', id]
    );

    // Restore product stock
    const orderItems = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );

    for (let item of orderItems.rows) {
      await pool.query(
        'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    res.json({
      message: 'Order cancelled successfully',
      order: cancelledOrder.rows[0]
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error during order cancellation' });
  }
});



// ==================== DATABASE INITIALIZATION ====================
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