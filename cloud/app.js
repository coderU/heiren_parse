User = require("cloud/users.js")
Marker = require("cloud/markers.js")
Campaign = require("cloud/campaign.js")
parseExpressHttpsRedirect = require('parse-express-https-redirect');
parseExpressCookieSession = require('parse-express-cookie-session');
// These two lines are required to initialize Express in Cloud Code.
express = require('express');
app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body
app.use(parseExpressHttpsRedirect());  // Require user to be on HTTPS.
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
app.get('/login', function(req, res) {
  // Renders the login form asking for username and password.
  res.render('login.ejs');
});

app.get('/apis/users', function(req, res) {
    User.login(req.query.email, req.query.password, function(result){
      if(result != "ok"){
        res.redirect('/login');
        // res.status(500).send(result);
      }else {
        res.redirect('/apis/users/me');
        // res.send(token);
      }
    });
});

app.get('/apis/users/me', function(req, res) {
  var currentUser = Parse.User.current();
  if (currentUser) {
      res.send(currentUser);
  } else {
      res.redirect('/login');
  }
});

//Apis for markers
app.get('/apis/markers/locations', function(req, res){
  Marker.fetchLocations(function(result, markers){
    if(result != "ok"){
      res.status(500).send(result);
    }else{
      res.send(markers);
    }
  });
});

app.get('/apis/markers/detail', function(req, res) {
    Marker.fetchDetail(req.query.objectId, function(result, marker){
      if(result != "ok"){
        res.status(500).send(result);
      }else {
        res.send(marker);
      }
    });
});

app.get('/apis/markers', function(req, res){
  Marker.fetchAll(function(result, markers){
    if(result != "ok"){
      res.status(500).send(result);
    }else{
      res.send(markers);
    }
  });
});


app.post('/apis/markers', function(req, res){
  Marker.create(req.body.title, req.body.content, Number(req.body.lat), Number(req.body.lng), req.body.imgUrl, req.body.completedTime, function(result){
    if(result != "ok"){
      res.status(500).send(result);
    }else{
      res.send(result);
    }
  });
});

//apis for campaign
app.post('/apis/campaign', function(req, res) {
    var currentUser = Parse.User.current();
    if(currentUser){
      Campaign.create(req.body.name, Number(req.body.goal) , req.body.type, req.body.headline, req.body.statement, currentUser.id, function(result){
          if(result != "ok"){
              res.status(500).send(result);
          }else{
              res.send(result);
          }
      });
    }else{
      res.redirect('/login');
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
