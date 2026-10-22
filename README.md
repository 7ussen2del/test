# To-Do List App

A simple full-stack To-Do List application built with:

- **Frontend:** HTML, CSS, and vanilla JavaScript
- **Backend:** Node.js and Express.js
- **Database:** MySQL

## Features

- View all tasks
- Add a new task
- Mark a task as completed (or not completed)
- Delete a task
- Tasks are stored in MySQL (no mock data or browser local storage)

## Project Structure

```
Project-2/
├── backend/
│   ├── .env.example     # Template for environment variables
│   ├── db.js            # MySQL connection pool
│   ├── package.json
│   └── server.js        # Express server and API routes
├── database/
│   └── init.sql         # Creates the database and tasks table
├── frontend/
│   ├── app.js           # Frontend logic (fetch calls, rendering)
│   ├── index.html
│   └── style.css
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (includes npm)
- A running MySQL server (MySQL 8.0+ recommended)

## Setup

### 1. Create the database

Run the initialization script with your MySQL user:

```bash
mysql -u root -p < database/init.sql
```

On Windows PowerShell, you can use:

```powershell
Get-Content database\init.sql | mysql -u root -p
```

This creates a `todo_app` database with a `tasks` table:

| Column    | Type         | Notes                        |
| --------- | ------------ | ---------------------------- |
| id        | INT          | Primary key, auto-increment  |
| title     | VARCHAR(255) | Task text, required          |
| completed | BOOLEAN      | Defaults to `FALSE`          |

### 2. Configure environment variables

Copy the example file and edit it with your MySQL credentials:

```bash
cd backend
cp .env.example .env
```

On Windows:

```powershell
cd backend
Copy-Item .env.example .env
```

Then edit `backend/.env`:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=todo_app
```

`backend/.env` is ignored by Git — never commit real credentials.

### 3. Install dependencies

```bash
cd backend
npm install
```

### 4. Start the server

```bash
npm start
```

For automatic restarts while editing (Node.js 18+):

```bash
npm run dev
```

Open **http://localhost:3000** in your browser. The Express server also serves the frontend files, so you only need this one server running.

## API Endpoints

| Method | Endpoint         | Description                          | Body                 |
| ------ | ---------------- | ------------------------------------ | -------------------- |
| GET    | `/api/tasks`     | Get all tasks                        | —                    |
| POST   | `/api/tasks`     | Add a task                           | `{ "title": "..." }` |
| PUT    | `/api/tasks/:id` | Update task status                   | `{ "completed": true }` |
| DELETE | `/api/tasks/:id` | Delete a task                        | —                    |
| GET    | `/api/health`    | Check API and database connectivity  | —                    |

### Example requests

```bash
# Health check
curl http://localhost:3000/api/health

# List tasks
curl http://localhost:3000/api/tasks

# Add a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Buy milk\"}"

# Mark task 1 as completed
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d "{\"completed\":true}"

# Delete task 1
curl -X DELETE http://localhost:3000/api/tasks/1
```

In PowerShell, `curl` is an alias for `Invoke-WebRequest`. Use `curl.exe` instead, or run the equivalent:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/tasks
Invoke-RestMethod -Uri http://localhost:3000/api/tasks -Method Post `
  -ContentType "application/json" -Body '{"title":"Buy milk"}'
```

## Troubleshooting

- **`ECONNREFUSED` or "database disconnected" on `/api/health`** — MySQL is not running, or the host/port in `.env` is wrong.
- **`ER_ACCESS_DENIED_ERROR`** — the `DB_USER` or `DB_PASSWORD` in `.env` is incorrect.
- **`ER_BAD_DB_ERROR`** — the `todo_app` database was not created; run `database/init.sql` again.
- **Port 3000 already in use** — change `PORT` in `.env` and restart the server.
# test
