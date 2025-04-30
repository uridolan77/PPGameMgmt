-- Create outbox_messages table for the pp_recommeder_db database
USE pp_recommeder_db;

-- Create the outbox_messages table
CREATE TABLE outbox_messages (
    id VARCHAR(36) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    data TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    processed_at DATETIME NULL,
    is_processed BOOLEAN NOT NULL DEFAULT FALSE,
    processing_attempts INT NOT NULL DEFAULT 0,
    error TEXT NULL
);

-- Create indexes for faster querying
CREATE INDEX idx_outbox_messages_is_processed ON outbox_messages(is_processed);
CREATE INDEX idx_outbox_messages_created_at ON outbox_messages(created_at);
CREATE INDEX idx_outbox_messages_processed_at ON outbox_messages(processed_at);
