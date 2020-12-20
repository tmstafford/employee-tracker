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
                'Update Employee',
                'Update Employee Manager',
                'Remove Employee',
                'Remove Department',
                'Remove Role'
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
            case 'Update Employee':
                updateEmployee();
                break;
            case 'Update Employee Manager':
                updateManager();
                break;
            case 'Remove Employee':
                deleteEmployee();
                break;
            case 'Remove Department':
                deleteDepartment();
                break;
            case 'Remove Role':
                deleteRole();
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

// function to return department name for add Role
let departmentChoices = [];
function selectDepartment() {
    connection.query("SELECT * FROM department", function(err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            departmentChoices.push(res[i].name);
        }
    })
    return departmentChoices;
};


// function to return role titles for add employee
let roleChoices = [];
function selectRole() {
    connection.query("SELECT * FROM role", function(err, res) {
        if (err) throw err;
        for (let i=0; i < res.length; i++) {
            roleChoices.push(res[i].title);
        }
    })
    return roleChoices;
};

// function to return managers for add employee
let employeeChoices = [];
function selectEmployee() {
    connection.query("SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM employee", function(err, res) {
        if (err) throw err;
        for (let i=0; i < res.length; i++) {
            employeeChoices.push(res[i].full_name);
        }
    })
    return employeeChoices;
};

// function to add role (title, salary, department_id) and add to database
function addRole() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: "Enter Role Title: "
        },
        {
            type: 'input',
            name: 'salary',
            message: "Enter Role Salary: "
        },
        {
            type: 'list',
            name: 'roleDepartment',
            message: "Select the Department: ",
            choices: selectDepartment()
        }
    ])
    .then(function(answers) {
        let departmentId = selectDepartment().indexOf(answers.roleDepartment) + 1;
        const sql = "INSERT INTO role (title, salary, department_id) VALUES (?,?,?)";
        const params = [answers.name, answers.salary, departmentId];
        connection.query(sql, params, (err, res) => {
            if (err) throw err;
            console.log(`Added New Role: ${answers.name}.`);
            promptMenu();
        });
    });
};

// function to add new employee (first_name, last_name, role_id, manager_id) and add to database
function addEmployee() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: "Enter Employee's First Name: "
        },
        {
            type: 'input',
            name: 'lastName',
            message: "Enter Employee's Last Name: "
        },
        {
            type: 'list',
            name: 'role',
            message: "Select the Employee's Role: ",
            choices: selectRole()
        },
        {
            type: 'list',
            name: 'manager',
            message: "Select the Employee's Manager: ",
            choices: selectEmployee()
        }
    ])
    .then(function(answers) {
        let roleId = selectRole().indexOf(answers.role) + 1;
        let managerid = selectEmployee().indexOf(answers.manager) + 1;
        const sql = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)";
        const params = [answers.firstName, answers.lastName, roleId, managerid];
        connection.query(sql, params, (err, res) => {
            if (err) throw err;
            console.log(`Added New Employee: ${answers.firstName} ${answers.lastName}`);
            promptMenu();
        });
    });
};

function updateEmployee() {
    const sql = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(e.first_name, ' ', e.last_name) AS manager FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id LEFT JOIN employee e ON employee.manager_id = e.id;";
    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);

        inquirer.prompt([
            {
                type: 'input',
                name: 'id',
                message: "Enter the ID of the Employee you would like to update: "
            },
            {
                type: 'list',
                name: 'role',
                message: "Select the Employee's New Role Title: ",
                choices: selectRole()
            }
        ])
        .then(function(answers) {
            let roleId = selectRole().indexOf(answers.role) + 1;
            const query = "UPDATE employee SET role_id = ?, manager_id = null WHERE id = ?";
            const params = [roleId, answers.id];
            connection.query(query, params, (err, res) => {
                if (err) throw err;
                console.log(`Updated Employee (ID: ${answers.id}) Role`);
                promptMenu();
            });
        });
    }); 
};

// function to update employee's manager
function updateManager() {
    const sql = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(e.first_name, ' ', e.last_name) AS manager FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id LEFT JOIN employee e ON employee.manager_id = e.id;";
    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);

        inquirer.prompt([
            {
                type: 'input',
                name: 'id',
                message: "Enter the ID of the Employee you would like to update: "
            },
            {
                type: 'list',
                name: 'manager',
                message: "Select the Employee's New Manager: ",
                choices: selectEmployee()
            }
        ])
        .then(function(answers) {
            let managerId = selectEmployee().indexOf(answers.manager) + 1;
            const query = "UPDATE employee SET manager_id = ? WHERE id = ?";
            const params = [managerId, answers.id];
            connection.query(query, params, (err, res) => {
                if (err) throw err;
                console.log(`Updated Employee (ID: ${answers.id}) Manager`);
                promptMenu();
            });
        });
    }); 
};

// function to delete an employee
function deleteEmployee() {
    const sql = "SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(e.first_name, ' ', e.last_name) AS manager FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id LEFT JOIN employee e ON employee.manager_id = e.id;";
    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);

        inquirer.prompt([
            {
                type: 'input',
                name: 'id',
                message: "Enter the ID of the Employee you would like to delete: "
            }
        ])
        .then((answer) => {
            const query = "DELETE FROM employee WHERE id = ?";
            const params = [answer.id];
            connection.query(query, params, (err, res) => {
                if (err) throw err;
                console.log(`Employee (ID: ${answer.id}) Removed.`);
                promptMenu();
            });
        });
    });
};

// function to delete a department 
function deleteDepartment() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'deleteDept',
            message: "Select the Department you would like to delete: ",
            choices: selectDepartment()
        }
    ])
    .then(function(answers) {
        let departmentId = selectDepartment().indexOf(answers.deleteDept) + 1;
        const sql = "DELETE FROM department WHERE id = ?";
        const params = [departmentId];
        connection.query(sql, params, (err, res) => {
            if (err) throw err;
            console.log(`Department (ID: ${departmentId}) Deleted`);
            promptMenu();
        });
    });
};

// function to delete a role
function deleteRole() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'deleteRole',
            message: "Select the Role you would like to delete: ",
            choices: selectRole()
        }
    ])
    .then(function(answers) {
        let roleId = selectRole().indexOf(answers.deleteRole) + 1;
        const sql = "DELETE FROM role WHERE id = ?";
        const params = [roleId];
        connection.query(sql, params, (err, res) => {
            if (err) throw err;
            console.log(`Role (ID: ${roleId}) Deleted`);
            promptMenu();
        });
    });
};