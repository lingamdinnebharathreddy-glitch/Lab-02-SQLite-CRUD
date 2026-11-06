const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();

app.use(express.json());

const dbPath = "./library.db";

let db = null;

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        app.listen(3000, () => {
            console.log("Server running at http://localhost:3000");
        });
    } catch (error) {
        console.log(`Database Error: ${error.message}`);
        process.exit(1);
    }
};


app.get("/books/", async (request, response) => {
    const {
        search_q,
        order_by = "id",
        order = "ASC",
        limit = 10,
        offset = 0,
        min_price,
        max_price
    } = request.query;

    let query = `SELECT * FROM book WHERE 1 = 1`;
    const queryParams = [];

    if (search_q !== undefined) {
        query += ` AND title LIKE ?`;
        queryParams.push(`%${search_q}%`);
    }

    if (min_price !== undefined && max_price !== undefined) {
        query += ` AND price BETWEEN ? AND ?`;
        queryParams.push(min_price, max_price);
    } else if (min_price !== undefined) {
        query += ` AND price >= ?`;
        queryParams.push(min_price);
    } else if (max_price !== undefined) {
        query += ` AND price <= ?`;
        queryParams.push(max_price);
    }

    const allowedColumns = ["id", "title", "author", "price", "pages"];
    const sortColumn = allowedColumns.includes(order_by) ? order_by : "id";
    const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    query += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), Number(offset));

    const books = await db.all(query, queryParams);
    response.send(books);
});


app.get("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;

    const book = await db.get(
        "SELECT * FROM book WHERE id = ?",
        [bookId]
    );

    if (!book) {
        return response.status(404).json({
            message: "Book not found"
        });
    }

    return response.status(200).json(book);
});
app.post("/books/", async (request, response) => {
    const { title, author, price, pages } = request.body;

    if (!title || typeof title !== "string" || !title.trim()) {
        return response.status(400).json({
            message: "Title is required"
        });
    }

    if (!author || typeof author !== "string" || !author.trim()) {
        return response.status(400).json({
            message: "Author is required"
        });
    }

    if (typeof price !== "number" || !Number.isFinite(price)) {
        return response.status(400).json({
            message: "Price must be a valid number"
        });
    }

    const query = `
        INSERT INTO book (title, author, price, pages)
        VALUES (?, ?, ?, ?);
    `;

    await db.run(query, [title.trim(), author.trim(), price, pages ?? null]);

    return response.status(201).json({
        message: "Book added successfully"
    });
});


app.put("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    const book = await db.get(
        "SELECT * FROM book WHERE id = ?",
        [bookId]
    );

    if (!book) {
        return response.status(404).json({
            message: "Book not found"
        });
    }

    if (typeof title !== "string" || !title.trim() ||
        typeof author !== "string" || !author.trim() ||
        typeof price !== "number" || !Number.isFinite(price)) {
        return response.status(400).json({
            message: "Valid title, author and price are required"
        });
    }

    const query = `
        UPDATE book
        SET title = ?, author = ?, price = ?, pages = ?
        WHERE id = ?;
    `;

    await db.run(query, [
        title.trim(), author.trim(), price, pages ?? null, bookId
    ]);

    return response.status(200).json({
        message: "Book updated successfully"
    });
});

app.delete("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;

    const result = await db.run(
        "DELETE FROM book WHERE id = ?",
        [bookId]
    );

    if (result.changes === 0) {
        return response.status(404).json({
            message: "Book not found"
        });
    }

    return response.status(200).json({
        message: "Book deleted successfully"
    });
});
initializeDBAndServer();