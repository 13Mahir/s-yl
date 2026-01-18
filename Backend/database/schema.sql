-- Database Initialization
CREATE DATABASE IF NOT EXISTS trustid_platform;
USE trustid_platform;

-- Users Table (Central Identity)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., 9876543210 (Citizen), ORG-123 (Provider)
    role ENUM('Citizen', 'Service Provider', 'Regulatory Authority', 'Admin') NOT NULL,
    full_name VARCHAR(100),
    dob DATE,
    gender ENUM('Male', 'Female', 'Other'),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- In real app, store bcrypt hash
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Provider Details (Linked to Users)
CREATE TABLE IF NOT EXISTS service_providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    org_name VARCHAR(100) NOT NULL,
    verification_status ENUM('Pending', 'Verified', 'Suspended') DEFAULT 'Pending',
    service_type VARCHAR(50), -- e.g., 'Health', 'Transport'
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Data Access Requests
CREATE TABLE IF NOT EXISTS access_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL, -- The Service Provider or Authority
    citizen_id INT NOT NULL,   -- The data owner
    purpose_code VARCHAR(50) NOT NULL,
    purpose_description TEXT,
    requested_scopes JSON, -- e.g. ["name", "email", "address"]
    status ENUM('Pending', 'Approved', 'Denied', 'Revoked') DEFAULT 'Pending',
    duration_days INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (citizen_id) REFERENCES users(id)
);

-- Active Consents (Approved Requests)
CREATE TABLE IF NOT EXISTS active_consents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT UNIQUE NOT NULL,
    citizen_id INT NOT NULL,
    service_id INT NOT NULL,
    granted_scopes JSON NOT NULL,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (request_id) REFERENCES access_requests(id),
    FOREIGN KEY (citizen_id) REFERENCES users(id)
);

-- Audit Logs (Immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actor_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- e.g. 'LOGIN', 'VIEW_DATA', 'REQUEST_ACCESS'
    target_resource VARCHAR(100),
    metadata JSON,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES users(id)
);

-- OTP Sessions Table (For Citizen Login)
CREATE TABLE IF NOT EXISTS otp_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mobile_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Two-Factor Sessions Table (For Entity Login)
CREATE TABLE IF NOT EXISTS two_factor_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actor_type ENUM('SERVICE', 'GOV') NOT NULL,
    actor_id VARCHAR(50) NOT NULL, -- e.g., ORG-123
    verification_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Data (Mock Users)
INSERT IGNORE INTO users (unique_id, role, full_name, email, password_hash) VALUES 
('9876543210', 'Citizen', 'Mahir Shah', 'mahir@example.com', 'hashed_secret'),
('ORG-HEALTH-01', 'Service Provider', 'City General Hospital', 'contact@cityhospital.com', 'hashed_secret'),
('GOV-RJ-TR-2025', 'Regulatory Authority', 'Rajasthan Transport Authority', 'admin@transport.rj.gov.in', 'hashed_secret');
