-- Run this file once to create the database and the tasks table.
-- Example: mysql -u root -p < database/init.sql

CREATE DATABASE IF NOT EXISTS todo_app;

USE todo_app;

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE
);
