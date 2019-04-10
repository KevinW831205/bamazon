/* Office hours: 
gitignore
using env to hide connection?
simplifying query for view sales
 */

require("dotenv").config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var keys = require("./keys.js")

var connection = mysql.createConnection(keys.mysqlkey);



var bamazon = {

    productCatalog: function () {
        //function that obtains catalog from mySQL and displays it to console.
        console.log("List of our Products:\n---------------");
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


            bamazon.chooseItemID(catalog)

        });
    },

    chooseItemID: function (catalog) {
        //function that take in the catalog from mysql and prompts user to choose product to buy

        // choiceArr that stores the item_id of the catalog Array to be used for validation referenced when confirming purchase
        var choiceArr = ["0"];
        inquirer.prompt([
            {
                name: "item_id",
                message: "What is the Item ID of the product you want to purchase? (0 to not purchase anything)",
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
                console.log("Thank you for visiting bamazon")
                connection.end();
            } else {
                //continue to prompt purchase quantity -1 because of the 0 in choice array
                bamazon.purchaseItemID(choiceArr.indexOf(response.item_id) - 1, response.item_id, catalog)
            }
        });

    },

    purchaseItemID: function (item_index, item_id, catalog) {
        //function that prompts user for their purchase quantity of the items, intake argument item_index, item_id, the catalog
        //note item_index is the index of array in catalog array returned from mysql different from item_id that is on mysql
        inquirer.prompt([
            {
                name: "quantity",
                message: "How many of " + catalog[item_index].product_name + " would you like to purchase? (0 to cancel purchase)",
                validate: function (value) {
                    //validate purchase quantity is positive and is integer
                    if (Number.isInteger(parseFloat(value)) && parseFloat(value) >= 0) {
                        return true;
                    } else {
                        return "please enter a positive integer, or 0 to cancel purchase"
                    }
                }
            }
        ]).then(function (response) {
            if (response.quantity == 0) {
                console.log("transaction canceled");
                connection.end();
            } else {
                //Check if enough stock
                if (catalog[item_index].stock_quantity >= response.quantity) {
                    var query = connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                //update quantity
                                stock_quantity: parseInt(catalog[item_index].stock_quantity) - parseInt(response.quantity),
                                product_sales: parseInt(catalog[item_index].product_sales) + (parseInt(response.quantity) * parseFloat(catalog[item_index].price))
                            },
                            {
                                item_id: parseInt(item_id)
                            }
                        ],
                        function (err, res) {
                            // return purchase quantity and total
                            console.log("Your purchased a total of " + response.quantity + " " + catalog[item_index].product_name + " at the price of " + catalog[item_index].price)
                            console.log("Your total comes to: " + parseFloat(catalog[item_index].price) * parseInt(response.quantity));
                            connection.end();
                        }
                    );

                } else {
                    // response if insufficient stock
                    console.log("We do not have enough of " + catalog[item_index].product_name + ". There are only " + catalog[item_index].stock_quantity + " left in stock.")
                    connection.end();
                }


            }

        })

    }

}

bamazon.productCatalog()
