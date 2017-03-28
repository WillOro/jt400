var Database = require('jt400');
var database = new Database();

var config = {
  libpath: __dirname + '/jt400.jar',
  drivername: 'com.ibm.as400.access.AS400JDBCDriver',
  url: 'jdbc:as400://130.1.1.66/Target;user=USR_DOCKER;password=DOCKER1'
};

database.initialize(config);

// SELECT statements must be run with execute()
database.execute('SELECT * FROM QSTCDAT.G3PLAN');

database.on('execute', function(error, results) {
  if (error) {
    console.log(error);
  }
  else {
    console.log(results);
  }
});
