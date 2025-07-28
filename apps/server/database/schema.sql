-- Create the tables with the improved structure

-- User table (must be created first as other tables reference it)
CREATE TABLE "user" (
    userId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    phone VARCHAR(20),
    isActive BOOLEAN DEFAULT true,
    isEmailVerified BOOLEAN DEFAULT false,
    lastLoginAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for user table
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_username ON "user"(username);
CREATE INDEX idx_user_active ON "user"(isActive);

-- Category table (for product categorization)
CREATE TABLE category (
    categoryId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parentCategoryId UUID,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parentCategoryId) REFERENCES category(categoryId)
);

-- Product table
CREATE TABLE product (
    productId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    categoryId UUID,
    sku VARCHAR(100) UNIQUE,
    weight DECIMAL(8,2),
    dimensions JSONB, -- Store as {"length": 10, "width": 5, "height": 2}
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES category(categoryId)
);

-- Add indexes for product
CREATE INDEX idx_product_category ON product(categoryId);
CREATE INDEX idx_product_active ON product(isActive);
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
    cartId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES "user"(userId)
);

-- CartItems table (separate table for cart items)
CREATE TABLE cart_item (
    cartItemId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cartId UUID NOT NULL,
    productId UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cartId) REFERENCES cart(cartId) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES product(productId),
    UNIQUE(cartId, productId) -- Prevent duplicate product in same cart
);

-- Order table (simplified, no orderItems array)
CREATE TABLE "order" (
    orderId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES "user"(userId)
);

-- OrderItems table (separate table for order items)
CREATE TABLE order_item (
    orderItemId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orderId UUID NOT NULL,
    productId UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    priceAtTime DECIMAL(10,2) NOT NULL, -- Store price when order was placed
    FOREIGN KEY (orderId) REFERENCES "order"(orderId) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES product(productId)
);

-- Indexes for better performance
CREATE INDEX idx_cart_item_cart_id ON cart_item(cartId);
CREATE INDEX idx_cart_item_product_id ON cart_item(productId);
CREATE INDEX idx_order_item_order_id ON order_item(orderId);
CREATE INDEX idx_order_item_product_id ON order_item(productId);

-- Function to automatically update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
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

CREATE TRIGGER update_cart2_updated_at BEFORE UPDATE ON cart
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order2_updated_at BEFORE UPDATE ON "order"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
