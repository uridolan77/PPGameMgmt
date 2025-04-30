-- Create MigrationHistory table for the pp_recommeder_db database
USE pp_recommeder_db;

-- Create the MigrationHistory table
CREATE TABLE IF NOT EXISTS MigrationHistory (
    Id VARCHAR(255) PRIMARY KEY,
    Description TEXT NOT NULL,
    AppliedAt DATETIME NOT NULL
);
