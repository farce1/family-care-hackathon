CREATE TABLE IF NOT EXISTS pdf_files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_data BYTEA NOT NULL,
    metadata JSONB,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pdf_files_filename ON pdf_files(filename);
CREATE INDEX IF NOT EXISTS idx_pdf_files_uploaded_at ON pdf_files(uploaded_at);
