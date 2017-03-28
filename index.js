import JT400 from './lib/JT400';
module.exports = require('./lib/jt400');
static Properties props;

var local_system=130.1.1.66;
var userId=USR_DOCKER;
var password=DOCKER1;

try {

 props = new Properties();
 props.load(new FileInputStream("properties/mydb2.properties"));

 String DRIVER = "com.ibm.as400.access.AS400JDBCDriver"; 
 String URL = "jdbc:as400://" + props.getProperty("local_system").trim() + ";naming=system;errors=full";
 Connection conn = null;

 //Connect to iSeries 
 Class.forName(DRIVER); 
 conn = DriverManager.getConnection(URL, props.getProperty("userId").trim(), props.getProperty("password").trim()); 
 System.out.println("Conectado...");
 conn.close();

}
catch (Exception e) {
 System.out.println(e);
}
