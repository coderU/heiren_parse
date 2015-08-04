User = require("cloud/users.js");
Marker = require("cloud/markers.js");
Campaign = require("cloud/campaign.js");
Stripe = require("cloud/stripe.js");
var _ = require('underscore');
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
  if(req.body.email && req.body.password && req.body.fullname  && req.body.phone){
    User.register(req.body.email, req.body.password, req.body.fullname, req.body.email, req.body.phone, function(result){
      if(result != "ok"){
        res.status(500).send(result);
      }else{
        res.redirect('/me');
      }
    });
  }else{
    res.status(500).send("Lack of parameter!");
  }
});

app.get('/login', function(req, res) {
  // Renders the login form asking for username and password.
  var currentUser = Parse.User.current();
  if(currentUser){
    res.redirect('/me');
  }else{
    res.render('login.ejs');
  }
});

app.get('/register', function(req, res) {

    var currentUser = Parse.User.current();
    if(currentUser){
      res.redirect('/me');
    }
    //should be else branch here
    res.render('register.ejs');
});

app.get('/apis/users', function(req, res) {
  if(req.query.email && req.query.password){
    User.login(req.query.email, req.query.password, function(result){
      if(result != "ok"){
        res.redirect('/login');
      }else {
        res.redirect('/me');
      }
    });
  }else{
    res.status(500).send("Lack of parameter!");
  }
});

app.get('/apis/users/me', function(req, res) {
  var currentUser = Parse.User.current();
  if (currentUser) {
      currentUser.fetch().then(function(fetchedUser){
        var campaignList = fetchedUser.get("campaignList");
        var sum = 0;
        var campaign_summary = [];
        Campaign.countMoney(campaignList, 0, [],function(result, summary){
          if(result == "ok"){
            for(var key in summary){
              sum+=summary[key]["total"];
            }
            fetchedUser.set("sum", sum);
            fetchedUser.set("campaign_summary", summary);
            res.send(fetchedUser);
          }
        });
      });
  } else {
      res.redirect('/login');
  }
});



app.post('/apis/users/donate', function(req, res){
  if(req.body.amount && req.body.stripeToken){
    var currentUser = Parse.User.current();
    if(currentUser){
      currentUser.fetch().then(function(fetchedUser){
          var name = fetchedUser.get("fullname");
          Stripe.pre_donate(req.body.stripeToken, "Any", name, Number(req.body.amount), function(result){
            if(result == "ok"){
              User.donate(fetchedUser, currentUser, Number(req.body.amount), function(result){
                if(result == 'ok'){
                  res.send(result);
                }else{
                  res.status(500).send(result);
                }
              });
            }else{
              res.status(500).send(result);
            }
          });
        });
    }else{
      res.redirect('/login');
    }
  }else{
    res.status(500).send("Lacking of parameters");
  }
});


//Apis for markers
app.get('/map', function(req, res){
  res.redirect('/map.html');
});

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
    if(req.query.objectId){
      Marker.fetchDetail(req.query.objectId, function(result, marker){
        if(result != "ok"){
          res.status(500).send(result);
        }else {
          res.send(marker);
        }
      });
    }else{
      res.status(500).send("Lack of parameter!");
    }
});

app.get('/apis/markers/all', function(req, res){
  Marker.fetchAll(function(result, markers){
    if(result != "ok"){
      res.status(500).send(result);
    }else{
      res.send(markers);
    }
  });
});


app.post('/apis/markers', function(req, res){
  if(req.body.title && req.body.content && Number(req.body.lat) && Number(req.body.lng) && req.body.imgUrl && req.body.completedTime){
    Marker.create(req.body.title, req.body.content, Number(req.body.lat), Number(req.body.lng), req.body.imgUrl, req.body.completedTime, function(result){
      if(result != "ok"){
        res.status(500).send(result);
      }else{
        res.send(result);
      }
    });
  }else{
    res.status(500).send("Lack of parameter!");
  }
});

//apis for campaign
app.get('/newCampaign', function(req, res) {
  // Renders the login form asking for username and password.
    res.render('newCampaign.ejs');
});

