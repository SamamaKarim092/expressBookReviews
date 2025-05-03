const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { username: "john_doe", password: "password123" }
  ];
   // This array will hold the registered users

// Helper function to check if the username is valid (already exists in the users list)
const isValid = (username) => {
  // Check if username exists in the users list
  return users.some(user => user.username === username);
}

// Helper function to authenticate a user (check if username and password match)
const authenticatedUser = (username, password) => {
  // Check if there is a user with the given username and password
  return users.some(user => user.username === username && user.password === password);
}

// Login Endpoint for /customer/login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if the user exists and the password matches
  if (authenticatedUser(username, password)) {
    // Create a JWT token for the logged-in user
    const token = jwt.sign({ username }, 'your_jwt_secret_key', { expiresIn: '1h' }); // You can change the secret key

    // Send the token back as a response
    return res.status(200).json({ message: "Login successful", token });
  } else {
    // If username and password don't match
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add or modify a book review (Only for authenticated users)
regd_users.put("/auth/review/:isbn", (req, res) => {
    const authHeader = req.headers['authorization'];
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({ message: "No valid token provided. Please login first." });
    }
  
    const token = authHeader.split(' ')[1];
  
    jwt.verify(token, 'your_jwt_secret_key', (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Failed to authenticate token." });
      }
  
      const username = decoded.username;
      const { isbn } = req.params;
      const review = req.query.review;
  
      if (!review) {
        return res.status(400).json({ message: "Review is required in query parameters." });
      }
  
      if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
      }
  
      if (!books[isbn].reviews) {
        books[isbn].reviews = {};
      }
  
      books[isbn].reviews[username] = review;
  
      return res.status(200).json({
        message: "Review added or updated successfully.",
        reviews: books[isbn].reviews
      });
    });
  });

  // Delete a book review (Only for authenticated users)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const token = req.headers['authorization'];
  
    if (!token) {
      return res.status(403).json({ message: "No token provided. Please login first." });
    }
  
    jwt.verify(token, 'your_jwt_secret_key', (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Failed to authenticate token" });
      }
  
      const { isbn } = req.params;
      const username = decoded.username;
  
      // Check if the book exists
      if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      // Check if this user has posted a review
      if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully." });
      } else {
        return res.status(404).json({ message: "Review not found for this user." });
      }
    });
  });
  
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
