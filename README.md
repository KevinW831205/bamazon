# bamazon

##Instructions

Demo Video: https://drive.google.com/file/d/1chpZmecbeOBGcY7VV2Nv97sd1Ch9zoF2/view?usp=sharing

A node command line interface to access an item catalog of items for sale on bamazon. Catalog is stored in database on mysql.

There are three different apps to purchase from or manage the bamazon catalog:

1. bamazon.js
    * Intended use for the customer
    * Upon starting customer will be presented a catalog of items on sale
    * User than selects item which they would like to purchase and will be prompt the amount they would like to purchase
    * After the amount is selected it will return the user the total amount of the purchase, and update the catalog in the database
    
2. bamazonManager.js
    * Allows management of the catalog
    * Have 4 functions: Viewing the catalog, Viewinng items with low inventory, adding Inventory, adding a new product
    * Viewing the Catalog: returns the catalog to the user
    * Viewing Low Inventory: returns the items in the catalog that have stock quantity less than 5 inclusive
    * Adding Inventory: prompt user of an item to add stockk quantity to, and the amount to add. Then updates database.
    * Adding product: prompts user about information on item to add to product, then updates database.
        * note: can only add to existing departments

3. bamazonSupervisor.js
    * Allows viewing of sales by department and adding departments to bamazon.
    * Viewing sales by department will return a table that shows department, their overhead costs, total sales and profit(overhead cost - total sales)
    * Adding department prompts user for department infromation then adds department to database.
