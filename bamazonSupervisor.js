require("dotenv").config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var keys = require("./keys.js")
const cTable = require('console.table');


var connection = mysql.createConnection(keys.mysqlkey);



bamazonSupervisor = {

    viewSales: function () {
        // produces table of sales

        connection.query(

            `SELECT d.department_id, d.department_name, d.over_head_costs, SUM(p.product_sales) AS total_sales, SUM(p.product_sales) - d.over_head_costs AS total_profit 
            FROM departments d LEFT JOIN products p 
            ON (d.department_name = p.department_name) 
            GROUP BY p.department_name 
            ORDER BY d.department_id ASC;`
            ,
            function (err, sales) {
                if (err) throw err;
                // Log all results of the SELECT statement
                console.log("\n")
                console.table(sales)
                connection.end();
            }

        );


        // connection.query(

        //     "SELECT ? AS total_profit FROM departments d LEFT JOIN products p ON (d.department_name = p.department_name)GROUP BY p.department_name ORDER BY d.department_id ASC;"
        //     ,

        //     "d.department_id, d.department_name, d.over_head_costs, SUM(p.product_sales) AS total_sales, SUM(p.product_sales) - d.over_head_costs",


        //     function (err, sales) {
        //         if (err) throw err;
        //         // Log all results of the SELECT statement
        //         console.table(sales)
        //         connection.end();
        //     }
        // ); 

    },

    addDepartmentInfo: function (callback) {
        // obtain info to be passed on to a callback which actually adds info to database

        inquirer.prompt([
            {
                // prompt for an userinput
                name: "name",
                message: "\nWhat is the department name?",
                validate: function (value) {
                    if (value) {
                        return true;
                    } else {
                        return "Please enter a department name."
                    }
                }
            },
            {
                name: "costs",
                message: "What is the over_head_cost of the department",
                validate: function (value) {
                    if (!isNaN(parseFloat(value)) && parseFloat(value) > 0) {
                        return true
                    } else {
                        return "Please enter a positive number"
                    }
                }
            }

        ]).then(function (department) {
            // has user confirms the department to be add dinformation
            console.log(
                "\n-------------Confirm This----------------" +
                "\ndepartment_name: " + department.name +
                "\nover_head_costs: " + department.costs +
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
                    callback(department.name, Number.parseFloat(department.costs).toFixed(2))
                } else {
                    // if user dont confirm than rerun the function
                    bamazonSupervisor.addDepartmentInfo(bamazonSupervisor.addDepartment);
                }
            })


        });


    },

    addDepartment: function (name, cost) {
        // intakes name and cost about department and update to database
        var query = connection.query(
            "INSERT INTO departments SET ?",
            {
                department_name: name,
                over_head_costs: cost
            },
            function (err, res) {
                console.log(name + " department has been added!\n");
                // Call updateProduct AFTER the INSERT completes
                connection.end()
            }
        );
    },

    manage: function () {
        inquirer.prompt([
            {
                // prompt for an userinput
                name: "option",
                message: "\nbamazon Manager what would you like to do",
                type: "list",
                choices: [
                    "View Product Sales by Department",
                    "Create New Department",
                    "Exit"
                ]
            },
        ]).then(function (response) {
            switch (response.option) {
                case "View Product Sales by Department":
                    bamazonSupervisor.viewSales();
                    break;
                case "Create New Department":
                    bamazonSupervisor.addDepartmentInfo(bamazonSupervisor.addDepartment);
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


bamazonSupervisor.manage();

