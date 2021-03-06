var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const swaggerJSDoc = require('swagger-jsdoc');  
const swaggerUI = require('swagger-ui-express');
var admin = require("firebase-admin");
var serviceAccount = require("./config/firebase/wb-js-eea5b-firebase-adminsdk-irpdw-1b36499119.json");



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

 var MongoDBUtil = require('./modules/mongodb/modules/mongodb.module').MongoDBUtil;

 var CustomerController = require('./modules/customer/customer.module')().CustomerController;
 var UsuarioController = require('./modules/usuarios/customer.module')().CustomerController;
 var ProductosController = require('./modules/productos/productos.module')().ProductosController;
 var CustomerControllerV = require('./modules/customerVentas/customer.module')().CustomerController;

var app = express();

//Swagger Configuration  
 const swaggerOptions = {  
   swaggerDefinition: {  
       info: {  
           title:'Customers API',  
           version:'1.0.0'  
       }  
   },  
   apis:['./modules/customerVentas/customer.controller.js'], 
   apis:['./modules/customer/customer.controller.js'], 
   apis:['./modules/usuarios/customer.controller.js'], 
   apis:['./modules/productos/productos.controller.js']

 }  
 const swaggerDocs = swaggerJSDoc(swaggerOptions);  
 app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocs));

 app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

MongoDBUtil.init();


function checkAuth(req, res, next) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
    const idToken = req.headers.authorization.split('Bearer ')[1];
    admin.auth().verifyIdToken(idToken)
      .then(() => {
        next()
      }).catch((error) => {
        res.status(403).send('Unauthorized')
      });
  } else {
    res.status(401).send('Unauthorized')
  }
}
 //
  app.use('*',checkAuth);
 app.use('/usuarios', UsuarioController);
 app.use('/customersVentas', CustomerControllerV);
 app.use('/customers', CustomerController);
 app.use('/productos', ProductosController);
 
 app.get('/', function (req, res) {
  var pkg = require(path.join(__dirname, 'package.json'));
  res.json({
      name: pkg.name,
      version: pkg.version,
      status: 'up'
  });
 });
 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: res.locals.message,
    error: res.locals.error
  });
 
});

module.exports = app;
