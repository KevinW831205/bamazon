USE bamazon_db;

TRUNCATE TABLE products;
TRUNCATE TABLE departments;

INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES ("coke_355mL","drinks",1.29,3000);
INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES ("coke_500mL","drinks",1.59,3000);
INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES ("coke_1L","drinks",1.99,3000);
INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES ("coke_2L","drinks",3.59,3000);
INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES ("orange_juice_500mL","drinks",1.99,3000);
-- 5 items 
INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES ("lays_original_Reg","snacks",1.99,5);
INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES ("lays_BBQ_Reg","snacks",1.99,5);
INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES ("lays_original_Family","snacks",3.99,3000);
INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES ("lays_BBQ_Family","snacks",3.99,3000);
INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES ("doritos_original_Reg","snacks",1.99,3000);

INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES ("doritos_original_Reg","random",1.99,3000);



INSERT INTO departments(department_name,over_head_costs) VALUES("snacks",1500);
INSERT INTO departments(department_name,over_head_costs) VALUES("drinks",1500);
INSERT INTO departments(department_name,over_head_costs) VALUES("electronics",1500);


SELECT * FROM products;
SELECT * FROM departments;

SELECT d.department_id, d.department_name, d.over_head_costs, SUM(p.product_sales) AS total_sales, SUM(p.product_sales) - d.over_head_costs AS total_profit
FROM departments d LEFT JOIN products p ON (d.department_name = p.department_name)
GROUP BY p.department_name 
ORDER BY d.department_id ASC;

