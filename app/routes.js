var path = require('path');
var express  = require('express');

module.exports = function(app, passport, dbPool) {
    var expenseService = require('./expense-service') (dbPool);

    /**
     * Login page
     */
	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

    /**
     * Log the user in, on success redirect to app, else back to login page.
     */
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

    /**
     * Sign up up page
     */
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

    /**
     * Create a new user and redirect to app.
     */
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));


    /**
     * Log a user out and redirect back to the original login page.
     */
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/login');
	});

    /**
     * Serve the front-end app from the static directory.
     */
    app.use(isLoggedIn, express.static(path.join(__dirname, '../public')));

    /**
     * Get user name and role information.
     */
    app.get('/api/user', isLoggedIn, function(req, res) {
        res.status(200).send({
            username: req.user.username,
            role: req.user.role
        });
    });

    /**
     * READ expenses
     */
    app.get('/api/expenses', isLoggedIn, function(req, res) {
    	expenseService.getExpenses(req.user, function(err, expenses) {
    	    if (err) {
                console.error("Couldn't get expenses!");
                res.status(500).send({error: "Couldn't get expenses."});
                return;
            }

            console.log(`Successfully retrieved expenses for user ${req.user.username}`);
            res.status(200).send(expenses);
        });
    });

    /**
     * CREATE expenses
     */
    app.post('/api/expenses', isLoggedIn, function(req, res) {
        expenseService.createExpense(req.user, req.body, function(err, expense) {
            if (err) {
                console.error("Couldn't create expense");
                res.status(500).send({ error: "Couldn't save new expense."});
                return;
            }

            console.log(`Successfully added new expense ${expense.id} - ${expense.description}`);
            res.status(201).send(expense);
        });
	});

    /**
     * DELETE expenses
     */
    app.delete('/api/expenses/:id', isLoggedIn, function(req, res) {
        expenseService.deleteExpense(req.user, req.params.id, function(err, expenseFound) {
            if (err) {
                console.error("Couldn't delete expense row!");
                res.status(500).send({ error: "Couldn't remove expense."});
                return;
            }

            if (expenseFound) {
                console.log(`Successfully deleted expense ${req.params.id}`);
                res.status(204).send();
            }
            else {
                console.log("Didn't delete any expenses - either expense didn't exist or didn't belong to current user");
                res.status(400).send({error: "No matching expense for this user was found"})
            }
        });
    })
};

/**
 * Middleware to authenticate the logged in user with passport. Redirect back to login on failure.
 */
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}
