-- Create the users_account table
CREATE TABLE users_account (
    id UUID PRIMARY KEY,
    full_names VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    gender VARCHAR(20),
    date_of_birth DATE,
    home_address TEXT,
    cellphone VARCHAR(50),
    user_number VARCHAR(20),
    role INTEGER DEFAULT 3,
    encryptedPass VARCHAR(255),
    salt VARCHAR(255),
    confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    profile_picture TEXT
);

-- Create the loan_applications table
CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    id_number VARCHAR(20),
    gender VARCHAR(20),
    dob DATE,
    address TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    bank VARCHAR(100),
    account_number VARCHAR(100),
    purpose VARCHAR(100),
    due_date DATE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the approved_loans table
CREATE TABLE approved_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_application_id UUID REFERENCES loan_applications(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    id_number VARCHAR(20),
    gender VARCHAR(20),
    dob DATE,
    address TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    bank VARCHAR(100),
    account_number VARCHAR(100),
    purpose VARCHAR(100),
    due_date DATE,
    status BOOLEAN DEFAULT true,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the rejected_loans table
CREATE TABLE rejected_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_application_id UUID REFERENCES loan_applications(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    id_number VARCHAR(20),
    gender VARCHAR(20),
    dob DATE,
    address TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    bank VARCHAR(100),
    account_number VARCHAR(100),
    purpose VARCHAR(100),
    due_date DATE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the investments table
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    id_number VARCHAR(20),
    address TEXT,
    bank VARCHAR(100),
    account_number VARCHAR(100),
    amount_investing DECIMAL(10, 2) NOT NULL,
    amount_to_receive DECIMAL(10, 2) NOT NULL,
    investment_period INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT false,
    is_confirmed BOOLEAN DEFAULT false,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the stokvela_members table
CREATE TABLE stokvela_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    cellphone VARCHAR(50),
    date_of_birth DATE,
    account_name VARCHAR(100),
    account_number VARCHAR(100),
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    amount_to_receive DECIMAL(10, 2) DEFAULT 0,
    receiving_date DATE,
    user_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the backend_users table (admin users)
CREATE TABLE backend_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the system_settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial system settings
INSERT INTO system_settings (setting_key, setting_value) VALUES 
('account_number', 'Account number :10197101966   (Standard bank)   account holder: Green Loan'),
('email', 'greenservice.loan@gmail.com'),
('phone_number', '+27 640 5195 93'),
('message', 'It''s good to Invest in greenVest');
