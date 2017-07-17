let mysql = require('mysql');
let dbconfig = require('../config/localdb-config');
let bcrypt = require('bcrypt-nodejs');

let connection = mysql.createConnection(dbconfig.connection);

let adminUsername = "admin";
let adminPassword = "P@ssw0rd";

let adminPasswordHash = bcrypt.hashSync(adminPassword, null, null);

connection.query(`INSERT INTO ${dbconfig.database}.users ( username, role, password ) values ("${adminUsername}", "admin", "${adminPasswordHash}")`, function(err, rows) {
    if (err) {
        console.error("Couldn't create admin user!");
        console.error(err);
        connection.end();
        return;
    }

    console.log("Successfully created admin user!");
    connection.end();
});

