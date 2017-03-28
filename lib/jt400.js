var EventEmitter = require('events').EventEmitter;
var java = require('java');
var sys = require('sys');
var S = require('string');

function Database() {
  EventEmitter.call(this);
  this._config = {};
  this._conn = null;
}

sys.inherits(Database, EventEmitter);

Database.prototype.initialize = function(config) {
  var self = this;
  self._config = config;

  java.classpath.push(self._config.libpath);
  java.newInstance(self._config.drivername, function(err, driver) {
    if (err) {
      throw new Error(err);
    } else {
      java.callStaticMethod('java.sql.DriverManager', 'registerDriver', driver, function (registerDriverError, result) {
        if (registerDriverError) {
          self.emit('init', registerDriverError, null);
        } else {
          self.emit('init', null, self._config.drivername);
        }
      });
    }
  });
};

/**
* Open connection
*/
Database.prototype.open = function() {
  var self = this;

  java.callStaticMethod('java.sql.DriverManager', 'getConnection', self._config.url, function(getConnectionError, conn) {
    if (getConnectionError) {
      self.emit('open', getConnectionError, null);
    } else {
      self._conn = conn;
      self.emit('open', null, conn);
    }
  });
};

/**
* Close connection
*/
Database.prototype.close = function() {
  var self = this;
  this._conn.close(function(closeError, result) {
    if (closeError) {
      self.emit('close', closeError, null);
    } else {
      self.emit('close', null, result);
    }
  });
};

/**
* Execute Update
*/
Database.prototype.executeUpdate = function(sql) {
  var self = this;

  java.callStaticMethod('java.sql.DriverManager', 'getConnection', self._config.url, function(getConnectionError, conn) {
    if (getConnectionError) {
      self.emit('execute', getConnectionError, null);
    }
    else {
      conn.createStatement(function(createStatementError, statement) {
        if (createStatementError) {
          self.emit('execute', createStatementError, null);
          console.log(createStatementError);
        }
        else {
          statement.executeUpdate(sql, function(executeQueryError, rowCount) {
            if (executeQueryError) {
              self.emit('execute', executeQueryError, null);
              console.log(executeQueryError);
            }
            else {
              self.emit('executeUpdate', null, rowCount);
            }
          });
        }

      });
    }
  });
};

/**
* Execute
*/
Database.prototype.execute = function(sql) {
  var self = this;

  java.callStaticMethod('java.sql.DriverManager', 'getConnection', self._config.url, function(getConnectionError, conn) {
    if (getConnectionError) {
      self.emit('execute', getConnectionError, null);
    } else {

      conn.createStatement(function(createStatementError, statement) {
        if (createStatementError) {
          self.emit('execute', createStatementError, null);
          console.log(createStatementError);
        }
        else {
          statement.executeQuery(sql, function(executeQueryError, resultset) {
            if (executeQueryError) {
              self.emit('execute', executeQueryError, null);
              console.log(executeQueryError);
            }
            else {
              resultset.getMetaData(function(getMetaDataError, rsmd) {
                if (getMetaDataError) {
                  self.emit('execute', getMetaDataError, null);
                  console.log(getMetaDataError);
                }
                else {
                  var cc = rsmd.getColumnCountSync();
                  var results = [];
                  var next = resultset.nextSync();

                  while (next) {
                    var row = {};

                    for (var i = 1; i <= cc; i++) {
                      var colname = rsmd.getColumnNameSync(i);

                      var item = resultset.getStringSync(i);

                      if (!S(item).isEmpty()) {
                        row[colname] = S(item).trim().s
                      }
                      else {
                        row[colname] = '';
                      }
                    }
                    results.push(row);
                    next = resultset.nextSync();
                  }
                  self.emit('execute', null, results);
                }
              });
            }
          });
        }
      });
    }
  });
};

/**
* Execute stored procedure
* Output parameters must be passed in the following form:
* [{Index: [index value], DataType: [SQL datatype as int], [Value: InOut Parameter Input Value] }, { ...}]
*/
Database.prototype.executeStoredProc = function(procedure,outputParams) {
  var self = this;

  java.callStaticMethod('java.sql.DriverManager', 'getConnection', self._config.url, function(getConnectionError, conn) {
    if (getConnectionError) {
      self.emit('executeStoredProc', getConnectionError, null);
    } else {

      conn.prepareCall(procedure,function(prepareCallError, callStatement) {
        if (prepareCallError) {
          self.emit('executeStoredProc', prepareCallError, null);

        }
        else {
          var error = false;

          for (i = 0; i < outputParams.length; i++)
          {
            if("Value" in outputParams[i])
            {
              callStatement.setString(outputParams[i].Index,outputParams[i].Value,function(setStringError, setString) {
                if (setStringError) {
                  self.emit('executeStoredProc', setStringError, null);

                  error = true;
                }
              });
            }

            callStatement.registerOutParameter(outputParams[i].Index, outputParams[i].DataType,function(registerOutParameterError) {
              if (registerOutParameterError) {
                self.emit('executeStoredProc',registerParameterError, null);
              }
            });
          }
          if(error == false)
          {
            callStatement.execute(function(executeError, resultString) {
              if (executeError) {
                self.emit('executeStoredProc', executeError, null);

              }
              else {
                var result = {};
                for (i = 0; i < outputParams.length; i++) {
                  if(i <= outputParams.length - 1 )
                  {
                    result[outputParams[i].Index] = callStatement.getStringSync(outputParams[i].Index).trim();
                  }
                }
                self.emit('executeStoredProc', null, result);
              }
            });
          }
        }
      });
    }
  });
}



/**
* Export object class
*/
module.exports = Database;
