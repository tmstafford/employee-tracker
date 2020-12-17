USE employee_tracker;

INSERT INTO department (name)
VALUES ('Sales'), ('Engineering'), ('Finance'), ('Legal');

INSERT INTO role (title, salary, department_id)
VALUES ('Sales Lead', 100000, 1), ('Salesperson', 80000, 1),
('Lead Engineer', 150000, 2), ('Software Engineer', 120000, 2),
('Accountant', 125000, 3), ('Legal Team Lead', 250000, 4), 
('Lawyer', 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Nicholas', 'Jackson', 1, null), ('Paul', 'Houston', 3, null), ('Emma', 'Roberts', 4, 2), 
('Chloe', 'Perry', 6, null), ('Chanel', 'Palmer', 2, 1), ('Dallas', 'Chapman', 2, 1),
('Brendon', 'Small', 3, null), ('Juliet', 'Wall', 5, null);