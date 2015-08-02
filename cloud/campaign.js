var Campaign_Object = Parse.Object.extend("Campaign");
var Campaign={
  create: function(name, goal, type, headline, statement, userId, callback){
    alert("User: " + userId + "is trying to create a new Campaign!");
    var campaign = new Campaign_Object();

    campaign.set("name", name);
    campaign.set("goal", goal);
    campaign.set("type", type);
    campaign.set("statement", statement);
    campaign.set("founderId", userId);
    campaign.save(null, {
      success: function(campaign) {
        // Execute any logic that should take place after the object is saved.
        callback("ok");
        alert('New object created with objectId: ' + campaign.id);
      },
      error: function(campaign, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        callback('Failed to create new object, with error code: ' + error.message);
        alert('Failed to create new object, with error code: ' + error.message);
      }
    });
  }
}

module.exports  = Campaign;
