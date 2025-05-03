const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users[username] = { password: password };
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  let foundBooks = [];

  Object.keys(books).forEach((bookId) => {
    const book = books[bookId];
    if (book.author.toLowerCase() === author.toLowerCase()) {
      foundBooks.push(book);
    }
  });

  if (foundBooks.length > 0) {
    return res.status(200).json(foundBooks);
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  let foundBooks = [];

  Object.keys(books).forEach((bookId) => {
    const book = books[bookId];
    if (book.title.toLowerCase().includes(title)) {
      foundBooks.push(book);
    }
  });

  if (foundBooks.length > 0) {
    return res.status(200).json(foundBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// --------------- TASK 11: Get book details based on ISBN using Axios with async/await ----------------
const axios = require('axios');

// Function to fetch book details by ISBN using Axios with async/await
const getBookByISBNAsync = async (isbn) => {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    console.log("Book details for ISBN", isbn, ":", response.data);
  } catch (error) {
    console.error("Error fetching book by ISBN:", error.message);
  }
};

// Example usage of the function for testing
getBookByISBNAsync("1"); // Replace "1" with a valid ISBN from your booksdb.js

// Task 12: Get book details based on Author using async/await and Axios
const getBooksByAuthorAsync = async (author) => {
    try {
      const response = await axios.get(`http://localhost:5000/author/${author}`);
      console.log("Books by author", author, ":", response.data);
    } catch (error) {
      console.error("Error fetching books by author:", error.message);
    }
  };
  
  // Example call to fetch books by an author (e.g., "Jane Austen")
  getBooksByAuthorAsync("Jane Austen");  // Change the author name to test with others
  // Task 13: Get book details based on Title using async/await and Axios
const getBooksByTitleAsync = async (title) => {
    try {
      const response = await axios.get(`http://localhost:5000/title/${title}`);
      console.log("Books with title", title, ":", response.data);
    } catch (error) {
      console.error("Error fetching books by title:", error.message);
    }
  };
  
  // Example call to fetch books with a title (e.g., "Pride and Prejudice")
  getBooksByTitleAsync("Pride and Prejudice");  // Change the title name to test with others
module.exports.general = public_users;
