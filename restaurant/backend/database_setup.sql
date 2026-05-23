-- =========================================
-- RESTAURANT DATABASE PROJECT
-- =========================================

CREATE DATABASE restaurant_db;
GO

USE restaurant_db;
GO


-- =========================================
-- DROP OLD TABLES
-- =========================================

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu;
DROP TABLE IF EXISTS order_logs;
GO


-- =========================================
-- CREATE TABLES
-- =========================================

CREATE TABLE menu (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    category NVARCHAR(50),
    price DECIMAL(10,2),
    description NVARCHAR(MAX),
    available BIT DEFAULT 1
);

CREATE TABLE orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customer_name NVARCHAR(100),
    table_number INT,
    total_price DECIMAL(10,2),
    status NVARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE order_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT FOREIGN KEY REFERENCES orders(id),
    menu_id INT FOREIGN KEY REFERENCES menu(id),
    quantity INT
);

CREATE TABLE order_logs (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT,
    action_done NVARCHAR(100),
    action_time DATETIME DEFAULT GETDATE()
);

GO


-- =========================================
-- INSERT SAMPLE DATA
-- =========================================

INSERT INTO menu (name, category, price, description)
VALUES
('Burger', 'Fast Food', 5.99, 'Beef Burger'),
('Pizza', 'Italian', 8.99, 'Cheese Pizza'),
('Pasta', 'Italian', 6.50, 'Creamy Pasta'),
('Fries', 'Fast Food', 2.99, 'French Fries');

GO


-- =========================================
-- FUNCTION
-- =========================================

CREATE FUNCTION fn_TotalMenuItems()
RETURNS INT
AS
BEGIN
    DECLARE @total INT;

    SELECT @total = COUNT(*) FROM menu;

    RETURN @total;
END;

GO


-- TEST FUNCTION
SELECT dbo.fn_TotalMenuItems() AS Total_Items;
GO


-- =========================================
-- STORED PROCEDURE
-- =========================================

CREATE PROCEDURE sp_AddOrder
    @customer_name NVARCHAR(100),
    @table_number INT,
    @total_price DECIMAL(10,2)
AS
BEGIN
    INSERT INTO orders(customer_name, table_number, total_price)
    VALUES(@customer_name, @table_number, @total_price);

    PRINT 'Order Added Successfully';
END;

GO


-- EXECUTE PROCEDURE
EXEC sp_AddOrder 'Minhal', 5, 25.50;
GO


-- =========================================
-- TRY CATCH
-- =========================================

BEGIN TRY

    INSERT INTO orders(customer_name, table_number, total_price)
    VALUES('Ali', 2, 18.99);

    PRINT 'Inserted Successfully';

END TRY

BEGIN CATCH

    PRINT 'Error Occurred';

END CATCH

GO


-- =========================================
-- VIEW
-- =========================================

CREATE VIEW vw_MenuItems
AS
SELECT
    name,
    category,
    price
FROM menu;

GO


-- TEST VIEW
SELECT * FROM vw_MenuItems;
GO


-- =========================================
-- TRIGGER
-- =========================================

CREATE TRIGGER trg_OrderInsert
ON orders
AFTER INSERT
AS
BEGIN

    INSERT INTO order_logs(order_id, action_done)
    SELECT id, 'New Order Added'
    FROM inserted;

END;

GO


-- TEST TRIGGER
INSERT INTO orders(customer_name, table_number, total_price)
VALUES('Ahmed', 3, 30.00);

SELECT * FROM order_logs;
GO


-- =========================================
-- CURSOR
-- =========================================

DECLARE @itemName NVARCHAR(100);

DECLARE menu_cursor CURSOR FOR
SELECT name FROM menu;

OPEN menu_cursor;

FETCH NEXT FROM menu_cursor INTO @itemName;

WHILE @@FETCH_STATUS = 0
BEGIN

    PRINT @itemName;

    FETCH NEXT FROM menu_cursor INTO @itemName;

END

CLOSE menu_cursor;
DEALLOCATE menu_cursor;

GO


-- =========================================
-- FINAL TESTS
-- =========================================

SELECT * FROM menu;
SELECT * FROM orders;
SELECT * FROM order_logs;