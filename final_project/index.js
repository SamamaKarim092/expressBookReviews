const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Set up session middleware
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// Authentication middleware for protected customer routes
app.use("/customer/auth/*", function auth(req, res, next) {
  // Get accessToken from session
  const token = req.session.authorization?.accessToken;

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  // Verify token
  jwt.verify(token, "access", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }
    // Attach user info to request for further use
    req.user = user;
    next();
  });
});

// Mount routers
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start server
const PORT = 5001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
