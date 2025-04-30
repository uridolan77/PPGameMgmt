-- Fix MigrationHistory table in pp_recommeder_db database
USE pp_recommeder_db;

-- Drop the existing MigrationHistory table if it exists
DROP TABLE IF EXISTS MigrationHistory;

-- Create the MigrationHistory table with the correct structure
CREATE TABLE MigrationHistory (
    Id VARCHAR(255) PRIMARY KEY,
    Description TEXT NOT NULL,
    AppliedAt DATETIME NOT NULL
);

-- Create the __EFMigrationsHistory table if it doesn't exist
-- This is the standard table used by Entity Framework Core
CREATE TABLE IF NOT EXISTS __EFMigrationsHistory (
    MigrationId VARCHAR(150) NOT NULL,
    ProductVersion VARCHAR(32) NOT NULL,
    PRIMARY KEY (MigrationId)
);

-- Insert a record for the outbox_messages table creation
INSERT INTO MigrationHistory (Id, Description, AppliedAt)
VALUES ('20250429000001_CreateOutboxTable', 'Creates the OutboxMessages table for the Outbox pattern', NOW());
