# Lab 03 – REST API, Query Parameters, Validation and Debugging

## Student Details

- **Name:** L. Bharath Kumar Reddy
- **Registration Number:** 252U1R8047
- **Section:** 204 & S13
- **Course:** Backend Development Fundamentals
- **Lab Number:** 03

---

## Project Description

This project focuses on developing a RESTful API using Node.js, Express.js and SQLite.

The application manages a collection of books and supports CRUD operations, query parameters, searching, sorting, pagination, price-range filtering, input validation and error handling.

Postman is used to test the API endpoints and verify their responses.

## Technologies Used

- Node.js
- Express.js
- SQLite
- JavaScript
- Nodemon
- Postman
- Visual Studio Code

---

## Project Setup and Execution

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

### 3. Server URL

```text
http://localhost:3000
```

---

## REST API Endpoints

| HTTP Method | Endpoint | Description |
|---|---|---|
| GET | `/books/` | Retrieve all books |
| GET | `/books/:bookId/` | Retrieve a specific book |
| POST | `/books/` | Add a new book |
| PUT | `/books/:bookId/` | Update an existing book |
| DELETE | `/books/:bookId/` | Delete a book |

---

## GET API – Query Parameters

The GET `/books/` endpoint supports the following query parameters:

| Parameter | Description | Default |
|---|---|---|
| `search_q` | Search books using partial title matching | None |
| `order_by` | Select the column for sorting | `id` |
| `order` | Sorting order (ASC/DESC) | `ASC` |
| `limit` | Maximum number of records | `10` |
| `offset` | Number of records to skip | `0` |
| `min_price` | Minimum book price | None |
| `max_price` | Maximum book price | None |

### Example Requests

**Search books:**
```text
GET /books/?search_q=The
```

**Sort by price in descending order:**
```text
GET /books/?order_by=price&order=DESC
```

**Pagination:**
```text
GET /books/?limit=5&offset=0
```

**Price-range filtering:**
```text
GET /books/?min_price=300&max_price=400
```

**Combined search and sorting:**
```text
GET /books/?search_q=The&order_by=price&order=ASC
```

---

## Input Validation and Error Handling

The POST endpoint validates the following fields:

- Title must be provided and cannot be empty.
- Author must be provided and cannot be empty.
- Price must be a valid number.

The PUT endpoint validates the required title, author and price fields.

Invalid requests return HTTP 400 with a descriptive JSON error message.

The application also checks whether a requested book exists before updating or retrieving it.

---

## HTTP Status Codes

| Status Code | Description |
|---|---|
| `200 OK` | Request completed successfully |
| `201 Created` | New book created successfully |
| `400 Bad Request` | Invalid or missing input |
| `404 Not Found` | Requested book does not exist |

---

## Debugging Exercises

The following common backend development errors were studied and addressed:

1. **EADDRINUSE:** Identifying and resolving port conflicts using process-management commands.
2. **Wrong Import Path:** Identifying incorrect module paths and correcting them.
3. **SQLite Table-Name Typo:** Fixing incorrect table references that cause `no such table` errors.
4. **Missing await:** Understanding and correcting asynchronous database operations.

---

## Postman API Testing

All major API operations were tested using Postman.

Testing covered:

- Retrieving all books.
- Searching books using partial title matching.
- Sorting records in ascending and descending order.
- Pagination using limit and offset.
- Price-range filtering.
- Combined query parameters.
- Retr