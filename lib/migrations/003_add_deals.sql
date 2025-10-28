-- Migration: Add deal tracking for investors
-- Run this after 002_add_messaging.sql

-- Add deal tracking fields to interactions table
ALTER TABLE interactions
ADD COLUMN IF NOT EXISTS deal_done BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deal_amount DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS deal_closed_at TIMESTAMP;

-- Create index for deal queries
CREATE INDEX IF NOT EXISTS idx_interactions_deals ON interactions(deal_done) WHERE deal_done = TRUE;

-- Add comment
COMMENT ON COLUMN interactions.deal_done IS 'Whether investor has marked this as a completed deal';
COMMENT ON COLUMN interactions.deal_amount IS 'Investment amount if deal was completed';
COMMENT ON COLUMN interactions.deal_closed_at IS 'Timestamp when deal was marked as done';
