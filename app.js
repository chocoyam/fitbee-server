/**
 * 2018.07.17
 * fitbee server
 */
var express = require('express')
  , http = require('http')
  , path = require('path');

var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');

var app = express();
app.use(bodyParser.json())
app.use(cookieParser())

const multer = require('multer');
const upload = multer({ dest: 'userImage/'});

var port = 3000;
var database = require('mysql');
const dbConfig = {
   host: '13.124.65.48',
   user: 'fitbee',
   password: 'fitbee',
   port: 3306,
   database: 'fitbee'
};
const conn = database.createConnection(dbConfig);


//setting routes
var user = require('./routes/user.js');
app.get('/user/:userId', user.getMain);
app.post('/user', upload.array('image'), user.getUserId);


// start server
conn.connect( (err) => {
   if (err) {
      console.error('error db connecting: ', err);
      return;
   }
   console.log('success db connecting');
});
process.on('uncaughtException', function (err) {
	console.log('uncaughtException: ' + err);
	console.log(err.stack);
});
process.on('SIGTERM', function () {
    console.log("process end");
    app.close();
});
app.on('close', function () {
	console.log("Express object end & db close");
	conn.end();
});
app.listen(port, function(){
	console.log('server is listening @'+port);
})
