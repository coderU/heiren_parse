var Campaign_Object = Parse.Object.extend("Campaign");
function syncFor(campaignList, count, result, callback) {
  if(count >= campaignList.length){

    callback("ok", result)
  }else{
    campaignId = campaignList[count];
    var query = new Parse.Query(Campaign_Object);
    query.get(campaignId, {
      success: function(campaign) {
        var sum = 0;
        var donator = campaign.get("donator")
        for(var key in donator) {
          if (donator.hasOwnProperty(key)) {
            sum += donator[key];
          }
        }
        result.push( {"name" : campaign.get("name"), "total": sum, "campaignId": campaignId} );

        syncFor(campaignList, count + 1, result, callback)
        // return {"name" : campaign.name, "total": sum};
      },
      error: function(campaign, error){
        alert("countMoney Error: "+error);
        // return {"name" : "fail", "total": sum};
        callback("countMoney Error: "+error);

      }
    });
  }
}
var Campaign={
  countMoney: function(campaignList, count, result, callback){
    return syncFor(campaignList, count, result, callback);
  },
  create: function(name, goal, type, headline, statement, userId, callback){
    alert("User: " + userId + "is trying to create a new Campaign!");
    var campaign = new Campaign_Object();

    campaign.set("name", name);
    campaign.set("goal", goal);
    campaign.set("type", type);
    campaign.set("statement", statement);
    campaign.set("founder", userId);
    campaign.save(null, {
      success: function(campaign) {
        // Execute any logic that should take place after the object is saved.
        callback("ok", campaign.id);
        alert('New object created with objectId: ' + campaign.id);
      },
      error: function(campaign, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        callback('Failed to create new object, with error code: ' + error.message);
        alert('Failed to create new object, with error code: ' + error.message);
      }
    });
  },

  donate: function(campaignId, name, amount, fetchedUser, currentUser, callback){
    var query = new Parse.Query(Campaign_Object);
    query.get(campaignId, {
      success: function(campaign) {
        alert(name + " is trying donate $"+ amount + " to "+campaign.get("name"));
        var donator = campaign.get("donator");
        if(!donator){
          donator = {};
        }

        if(!donator[name]){
          donator[name] = amount;
        }else{
          donator[name] = donator[name] +amount;
        }
        campaign.set("donator", donator);
        campaign.save(null,{
          success: function(campaign) {
            // Execute any logic that should take place after the object is saved.

            var donateList = fetchedUser.get("donateList");
            if(!donateList){
              donateList = {};
            }

              if(!donateList[campaignId]){
                  donateList[campaignId] = {"campaign": campaign.get("name"), "amount": amount}
              }else{
                  newAmount = donateList[campaignId]["amount"] + amount;
                  donateList[campaignId] = {"campaign": campaign.get("name"), "amount": newAmount}
              }
              var money = fetchedUser.get("money");
              money += amount;
              currentUser.set("money", money);
              currentUser.set("donateList", donateList);
              currentUser.save(null,{
                  success: function(user){
                      callback("ok");
                  },
                  error: function(user, error){
                      callback(error.message);
                      alert(error.message);
                  }
              });
          },
          error: function(campaign, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
            callback(error.message);
            alert('Failed to create new object, with error code: ' + error.message);
          }
        });
      },
      error: function(object, error) {
        callback("Error: " + error.code + " " + error.message);
        alert("Error: " + error.code + " " + error.message);
      }
    });
  }
}

module.exports  = Campaign;
