let mysql = require('mysql');
let dbconfig = require('../config/database');

let connection = mysql.createConnection(dbconfig.connection);

// Create development database
connection.query('\
    CREATE TABLE `' + dbconfig.database + '`.`' + 'users' + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `username` VARCHAR(20) NOT NULL, \
    `role` VARCHAR(20) NOT NULL, \
    `password` CHAR(60) NOT NULL, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `username_UNIQUE` (`username` ASC) )',
    function(err) {
        if (err) {
            console.error("Couldn't create dev Users table!");
            console.error(err);
            connection.end();
            return;
        }

        connection.query(`CREATE TABLE ${dbconfig.database}.expenses (id VARCHAR(50), date BIGINT, username VARCHAR(20), role VARCHAR(20), amount DOUBLE, description TEXT)`, function(err) {
            if (err) {
                console.error("Couldn't create dev Expenses table!");
                console.error(err);
                connection.end();
                return;
            }

            console.log("Successfully created development database!");
            connection.end();
        })
    });


