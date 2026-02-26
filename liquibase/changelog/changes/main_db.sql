-- Adminer 5.4.1 MySQL 8.0.44 dump
-- ----------------------------
-- Table structure for invoices
-- ----------------------------
CREATE TYPE document_type AS ENUM (
    'INVOICE',
    'DELIVERY_NOTE',
    'CREDIT_NOTE',
    'DEBIT_NOTE'
);
CREATE TABLE fiscal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    type document_type NOT NULL,
    related_document_id UUID REFERENCES fiscal_documents(id),
    series VARCHAR(10) NOT NULL,
    consecutive_number INTEGER NOT NULL,
    control_number VARCHAR(20),
    fiscal_serial VARCHAR(50),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'ISSUED',
    currency_code VARCHAR(3) NOT NULL,
    exchange_rate DECIMAL(10, 4) NOT NULL,
    subtotal_amount DECIMAL(15, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) NOT NULL,
    igtf_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Index para búsquedas rápidas por tenant y tipo
CREATE INDEX idx_documents_tenant_type ON fiscal_documents(tenant_id, type);
CREATE TABLE document_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES fiscal_documents(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    code VARCHAR(50),
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(12, 3) NOT NULL,
    unit_price DECIMAL(16, 2) NOT NULL,
    discount_amount DECIMAL(16, 2) DEFAULT 0,
    tax_type VARCHAR(20) NOT NULL,
    tax_rate DECIMAL(5, 2) NOT NULL,
    subtotal DECIMAL(16, 2) NOT NULL,
    tax_amount DECIMAL(16, 2) NOT NULL,
    total DECIMAL(16, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_items_document ON document_items(document_id);
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rif VARCHAR(20) UNIQUE NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    fiscal_address TEXT NOT NULL,
    is_special_taxpayer BOOLEAN DEFAULT FALSE,
    fiscal_provider_token TEXT,
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE exchange_rates (
    id SERIAL PRIMARY KEY,
    rate_date DATE NOT NULL UNIQUE,
    rate_value DECIMAL(10, 4) NOT NULL,
    source VARCHAR(50) DEFAULT 'BCV',
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    doc_type VARCHAR(5) NOT NULL,
    doc_number VARCHAR(20) NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    UNIQUE(tenant_id, doc_type, doc_number)
);
CREATE TABLE document_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    document_type document_type NOT NULL,
    series VARCHAR(10) DEFAULT 'A',
    current_value INTEGER DEFAULT 0,
    UNIQUE(tenant_id, document_type, series)
);
CREATE TABLE fiscal_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    period DATE NOT NULL,
    book_type VARCHAR(10) NOT NULL,
    total_sales DECIMAL(15, 2) DEFAULT 0,
    total_tax_collected DECIMAL(15, 2) DEFAULT 0,
    total_igtf_collected DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'OPEN',
    generated_file_url TEXT,
    closed_at TIMESTAMP,
    closed_by UUID
);