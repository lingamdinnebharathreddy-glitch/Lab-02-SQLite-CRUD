
const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "library.db");

let db = null;

// Initialize Database and Server
const initializeDBAndServer = async () => {
    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    app.listen(3000, () => {
        console.log("Server running at http://localhost:3000");
    });
};

// API 1: Get All Books
app.get("/books/", async (request, response) => {
    const {
        search_q,
        order_by,
        order,
        limit,
        offset,
        min_price,
        max_price
    } = request.query;

    let query = "SELECT * FROM book";
    const params = [];

    if (search_q !== undefined) {
        query += " WHERE title LIKE ?";
        params.push("%" + search_q + "%");
    }

    if (min_price !== undefined && max_price !== undefined) {
        if (search_q !== undefined) {
            query += " AND price BETWEEN ? AND ?";
        } else {
            query += " WHERE price BETWEEN ? AND ?";
        }

        params.push(min_price, max_price);
    }

    if (min_price !== undefined && max_price === undefined) {
        if (search_q !== undefined) {
            query += " AND price >= ?";
        } else {
            query += " WHERE price >= ?";
        }

        params.push(min_price);
    }

    if (max_price !== undefined && min_price === undefined) {
        if (search_q !== undefined) {
            query += " AND price <= ?";
        } else {
            query += " WHERE price <= ?";
        }

        params.push(max_price);
    }

    let sortColumn = "id";
    let sortOrder = "ASC";

    if (order_by !== undefined) {
        sortColumn = order_by;
    }

    if (order !== undefined) {
        sortOrder = order;
    }

    query += " ORDER BY " + sortColumn + " " + sortOrder;

    let bookLimit = 10;
    let bookOffset = 0;

    if (limit !== undefined) {
        bookLimit = Number(limit);
    }

    if (offset !== undefined) {
        bookOffset = Number(offset);
    }

    query += " LIMIT ? OFFSET ?";
    params.push(bookLimit, bookOffset);

    const books = await db.all(query, params);

    response.send(books);
});

// API 2: Get Book by ID
app.get("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;

    const query = "SELECT * FROM book WHERE id = ?";

    const book = await db.get(query, [bookId]);

    if (book === undefined) {
        response.status(404);
        response.send("Book not found");
    } else {
        response.send(book);
    }
});

// API 3: Add a Book
app.post("/books/", async (request, response) => {
    const { title, author, price, pages } = request.body;

    const query = `
        INSERT INTO book (title, author, price, pages)
        VALUES (?, ?, ?, ?);
    `;

    await db.run(query, [title, author, price, pages]);

    response.send("Book added successfully");
});

// API 4: Update a Book
app.put("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    const query = `
        UPDATE book
        SET title = ?, author = ?, price = ?, pages = ?
        WHERE id = ?;
    `;

    await db.run(query, [title, author, price, pages, bookId]);

    response.send("Book updated successfully");
});

// API 5: Delete a Book
app.delete("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;

    const query = "DELETE FROM book WHERE id = ?";

    await db.run(query, [bookId]);

    response.send("Book deleted successfully");
});

initializeDBAndServer();

module.exports = app;
