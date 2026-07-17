-- Supabase SQL Schema for Monteg Bot App Website
-- This script sets up the tables, defaults, and relations in Supabase.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CONFIGS TABLE
CREATE TABLE IF NOT EXISTS configs (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Insert initial configurations
INSERT INTO configs (key, value) VALUES
('bot_token', '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ'),
('monteg_link', 'https://t.me/monteg_bot'),
('per_ad_amount', '0.05'),
('refer_reward', '0.20'),
('ad_limit', '10'),
('min_withdraw', '2.00'),
('support_link', 'https://t.me/monteg_support'),
('scrolling_notice', 'Welcome to Monteg Bot Earning Platform! Complete simple tasks, watch ads, and refer friends to earn real money daily. Minimum withdrawal is $2.00!')
ON CONFLICT (key) DO NOTHING;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- Can be Telegram User ID (e.g. '128475839') or UUID
    full_name TEXT NOT NULL,
    username TEXT,
    mobile TEXT,
    profile_photo_url TEXT,
    ad_balance NUMERIC(10,4) DEFAULT 0.0000,
    task_balance NUMERIC(10,4) DEFAULT 0.0000,
    refer_balance NUMERIC(10,4) DEFAULT 0.0000,
    total_balance NUMERIC(10,4) DEFAULT 0.0000,
    refer_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned'))
);

-- Create index on refer_by for fast listings
CREATE INDEX IF NOT EXISTS idx_users_refer_by ON users(refer_by);

-- 3. ADS TABLE
CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    reward NUMERIC(10,4) NOT NULL DEFAULT 0.05,
    limit_count INTEGER NOT NULL DEFAULT 1000,
    completed_count INTEGER NOT NULL DEFAULT 0,
    duration INTEGER NOT NULL DEFAULT 15 -- Duration in seconds to watch the ad
);

-- Insert some starter Ads
INSERT INTO ads (title, reward, limit_count, completed_count, duration) VALUES
('Premium Sponsors Video Ad #1', 0.05, 500, 12, 15),
('Monteg Crypto Token Promotion', 0.08, 1000, 48, 20),
('Join our VIP Advertisers Hub', 0.04, 300, 5, 10),
('Watch & Earn Bonus Ad Block', 0.06, 800, 92, 12)
ON CONFLICT DO NOTHING;

-- 4. AD_VIEWS TABLE (To track which user watched which ad)
CREATE TABLE IF NOT EXISTS ad_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_ad_view ON ad_views(user_id, ad_id);

-- 5. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10,4) NOT NULL DEFAULT 0.10,
    link TEXT NOT NULL,
    proof_type TEXT NOT NULL CHECK (proof_type IN ('text', 'image')),
    verify_method TEXT NOT NULL CHECK (verify_method IN ('auto', 'manual')),
    completed_count INTEGER DEFAULT 0,
    limit_count INTEGER DEFAULT 1000
);

-- Insert some starter Tasks
INSERT INTO tasks (title, description, amount, link, proof_type, verify_method, completed_count, limit_count) VALUES
('Join Monteg Telegram Channel', 'Subscribe to our official Telegram channel for updates, announcements, and payment proofs. Instant auto-verify!', 0.15, 'https://t.me/monteg_announcements', 'text', 'auto', 124, 2000),
('Follow Monteg on X (Twitter)', 'Follow our official handle @MontegEarn on X and upload a screenshot of your following status.', 0.20, 'https://twitter.com/MontegEarn', 'image', 'manual', 42, 1000),
('Subscribe to YouTube Partner', 'Watch our latest tutorial video, subscribe, and paste your YouTube channel name as proof.', 0.25, 'https://youtube.com', 'text', 'manual', 18, 500)
ON CONFLICT DO NOTHING;

-- 6. TASK_SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS task_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proof_data TEXT NOT NULL, -- Text string or Image URL
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rejection_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_submissions_user ON task_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON task_submissions(status);

-- 7. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Bkash', 'Nagad', 'Rocket')),
    amount NUMERIC(10,4) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rejection_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);

-- 8. BANNERS TABLE
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    link_url TEXT,
    title TEXT
);

-- Insert starter banners
INSERT INTO banners (image_url, link_url, title) VALUES
('https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800', 'https://t.me/monteg_bot', 'Monteg Earning Launch Banner'),
('https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=800', 'https://t.me/monteg_announcements', 'Invite Friends Banner')
ON CONFLICT DO NOTHING;

-- 9. ADMIN CREDENTIALS TABLE (Optional, simple email/pass fallback)
CREATE TABLE IF NOT EXISTS admin_users (
    email TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL -- Can store hashed password, e.g., using bcrypt
);

-- Seed default Admin credentials (email: admin@monteg.com, password: admin_password_change_me)
INSERT INTO admin_users (email, password_hash) VALUES
('admin@monteg.com', '$2a$10$96x23T/65V7kH3qNqL8u0O1f/E6hV3rA/26.v1/676fA979E1A3fG') -- Hashed version or handle simple matches in your logic
ON CONFLICT DO NOTHING;
