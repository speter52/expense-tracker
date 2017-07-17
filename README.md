# expense-tracker
A full-stack app to track expenses

## Building

The app needs Node, NPM, and MySQL to run, and Web Component Tester to test.

First pull all of the dependencies from NPM and Bower:
```
npm install
bower install
```

Then modify `config/localdb-connection.js` to point to your local installation of MySQL.

Now you can set up the tables:
```
node scripts/create-tables.js
```
and create a default Admin user with username `admin` and password `P@ssw0rd`:
```
node scripts/create-admin-user.js
```

Once the tables are created you can start the server:
```
node server.js
```

Tests can be run by installing the Web Component Tester:
```
npm install -g web-component-tester
cd public
wct -b chrome
```
