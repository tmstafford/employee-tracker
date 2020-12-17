const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

// create connection to the database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'tatum91099',
    database: 'employee_tracker'
});

// test query
//connection.query('SELECT * FROM employee', function(err, res) {
//    console.table(res);
//});

connection.connect(function(err) {
    if (err) {
        console.log('Error connecting to DB');
        return;
    }
    console.log(`
    ----------------
    EMPLOYEE TRACKER
    ----------------
    `);
});