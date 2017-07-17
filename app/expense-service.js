var mysql = require('mysql');
const uuid = require('uuid/v4');

module.exports = function(dbPool) {
    return {
        /**
         * Get all expenses for the given user. If admin, get all expenses.
         * @param user
         * @param callback
         */
        getExpenses: function(user, callback) {
            if (user.role === "admin") {
                getQuery = "SELECT id, date, username, amount, description FROM expenses";
            }
            else {
                getQuery = `SELECT id, date, username, amount, description FROM expenses WHERE username = "${user.username}"`;
            }

            console.log(`Retrieving all expenses for user ${user.username}...`);
            dbPool.query(getQuery, function (err, rows) {
                if (err)
                    console.error(err);

                callback(err, rows);
            });
        },

        /**
         * Create new expense under the given user.
         * @param user
         * @param expense
         * @param callback
         */
        createExpense: function(user, expense, callback) {
            var expenseUuid = uuid();
            var insertQuery = "INSERT INTO expenses (id, date, username, role, amount, description) values (?, ?, ?, ?, ?, ?)";

            console.log(`Inserting expense ${expenseUuid} - ${expense.description} into table...`);
            dbPool.query(insertQuery, [expenseUuid, expense.date, user.username, user.role, expense.amount, expense.description], function(err, rows) {
                if (err)
                    console.error(err);

                expense.id = expenseUuid;
                expense.username = user.username;

                callback(err, expense);
            })
        },

        /**
         * Delete matching expense for a given user.
         * @param user
         * @param expenseId
         * @param callback
         */
        deleteExpense: function(user, expenseId, callback) {
            var deleteQuery = "DELETE FROM expenses WHERE id = ? AND username = ?";

            console.log(`Deleting expense ${expenseId} from table...`);
            dbPool.query(deleteQuery, [expenseId, user.username], function(err, rows) {
                if (err)
                    console.error(err);

                callback(err, rows.affectedRows > 0);
            })
        }
    };
}
