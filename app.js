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
    promptMenu();
});

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
                viewEmployees();
                break;
            case 'View All Roles':
                viewRoles();
                break;
            case 'View All Departments':
                viewDepartments();
                break;
            case 'Add Department':
                addDepartment();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'Add Employee':
                addEmployee();
                break;
        }
    })
};

// function to view table of all employees
function viewEmployees() {
    const sql = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(e.first_name, ' ', e.last_name) AS manager FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id LEFT JOIN employee e ON employee.manager_id = e.id;";
    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        promptMenu();
    });
};

// function to view table of all roles
function viewRoles() {
    const sql = "SELECT role.id, role.title, role.salary, department.name AS department FROM role INNER JOIN department ON role.department_id = department.id;";
    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        promptMenu();
    });
};

// function to view table of all departments
function viewDepartments() {
    const sql = "SELECT * FROM department;";
    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        promptMenu();
    });
};

// function to add a department and add to database
function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: 'Enter Department Name: '
        }
    ])
    .then((answer) => {
        const sql = "INSERT INTO department (name) VALUES (?)";
        const params = [answer.departmentName];
        connection.query(sql, params, (err, res) => {
            if (err) throw err;
            console.log(`Added New Department: ${answer.departmentName}.`)
            promptMenu();
        });
    })
};

// function to add a role (role title, salary, department) and add to database
function addRole() {
    connection.query("SELECT * FROM department", function (err, res) {
        if (err) throw err;
        const departmentList = res.map(({ id, name }) => ({
            value: id,
            name: `${id} ${name}`
        }));

        inquirer.prompt([
            {
                type: 'input',
                name: 'roleName',
                message: 'Enter Role Title: '
            },
            {
                type: 'input',
                name: 'roleSalary',
                message: 'Enter Role Salary: '
            },
            {
                type: 'list',
                name: 'roleDepartment',
                message: 'Select the Department:',
                choices: departmentList
            }
        ])
        .then((answers) => {
            const sql = "INSERT INTO role (title, salary, department_id) VALUES (?,?,?)";
            const params = [answers.roleName, answers.roleSalary, answers.roleDepartment];
            connection.query(sql, params, (err, res) => {
                if (err) throw err;
                console.log(`Added New Role: ${answers.roleName}.`);
                promptMenu();
            });
        });
    });
};

// function to add new employee (first name, last name, role title, manager) and add to database
function addEmployee() {
    let roleChoices = [];
    connection.query("SELECT id, title FROM role", (err, res) => {
        if (err) throw err;
        res.forEach((element) => {
            roleChoices.push(`${element.id} ${element.title}`);
        });

        let managerChoices = [];
        connection.query("SELECT id, first_name, last_name FROM employee", (err, res) => {
            if (err) throw err;
            res.forEach((element) => {
                managerChoices.push(`${element.id} ${element.first_name} ${element.last_name}`);
            });

            inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: "Enter the employee's first name:"
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: "Enter the employee's last name:"
                },
                {
                    type: 'list',
                    name: 'role',
                    message: "Select the employee's role:",
                    choices: roleChoices
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: "Select the employee's manager:",
                    choices: managerChoices
                }
            ])
            .then((answers) => {
                let roleId = parseInt(answers.role);
                let managerId = parseInt(answers.manager);
                const sql = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)";
                const params = [answers.firstName, answers.lastName, roleId, managerId];
                connection.query(sql, params, (err, res) => {
                    if (err) throw err;
                    console.log(`Added New Employee: ${answers.firstName} ${answers.lastName}`);
                    promptMenu();
                });
            });
        });
    });
};

