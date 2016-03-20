var express = require('express');
var router = express.Router();
var http = require('https');




router.post('/signintoken', function(req, res) {


    var token = req.body.idtoken;
    var pathy = '/oauth2/v3/tokeninfo?id_token='+token;
    var parsed;
    var db = req.db;
    var collection = db.get('usercollection');

    http.get({
        host: 'www.googleapis.com',
        path: pathy
    }, function(response) {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {

            parsed = JSON.parse(body);


            req.winkySession.email = parsed.email;

            collection.insert({
                "name" : parsed.name,
                "email" : parsed.email,
                "image" : parsed.picture
            }, function (err, doc) {
                if (err) {
                    // If it failed, return error
                    res.send("There was a problem adding the information to the database.");
                }
                else {
                    // And forward to success page
                    res.send("success");
                }
            });

        });
    });

});




























/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "username" : userName,
        "email" : userEmail
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("userlist");
        }
    });
});




router.get('/userlist', function(req, res) {

    console.log(req.winkySession)
	var db = req.db;
	var collection = db.get('usercollection');

	collection.find({},{},function(e,docs){
	//	console.log(docs)
		
		res.render('userlist', {
		    "userlist" : docs
		});
	});

});


router.get('/signin', function(req, res) {

    if (req.winkySession.email && req.winkySession.email != "none")
        res.redirect('/');

    res.render('signin', { title: 'Winky | sign in' });
});




/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});


/* GET home page. */
router.get('/', function(req, res, next) {

    console.log(req.winkySession);

    if (req.winkySession.email == "none" || !req.winkySession.email)
        res.redirect('/signin');

    var db = req.db;
    var collection = db.get('usercollection');

    collection.find({ email : req.winkySession.email},{},function(e,docs){
        
    res.render('index', { title: 'Winky | RealTime Chat Appy' ,  userName : req.winkySession.email  , data : JSON.stringify(docs[0])  });

    });






});





module.exports = router;
