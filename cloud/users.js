var User={
    register:function(username, password, fullname, email, phone, callback){
        var user = new Parse.User();
        user.set("username", username);
        user.set("password", password);
        user.set("email", email);

        // other fields can be set just like with Parse.Object
        user.set("phone", phone);
        user.set("fullname", fullname);
        user.set("money", 0);
        user.set("campaignList", {});
        user.set("donateList", {});
        user.signUp(null, {
            success: function(user) {
                callback("ok");
            },
            error: function(user, error) {
                // Show the error message somewhere and let the user try again.
                alert("Error: " + error.code + " " + error.message);
                callback("Error: " + error.message);
            }
        });
    },

    login:function(username, password, callback){
        console.log("login with: "+username+", "+password)
        Parse.User.logIn(username, password, {
            success: function(user) {
                callback("ok")
            },
            error: function(user, error) {
                callback("Error: " + error.message);
            }
        });
    }

}

module.exports  = User;
