let LocalStrategy   = require('passport-local').Strategy;

let mysql = require('mysql');
let bcrypt = require('bcrypt-nodejs');
let dbconfig = require('./database');
let connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

module.exports = function(passport) {

    /**
     * Store the ID of the user in the session.
     */
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    /**
     * Use the user ID from the session to retrieve the user's attributes from the database.
     */
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    /**
     * If the provided username doesn't already exist, provision a new 'regular' account with the given username & password.
     */
    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, username, password, done) {
            // Check  if the user already exists
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                }
                // Create new user
                else {
                    let newUserMysql = {
                        username: username,
                        role: "regular",
                        password: bcrypt.hashSync(password, null, null)
                    };

                    let insertQuery = "INSERT INTO users ( username, role, password ) values (?,?,?)";
                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.role, newUserMysql.password],function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    /**
     * Authenticate users with the users table in the database.
     */
    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, rows[0]);
            });
        })
    );
};
