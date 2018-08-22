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
const faceupload = multer({ dest: './pyFiles/faces/'});
const bodyupload = multer({ dest: './bodypic/'});

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
app.post('/user', faceupload.array('image'), user.getUserId);
app.get('/user/inbody/:id', user.getInbody);
app.put('/user/inbody/:id', user.updateInbody);
app.get('/user/change/:id', user.getChange);
app.get('/user/bodypic/:id', user.getBodyPic);
app.post('/user/bodypic/:id', bodyupload.array('image'), user.addBodyPic);
app.post('/adduser/db', user.addUserDb);
app.post('/adduser/model/:id', faceupload.array('image'), user.addUserModel);

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
