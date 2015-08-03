// Set your secret key: remember to change this to your live secret key in production
// See your keys here https://dashboard.stripe.com/account/apikeys
//TODO:PUB
var Stripe = require('stripe');
Stripe.initialize("sk_test_tfICSB0KJPUSSIxpQo3bNbPf");
// (Assuming you're using express - expressjs.com)
// Get the credit card details submitted by the form

var StripeOBJ={
  pre_donate: function(stripeToken, campaignId, username, amount, callback){
    Stripe.Charges.create({
      amount: amount*100, // amount in cents, again
      currency: "usd",
      source: stripeToken,
      description: username + " donated to campaign: " + campaignId
    },{
      success: function(httpResponse) {
        callback("ok");
      },
      error: function(httpResponse) {
        callback("Card Declined!");
      }
    });
  }
}


module.exports  = StripeOBJ;
