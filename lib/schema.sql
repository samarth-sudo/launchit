-- Enable pgvector extension for semantic similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User type enum
CREATE TYPE user_type AS ENUM ('founder', 'investor', 'early_adopter');

-- Product pricing type enum
CREATE TYPE pricing_type AS ENUM ('one_time', 'subscription', 'equity', 'partnership');

-- Match status enum
CREATE TYPE match_status AS ENUM ('interested', 'in_discussion', 'deal_closed', 'passed');

-- Interaction action enum
CREATE TYPE interaction_action AS ENUM ('like', 'pass', 'super_like');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL, -- Clerk authentication ID
  email VARCHAR(255) UNIQUE NOT NULL,
  user_type user_type NOT NULL,
  profile JSONB DEFAULT '{}', -- {name, avatar, bio, company, investment_thesis, stage_preference, etc}
  stripe_customer_id VARCHAR(255),
  stripe_account_id VARCHAR(255), -- For Stripe Connect payouts
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  founder_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description_7words VARCHAR(100) NOT NULL, -- 7-word pitch
  full_description TEXT,
  demo_video JSONB, -- {url, duration, thumbnail, cloudinary_id, transcription}
  pricing JSONB NOT NULL, -- {amount, currency, type: pricing_type}
  category VARCHAR(50),
  tags TEXT[],
  ai_generated_summary TEXT, -- Claude-generated product summary
  embedding VECTOR(1536), -- For semantic similarity search (Claude/Anthropic embeddings)
  market_data JSONB DEFAULT '{}', -- {tam, competitors, stage, metrics}
  status VARCHAR(20) DEFAULT 'active', -- active, paused, funded
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  match_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Interactions table (swipe history)
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  action interaction_action NOT NULL,
  time_spent_seconds INT DEFAULT 0,
  video_completion_pct FLOAT DEFAULT 0, -- 0-1 (percentage of video watched)
  replay_count INT DEFAULT 0,
  clicked_founder_profile BOOLEAN DEFAULT false,
  ai_intent_score FLOAT, -- 0-100 predicted purchase intent from Claude
  ai_reasoning TEXT, -- Claude's reasoning for the intent score
  timestamp TIMESTAMP DEFAULT NOW(),
  UNIQUE(investor_id, product_id) -- Prevent duplicate swipes
);

-- Matches table (mutual interest)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  founder_id UUID REFERENCES users(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  matched_at TIMESTAMP DEFAULT NOW(),
  status match_status DEFAULT 'interested',
  deal_amount DECIMAL(12, 2), -- If deal closes
  notes TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table (real-time messaging)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI synthetic tests table
CREATE TABLE ai_synthetic_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  founder_id UUID REFERENCES users(id) ON DELETE CASCADE,
  test_date TIMESTAMP DEFAULT NOW(),
  persona_count INT DEFAULT 100, -- Number of AI personas generated
  synthetic_personas JSONB[], -- Array of AI-generated investor personas
  results JSONB, -- {like_rate, pass_rate, top_concerns[], recommendations[], sentiment_analysis}
  cost_usd DECIMAL(5,2) DEFAULT 29.00, -- $29 per test
  stripe_payment_intent VARCHAR(255), -- Stripe payment ID
  status VARCHAR(20) DEFAULT 'completed', -- pending, processing, completed, failed
  processing_time_seconds INT
);

-- AI insights table (cached Claude responses)
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES users(id), -- NULL for product-level insights
  insight_type VARCHAR(50) NOT NULL, -- 'match_score', 'due_diligence', 'risk_assessment', 'market_context', 'founder_analysis'
  content TEXT NOT NULL, -- Claude's generated insight
  structured_data JSONB, -- Parsed structured data (e.g., {score: 87, risks: [], opportunities: []})
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days', -- Cache for 7 days
  token_count INT, -- For cost tracking
  response_time_ms INT -- For performance monitoring
);

-- Investor preferences table (for personalized feed)
CREATE TABLE investor_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  preferred_categories TEXT[],
  preferred_stages TEXT[], -- seed, pre_seed, mvp, revenue
  investment_range JSONB, -- {min: 10000, max: 500000}
  avoid_keywords TEXT[],
  ai_recommendation_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics events table (for A/B testing and metrics)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL, -- page_view, swipe, match, message_sent, etc.
  event_data JSONB DEFAULT '{}',
  ab_test_variant VARCHAR(50), -- For A/B testing (e.g., 'ai_recommended', 'chronological')
  session_id VARCHAR(255),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Waitlist table (for pre-launch signups)
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  user_type user_type,
  referral_code VARCHAR(50),
  metadata JSONB DEFAULT '{}', -- interests, company, etc.
  invited BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_products_founder_id ON products(founder_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_interactions_investor_id ON interactions(investor_id);
CREATE INDEX idx_interactions_product_id ON interactions(product_id);
CREATE INDEX idx_interactions_action ON interactions(action);
CREATE INDEX idx_matches_investor_id ON matches(investor_id);
CREATE INDEX idx_matches_founder_id ON matches(founder_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_ai_insights_expires_at ON ai_insights(expires_at);
CREATE INDEX idx_ai_insights_product_investor ON ai_insights(product_id, investor_id);
CREATE INDEX idx_analytics_user_event ON analytics_events(user_id, event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);

-- Vector similarity search index (for semantic matching)
CREATE INDEX idx_products_embedding ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Functions for automated updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investor_preferences_updated_at BEFORE UPDATE ON investor_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update product stats
CREATE OR REPLACE FUNCTION update_product_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action = 'like' OR NEW.action = 'super_like' THEN
    UPDATE products
    SET like_count = like_count + 1
    WHERE id = NEW.product_id;
  END IF;

  UPDATE products
  SET view_count = view_count + 1
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_stats_on_interaction
AFTER INSERT ON interactions
FOR EACH ROW EXECUTE FUNCTION update_product_stats();

-- Function to clean up expired AI insights (run daily)
CREATE OR REPLACE FUNCTION cleanup_expired_insights()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_insights WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- Sample data insertion (for development/testing)
-- Uncomment below to insert sample data

/*
INSERT INTO users (clerk_id, email, user_type, profile) VALUES
  ('user_test_founder1', 'founder@example.com', 'founder', '{"name": "Alice Smith", "company": "AI Startup Inc", "bio": "Building the future of AI"}'),
  ('user_test_investor1', 'investor@example.com', 'investor', '{"name": "Bob Johnson", "firm": "VC Partners", "investment_thesis": "Early-stage AI and SaaS", "stage_preference": "seed"}');

INSERT INTO products (founder_id, title, description_7words, pricing, category) VALUES
  ((SELECT id FROM users WHERE email = 'founder@example.com'),
   'AI Copilot for Developers',
   'Code faster with AI pair programming',
   '{"amount": 150000, "currency": "USD", "type": "equity"}',
   'AI Tools');
*/
