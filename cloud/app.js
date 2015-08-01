User = require("cloud/users.js")
parseExpressHttpsRedirect = require('parse-express-https-redirect');
parseExpressCookieSession = require('parse-express-cookie-session');
// These two lines are required to initialize Express in Cloud Code.
express = require('express');
app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body
//app.use(parseExpressHttpsRedirect());  // Require user to be on HTTPS.
app.use(express.cookieParser('YOUR_SIGNING_SECRET'));
app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 } }));
// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
});


//Apis associate with users
app.post('/apis/users', function(req, res) {
    User.register(req.body.email, req.body.password, req.body.fullname, req.body.email, req.body.phone, function(result){
      if(result != "ok"){
        res.status(500).send(result);
      }else{
        res.send(result);
      }
    });
});

app.get('/apis/users', function(req, res) {
    User.login(req.query.email, req.query.password, function(result){
      if(result != "ok"){
        res.status(500).send(result);
      }else {
        res.send(result);
      }
    });
});

app.get('/apis/users/me', function(req, res) {
  var currentUser = Parse.User.current();
  if (currentUser) {
      res.send(currentUser);
  } else {
      res.send("Login page");
  }
});


// // Example reading from the request query string of an HTTP get request.
// app.get('/test', function(req, res) {
//   // GET http://example.parseapp.com/test?message=hello
//   res.send(req.query.message);
// });

// // Example reading from the request body of an HTTP post request.
// app.post('/test', function(req, res) {
//   // POST http://example.parseapp.com/test (with request body "message=hello")
//   res.send(req.body.message);
// });

// Attach the Express app to Cloud Code.
app.listen();
