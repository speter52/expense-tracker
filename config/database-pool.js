var mysql = require('mysql');

module.exports = {};

var dbConnectionProperties;

// If running in cloud, read database properties from environment variables set by cloud foundry
if (process.env.VCAP_SERVICES) {
    var cloudDbCredentials = JSON.parse(process.env.VCAP_SERVICES).cleardb[0].credentials;

    dbConnectionProperties = {
        connectionLimit: 3, // Pivotal Cloudfoundry MySQL Free Plan restriction
        host: cloudDbCredentials.hostname,
        user: cloudDbCredentials.username,
        password: cloudDbCredentials.password,
        database: cloudDbCredentials.name
    };
}
// Connect to local DB
else {
    dbConnectionProperties = {
        connectionLimit: 10,
        host: 'localhost',
        user: 'dbuser',
        password: 'password',
        'database': 'expensetracker2'
    };
}

module.exports = mysql.createPool(dbConnectionProperties);