app.post('/apis/campaign', function(req, res) {
    var currentUser = Parse.User.current();
    if(currentUser){
      currentUser.fetch().then(function(fetchedUser){
          var name = fetchedUser.get("fullname");
          //Create Campaign and add in the Campaign table
          console.log(req.body.name);
          if(req.body.name && Number(req.body.goal) && req.body.type && req.body.headline && req.body.statement){
            Campaign.create(req.body.name, Number(req.body.goal) , req.body.type, req.body.headline, req.body.statement, name, function(result, campaignId){
                if(result != "ok"){
                    res.status(500).send(result);
                }else{
                    // Add Campaign to User Campaign List
                    var campaignList = fetchedUser.get("campaignList");
                    if(!campaignList){
                      campaignList = [];
                    }
                    campaignList.push(campaignId);
                    currentUser.set("campaignList", campaignList);
                    currentUser.save(null, {
                      success: function(user) {
                        res.redirect('/me');
                      }
                    });
                }
            });
          }
          else{
            res.status(500).send("Lack of parameter!");
          }
      }, function(error){
          res.status(500).send(error);
          console.log(error);
      });
    }else{
      res.redirect('/login');
    }
});

app.post('/apis/campaign/donate/:campaignId', function(req, res) {
  if(req.body.amount && req.params.campaignId && req.body.stripeToken){
    var currentUser = Parse.User.current();
    if (currentUser) {
      currentUser.fetch().then(function(fetchedUser){
          var name = fetchedUser.get("fullname");
          Stripe.pre_donate(req.body.stripeToken, req.params.campaignId, name, Number(req.body.amount), function(result){
            if(result == "ok"){
              Campaign.donate(req.params.campaignId, name, Number(req.body.amount), fetchedUser, currentUser, function(result) {
                if(result == "ok"){
                  res.redirect('/apis/campaign/'+req.params.campaignId);
                }else{
                  res.status(500).send(result);
                }
              });
            }else{
              res.status(500).send(result);
            }
          });
        });
    } else {
        res.redirect('/login');
    }
  }else{
    res.status(500).send("Lacking of parameters");
  }
});

//Test Only Api!
app.get('/apis/campaign/:campaignId', function(req,res){
  var currentUser = Parse.User.current();
  if(req.params.campaignId){
    Campaign.fetchDetail(req.params.campaignId, function(result, campaign){
      if(result == 'ok'){
        var sortable = [];
        var donator = campaign.get('donator')
        for (var user in donator){
              sortable.push([user, donator[user]]);
            }
        sortable.sort(function(a, b) {return b[1] - a[1]})
        sortable = sortable.slice(0,10);
        if(currentUser){
          currentUser.fetch().then(function(fetchedUser){
            res.render('campaignDetail', {ranking: sortable, name: campaign.get('name'), goal: campaign.get('goal'), founder: campaign.get('founder'), total: campaign.get('total'), campaignId: campaign.id, currentUser: currentUser, email: fetchedUser.get('email')});
          });
        }else{
          res.render('campaignDetail', {ranking: sortable, name: campaign.get('name'), goal: campaign.get('goal'), founder: campaign.get('founder'), total: campaign.get('total'), campaignId: campaign.id, currentUser: currentUser, email: "0"});
        }
      }else{
        res.status(500).send(result);
      }
    });
  }else{
    res.status(500).send("Lacking of parameters");
  }
});

app.get('/apis/donate', function(req, res){
  var currentUser = Parse.User.current();
  if(currentUser){
    currentUser.fetch().then(function(fetchedUser){
      res.render('stripe.ejs',{email: fetchedUser.get('email')});
    });

  }else{
    res.redirect('/login');
  }
});
app.post('/apis/donate', function(req, res){
  res.send(req.body.stripeToken);
});
//###############

// app.get('/apis/campaign/:campaignId', function(req,res){
//   if(req.params.campaignId){
//     Campaign.fetchDetail(req.params.campaignId, function(result, campaign){
//       if(result == 'ok'){
//         res.send(campaign);
//       }else{
//         res.status(500).send(result);
//       }
//     });
//   }else{
//     res.status(500).send("Lacking of parameters");
//   }
// });




//Front End Requests
app.get('/me', function(req,res){
  var currentUser = Parse.User.current();
  if (currentUser) {
      currentUser.fetch().then(function(fetchedUser){
        var campaignList = fetchedUser.get("campaignList");
        var sum = 0;
        var campaign_summary = [];
        Campaign.countMoney(campaignList, 0, [],function(result, summary){
          if(result == "ok"){
            for(var key in summary){
              sum+=summary[key]["total"];
            }
            fetchedUser.set("sum", sum);
            fetchedUser.set("campaign_summary", summary);
            res.render('home',{fullname: fetchedUser.get('fullname'), campaign_summary: fetchedUser.get('campaign_summary')});
          }
        });
      });
  } else {
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
