-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Packages Table
CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  ram_mb INTEGER NOT NULL,
  cpu_limit INTEGER NOT NULL,
  disk_mb INTEGER NOT NULL,
  backup_slots INTEGER DEFAULT 0,
  database_limit INTEGER DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES packages(id),
  status VARCHAR(50) DEFAULT 'pending',
  server_name VARCHAR(100),
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

-- Servers Table
CREATE TABLE IF NOT EXISTS servers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id),
  package_id INTEGER REFERENCES packages(id),
  pterodactyl_server_id INTEGER UNIQUE,
  server_name VARCHAR(100) NOT NULL,
  server_identifier VARCHAR(100) UNIQUE,
  status VARCHAR(50) DEFAULT 'provisioning',
  ip_address VARCHAR(50),
  port INTEGER,
  ram_mb INTEGER,
  cpu_limit INTEGER,
  disk_mb INTEGER,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_servers_user_id ON servers(user_id);
CREATE INDEX idx_servers_status ON servers(status);
CREATE INDEX idx_servers_pterodactyl_id ON servers(pterodactyl_server_id);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
  transaction_id VARCHAR(255) UNIQUE,
  payment_gateway VARCHAR(50),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_type VARCHAR(50),
  raw_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_invoice_id ON payment_transactions(invoice_id);
CREATE INDEX idx_transactions_transaction_id ON payment_transactions(transaction_id);

-- Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, full_name, role) 
VALUES ('admin@localhost', '$2b$10$YourHashedPasswordHere', 'Administrator', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample packages
INSERT INTO packages (name, description, ram_mb, cpu_limit, disk_mb, price, billing_cycle) VALUES
('Starter', 'Perfect for small servers with friends', 2048, 100, 10240, 50000, 'monthly'),
('Basic', 'Great for medium-sized communities', 4096, 150, 20480, 90000, 'monthly'),
('Premium', 'Ideal for large communities', 8192, 200, 40960, 150000, 'monthly'),
('Ultimate', 'Maximum performance for huge servers', 16384, 300, 81920, 250000, 'monthly')
ON CONFLICT DO NOTHING;
