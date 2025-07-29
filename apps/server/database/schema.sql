-- Create the tables with the improved structure

-- User table (must be created first as other tables reference it)
CREATE TABLE "user" (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for user table
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_username ON "user"(username);
CREATE INDEX idx_user_active ON "user"(is_active);

-- Category table (for product categorization)
CREATE TABLE category (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_category_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_category_id) REFERENCES category(category_id)
);

-- Product table
CREATE TABLE product (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category_id UUID,
    sku VARCHAR(100) UNIQUE,
    weight DECIMAL(8,2),
    dimensions JSONB, -- Store as {"length": 10, "width": 5, "height": 2}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);

-- Add indexes for product
CREATE INDEX idx_product_category ON product(category_id);
CREATE INDEX idx_product_active ON product(is_active);
CREATE INDEX idx_product_price ON product(price);
CREATE INDEX idx_product_stock ON product(stock);
CREATE INDEX idx_product_sku ON product(sku);

-- Addresses table
-- CREATE TABLE addresses (
--     addressId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     userId UUID NOT NULL,
--     addressType VARCHAR(20) DEFAULT 'shipping', -- 'shipping', 'billing', 'both'
--     firstName VARCHAR(100),
--     lastName VARCHAR(100),
--     company VARCHAR(100),
--     street VARCHAR(255) NOT NULL,
--     street2 VARCHAR(255),
--     city VARCHAR(100) NOT NULL,
--     state VARCHAR(100) NOT NULL,
--     zipCode VARCHAR(20) NOT NULL,
--     country VARCHAR(100) NOT NULL DEFAULT 'US',
--     isDefault BOOLEAN DEFAULT false,
--     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (userId) REFERENCES user(userId) ON DELETE CASCADE
-- );

-- -- Add indexes for addresses
-- CREATE INDEX idx_addresses_user ON addresses(userId);
-- CREATE INDEX idx_addresses_default ON addresses(userId, isDefault);

-- Cart table (simplified, no orderItems array)
CREATE TABLE cart (
    cart_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id)
);

-- CartItems table (separate table for cart items)
CREATE TABLE cart_item (
    cart_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES cart(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id),
    UNIQUE(cart_id, product_id) -- Prevent duplicate product in same cart
);

-- Order table (simplified, no orderItems array)
CREATE TABLE "order" (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id)
);

-- OrderItems table (separate table for order items)
CREATE TABLE order_item (
    order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time DECIMAL(10,2) NOT NULL, -- Store price when order was placed
    FOREIGN KEY (order_id) REFERENCES "order"(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- Indexes for better performance
CREATE INDEX idx_cart_item_cart_id ON cart_item(cart_id);
CREATE INDEX idx_cart_item_product_id ON cart_item(product_id);
CREATE INDEX idx_order_item_order_id ON order_item(order_id);
CREATE INDEX idx_order_item_product_id ON order_item(product_id);

-- Function to automatically update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updatedAt updates
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_updated_at BEFORE UPDATE ON category
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_updated_at BEFORE UPDATE ON product
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_updated_at BEFORE UPDATE ON "order"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
