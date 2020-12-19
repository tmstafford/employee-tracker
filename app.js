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

function viewEmployees() {
    const sql = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(e.first_name, ' ', e.last_name) AS manager FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id LEFT JOIN employee e ON employee.manager_id = e.id;";
    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
    });
};

function viewRoles() {
    const sql = "SELECT role.id, role.title, role.salary, department.name AS department FROM role INNER JOIN department ON role.department_id = department.id;";
    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
    });
};

function viewDepartments() {
    const sql = "SELECT * FROM department;";
    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
    });
};

viewDepartments();



/*
function promptMenu() {
    // main menu user prompt options, called after most functions 
    inquirer.prompt([
        {
            type: 'list',
            name: 'menu',
            message: 'What would you like to do?',
            choices: [
                'View All Employees',
                'View All Roles',
                'View All Departments',
                'Add Department',
                'Add Role',
                'Add Employee',
                'Update Employee'
            ]
        }
    ])
    .then((answer) => {
        // switch case depending on user choice to run specific function
        switch (answer.menu) {
            case 'View All Employees':

        }
    })
}
*/