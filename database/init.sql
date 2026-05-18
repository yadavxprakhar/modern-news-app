-- =======================================================
-- News Website Relational Database Initialization Schema
-- =======================================================

-- 1. Enable UUID Extension for primary key generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Core Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. User Customization & Preferences Table (One-to-One with Users)
CREATE TABLE IF NOT EXISTS user_preferences (
    preference_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    favorite_categories VARCHAR(50)[] DEFAULT '{}',
    theme VARCHAR(20) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_user_preference UNIQUE (user_id)
);

-- 4. Cached & Archived Articles (Saves external news records persistently)
CREATE TABLE IF NOT EXISTS articles (
    article_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    author VARCHAR(255),
    source VARCHAR(100),
    url TEXT NOT NULL UNIQUE,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    category VARCHAR(50),
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. Bookmarks Table (Many-to-Many Bridge between Users & Articles)
CREATE TABLE IF NOT EXISTS bookmarks (
    bookmark_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_bookmark UNIQUE (user_id, article_id)
);

-- Create index mappings for performance optimization
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);
