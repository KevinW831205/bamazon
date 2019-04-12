require("dotenv").config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var keys = require("./keys.js")

var connection = mysql.createConnection(keys.mysqlkey);



bamazonManager = {

    productCatalog: function (callback) {
        //function that obtains catalog from mySQL and displays it to console. also passes catalog to call back function
        console.log("List of Products:\n---------------");
        connection.query("SELECT * FROM products", function (err, catalog) {
            if (err) throw err;
            // Log all results of the SELECT statement
            for (var i = 0; i < catalog.length; i++) {
                console.log(
                    "Item ID: " + catalog[i].item_id +
                    "\nProduct Name: " + catalog[i].product_name +
                    "\nDepartment: " + catalog[i].department_name +
                    "\nPrice: " + catalog[i].price +
                    "\nStock Remaing: " + catalog[i].stock_quantity +
                    "\n---------------"
                )
            }

            if (callback) {
                callback(catalog);
            } else {
                connection.end()
            }
        });
    },

    lowInventory: function () {
        // function that displays items where stock_quantity is less than 5
        connection.query("SELECT * FROM products WHERE stock_quantity<=5",
            function (err, catalog) {
                if (err) throw err;
                // Log all results of the SELECT statement
                for (var i = 0; i < catalog.length; i++) {
                    console.log(
                        "Item ID: " + catalog[i].item_id +
                        "\nProduct Name: " + catalog[i].product_name +
                        "\nDepartment: " + catalog[i].department_name +
                        "\nPrice: " + catalog[i].price +
                        "\nStock Remaing: " + catalog[i].stock_quantity +
                        "\n---------------"
                    )
                }
                connection.end();
            });
    },

    chooseInventorytoAdd: function (catalog) {
        //function that takes in the catalog and prompts user to input the item in the catalog to modify

        // choiceArr that stores the item_id of the catalog Array to be used for validation referenced when confirming purchase
        var choiceArr = ["0"];
        inquirer.prompt([
            {
                name: "item_id",
                message: "What is the Item ID of the product to add to? (0 to exit)",
                validate: function (value) {
                    //vaidate for existing item_id in catalog or 0 which is to exit
                    for (var i = 0; i < catalog.length; i++) {
                        choiceArr.push(catalog[i].item_id.toString());
                    }
                    if (choiceArr.includes(value)) {
                        return true;
                    } else {
                        return "Please select an existing Item ID"
                    }

                }   //end validation

            },
        ]).then(function (response) {
            if (response.item_id === "0") {
                //exit
                console.log("Session ended")
                connection.end();
            } else {
                //passes the information about choosen item to the function that adds the item to database quantity -1 because of the 0 in choice array
                bamazonManager.addtoInventory(choiceArr.indexOf(response.item_id) - 1, response.item_id, catalog)
            }
        });
    },

    addtoInventory: function (item_index, item_id, catalog) {
        //takes in the user choosen item index and id information and the catalog prompts user for the item quantity to add
        inquirer.prompt([
            {
                name: "quantity",
                message: "How many of " + catalog[item_index].product_name + " would you like to add? (0 to exit)",
                validate: function (value) {
                    //validate purchase quantity is positive and is integer
                    if (Number.isInteger(parseFloat(value)) && parseFloat(value) >= 0) {
                        return true;
                    } else {
                        return "please enter a positive integer, or 0 to exit"
                    }
                }
            }
        ]).then(function (response) {
            if (response.quantity == 0) {
                console.log("Session ended");
                connection.end();
            } else {
                var query = connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            //update quantity
                            stock_quantity: parseInt(catalog[item_index].stock_quantity) + parseInt(response.quantity)
                        },
                        {
                            item_id: parseInt(item_id)
                        }
                    ],
                    function (err, res) {
                        // return purchase quantity and total
                        console.log("A total of " + response.quantity + " " + catalog[item_index].product_name + " was added")
                        console.log("There are a total of " + catalog[item_index].stock_quantity + " " + catalog[item_index].product_name + " in stock.");
                        connection.end();
                    }
                );
            }

        })
    },

    addProductInformation: function (callback) {
        //function that prompts user for the product information to be passed on to the callback which adds the information to database
        var departmentArr = [];
        var query = connection.query(
            "SELECT department_name FROM departments",
            function (err, departments) {
                for (var i = 0; i < departments.length; i++) {
                    departmentArr.push(departments[i].department_name)
                }
            }
        );
        inquirer.prompt([
            {
                // prompt for an userinput
                name: "name",
                message: "\nWhat is the product name?",
                validate: function (value) {
                    if (value) {
                        return true
                    } else {
                        return "Please enter a product"
                    }
                }
            },
            {
                name: "department",
                message: "\nWhat department is the product in?",
                type: "list",
                choices: departmentArr
                // validate: function (value) {
                //     if (value) {
                //         return true
                //     } else {
                //         return "Please enter a department name"
                //     }
                // }
            },
            {
                name: "price",
                message: "\nWhat is the price of the product?",
                validate: function (value) {
                    if (!isNaN(parseFloat(value)) && parseFloat(value) > 0) {
                        return true
                    } else {
                        return "Please enter a positive number"
                    }
                }
            },
            {
                name: "stock",
                message: "\nHow much stock does the product have?",
                validate: function (value) {
                    if (Number.isInteger(parseInt(value)) && parseInt(value) >= 0) {
                        return true
                    } else {
                        return "Enter a postive intger"
                    }
                }
            }
        ]).then(function (product) {
            // confirmation of the product to be added
            console.log(
                "\n-------------Confirm This----------------" +
                "\nproduct_name: " + product.name +
                "\ndepartment_name: " + product.department +
                "\nprice: " + product.price +
                "\nstock_quantity: " + product.stock +
                "\n-----------------------------------------"

            )
            inquirer.prompt([
                {
                    name: "confirm",
                    message: "Confirm product to-add's information",
                    type: "confirm",
                    default: true
                }
            ]).then(function (response) {
                if (response.confirm) {
                    callback(product.name, product.department, Number.parseFloat(product.price).toFixed(2), product.stock);
                } else {
                    // if user dont confirm than rerun the function
                    bamazonManager.addProductInformation(bamazonManager.addProduct);
                }
            })
        });
    },

    addProduct: function (name, department, price, stock) {
        // function that in takes name department price and stock info and updates to database
        var query = connection.query(
            "INSERT INTO products SET ?",
            {
                product_name: name,
                department_name: department,
                price: price,
                stock_quantity: stock
            },
            function (err, res) {
                console.log("Product " + name + " is now for sale!\n");
                connection.end()
            }
        );

    },

    returnValue: function (value) {
        console.log(value);
        return value
    },

    manage: function () {
        inquirer.prompt([
            {
                // prompt for an userinput
                name: "option",
                message: "\nbamazon Manager what would you like to do",
                type: "list",
                choices: [
                    "View Products for Sale",
                    "View Low Inventory",
                    "Add to Inventory",
                    "Add New Product",
                    "Exit"
                ]
            },
        ]).then(function (response) {
            switch (response.option) {
                case "View Products for Sale":
                    bamazonManager.productCatalog();
                    break;
                case "View Low Inventory":
                    bamazonManager.lowInventory();

                    break;

                case "Add to Inventory":
                    bamazonManager.productCatalog(bamazonManager.chooseInventorytoAdd);

                    break;

                case "Add New Product":
                    bamazonManager.addProductInformation(bamazonManager.addProduct);
                    break;
                case "Exit":
                    console.log("Session Ended")
                    break;

                default:
                    console.log("error")
            }
        });

    }


}

bamazonManager.manage()

// console.log(bamazonManager.getDepartments())
