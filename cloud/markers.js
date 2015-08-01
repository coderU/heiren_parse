var Marker_Object = Parse.Object.extend("Marker");
var Marker={
    fetchAll: function(callback){
      alert("Fetching maarkers")
      var query = new Parse.Query(Marker_Object);
      query.find({
        success: function(results) {
          alert("Successfully retrieved " + results.length + " markers.");
          // Do something with the returned Parse.Object values
          for (var i = 0; i < results.length; i++) {
            var object = results[i];
            alert(object.id + ' - ' + object.get('title'));
          }
          callback("ok",results);
        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });
    },

    create: function(callback){
      var marker = new Marker_Object();

      marker.set("title", "test3");
      marker.set("lat", 7.188);
      marker.set("lng", 18.093);
      marker.save(null, {
        success: function(marker) {
          // Execute any logic that should take place after the object is saved.
          callback("ok");
          alert('New object created with objectId: ' + marker.id);
        },
        error: function(marker, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
          callback('Failed to create new object, with error code: ' + error.message);
          alert('Failed to create new object, with error code: ' + error.message);
        }
    });
  }
}

module.exports  = Marker;
