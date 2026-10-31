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
    const books = await db.all("SELECT * FROM book");
    response.send(books);
});

app.get("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;

    const book = await db.get(
        "SELECT * FROM book WHERE id = ?",
        [bookId]
    );

    response.send(book);
});
app.post("/books/", async (request, response) => {
    const { title, author, price, pages } = request.body;

    const query = `
        INSERT INTO book (title, author, price, pages)
        VALUES (?, ?, ?, ?);
    `;

    await db.run(query, [title, author, price, pages]);

    response.status(201).send("Book added successfully");
});

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

app.delete("/books/:bookId/", async (request, response) => {
    const { bookId } = request.params;

    const query = `
        DELETE FROM book
        WHERE id = ?;
    `;

    await db.run(query, [bookId]);

    response.send("Book deleted successfully");
});
initializeDBAndServer();