-- Migration: Add review and reputation features
-- Run this after the initial schema.sql

-- Add review fields to interactions table
ALTER TABLE interactions
ADD COLUMN IF NOT EXISTS review_rating INT CHECK (review_rating >= 1 AND review_rating <= 5),
ADD COLUMN IF NOT EXISTS review_text TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

-- Add reputation and rank fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS reputation_score FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rank INT DEFAULT 0;

-- Create index for reputation lookups
CREATE INDEX IF NOT EXISTS idx_users_reputation ON users(reputation_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_rank ON users(rank DESC);

-- Create index for reviews
CREATE INDEX IF NOT EXISTS idx_interactions_reviews ON interactions(review_rating) WHERE review_rating IS NOT NULL;

-- Add comment
COMMENT ON COLUMN interactions.review_rating IS 'Star rating 1-5 from early adopters/investors';
COMMENT ON COLUMN interactions.review_text IS 'Written review feedback';
COMMENT ON COLUMN users.reputation_score IS 'Overall reputation score based on activity and reviews';
COMMENT ON COLUMN users.rank IS 'Rank/level for gamification (especially for investors)';
