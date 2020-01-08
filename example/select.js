var Database = require('jt400');
var database = new Database();

var config = {
  libpath: __dirname + '/jt400.jar',
  drivername: 'com.ibm.as400.access.AS400JDBCDriver',
  url: 'jdbc:as400://ipaddress/Target;user=USR;password=DCKR#'
};

database.initialize(config);

// SELECT statements must be run with execute()
database.execute('SELECT * FROM SCHEMA.TABLE');

database.on('execute', function(error, results) {
  if (error) {
    console.log(error);
  }
  else {
    console.log(results);
  }
});
