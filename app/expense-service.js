let mysql = require('mysql');
const uuid = require('uuid/v4');
let dbconfig = require('../config/database');
let connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

module.exports = {
    getExpenses: function(user, res) {
        if (user.role === "admin") {
            getQuery = "SELECT id, date, username, amount, description FROM expenses";
        }
        else {
            getQuery = `SELECT id, date, username, amount, description FROM expenses WHERE username = "${user.username}"`;
        }

        console.debug(`Retrieving all expenses for user ${user.username}...`);
        connection.query(getQuery, function (err, rows) {
            if (err) {
                console.error("Couldn't read expenses!");
                console.error(err);
                res.status(500).send({error: "Couldn't get expenses."});
            }

            console.log(`Successfully retrieved expenses for user ${user.username}`);
            res.status(200).send(rows);
        })

    },

    createExpense: function(expense, user, res) {
        let expenseUuid = uuid();
        let insertQuery = "INSERT INTO expenses (id, date, username, role, amount, description) values (?, ?, ?, ?, ?, ?)";

        console.debug(`Inserting expense ${expenseUuid} - ${expense.description} into table...`);
        connection.query(insertQuery, [expenseUuid, expense.date, user.username, user.role, expense.amount, expense.description], function(err, rows) {
            if (err) {
                console.error("Couldn't insert new expense!");
                console.error(err);
                res.status(500).send({ error: "Couldn't save new expense."});
            }

            console.log(`Successfully added new expense ${expenseUuid} - ${expense.description}`);

            expense.id = expenseUuid;
            expense.username = user.username;
            res.status(201).send(expense);
        })
    },

    deleteExpense: function(expenseId, user, res) {
        let deleteQuery = "DELETE FROM expenses WHERE id = ? AND username = ?";

        console.debug(`Deleting expense ${expenseId} from table...`);
        connection.query(deleteQuery, [expenseId, user.username], function(err, rows) {
            if (err) {
                console.error("Couldn't delete expense row!");
                console.error(err);
                res.status(500).send({ error: "Couldn't remove expense."});
            }

            if (rows.affectedRows > 0) {
                console.log(`Successfully deleted expense ${expenseId}`);
                res.status(204).send();
            }
            else {
                console.log("Didn't delete any expenses - either expense didn't exist or didn't belong to current user");
                res.status(400).send({error: "No matching expense for this user was found"})
            }
        })
    }
};
