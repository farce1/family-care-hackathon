-- PostgreSQL Database Schema for Family Care Application
-- Generated from mock data analysis

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Families table
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table (for authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Family Members table
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    avatar TEXT,
    initials VARCHAR(10),
    date_of_birth DATE,
    blood_type VARCHAR(10),
    allergies TEXT[], -- PostgreSQL array type for storing allergies
    accent_color VARCHAR(20) CHECK (accent_color IN ('orange', 'amber')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Files table (stores complete file data in database)
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    file_data BYTEA NOT NULL, -- Binary data for the complete file
    file_size BIGINT NOT NULL, -- File size in bytes
    mime_type VARCHAR(255),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    family_member_name VARCHAR(255) NOT NULL,
    facility_name VARCHAR(500) NOT NULL,
    facility_address TEXT,
    appointment_type VARCHAR(50) NOT NULL CHECK (appointment_type IN (
        'General Checkup',
        'Dental',
        'Vision',
        'Specialist',
        'Vaccination',
        'Follow-up',
        'Emergency',
        'Lab Work',
        'Physical Therapy',
        'Mental Health',
        'Veterinary'
    )),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN (
        'upcoming',
        'completed',
        'cancelled',
        'rescheduled',
        'no-show'
    )),
    notes TEXT,
    doctor_name VARCHAR(255),
    duration INTEGER, -- in minutes
    reminder BOOLEAN DEFAULT false,
    accent_color VARCHAR(20) CHECK (accent_color IN ('orange', 'amber')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_family ON users(family_id);

CREATE INDEX idx_family_members_family ON family_members(family_id);

CREATE INDEX idx_files_user ON files(user_id);
CREATE INDEX idx_files_date ON files(date DESC);

CREATE INDEX idx_appointments_family_member ON appointments(family_member_id);
CREATE INDEX idx_appointments_date_time ON appointments(date_time);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update_updated_at trigger to all tables
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE families IS 'Stores family information';
COMMENT ON TABLE users IS 'User authentication and account information - belongs to a family';
COMMENT ON TABLE family_members IS 'Stores family member information including humans and pets';
COMMENT ON TABLE files IS 'Stores complete file data in database (medical documents, images, etc.)';
COMMENT ON TABLE appointments IS 'Stores medical appointments for family members';

COMMENT ON COLUMN users.family_id IS 'Reference to the family this user belongs to';
COMMENT ON COLUMN family_members.allergies IS 'Array of allergy strings';
COMMENT ON COLUMN files.file_data IS 'Complete file stored as binary data';
COMMENT ON COLUMN files.file_size IS 'File size in bytes';
COMMENT ON COLUMN appointments.duration IS 'Appointment duration in minutes';
COMMENT ON COLUMN appointments.reminder IS 'Whether to send appointment reminder';
