var express = require('express');
var app = express();
var Promise = require('bluebird').Promise;
var MongoClient = require('mongodb').MongoClient;

Promise.promisifyAll(MongoClient);

// Setup connection to db first
MongoClient.connectAsync(process.env.MONGODB_URI || 'mongodb://localhost:27017/test')
    .then(setupApp)
    .catch(function (err) {
        console.log(err);
        process.exit(1);
    });

function setupApp(db) {
    app.set('port', (process.env.PORT || 5000));

    app.use(express.static(__dirname + '/public'));

    // views is directory for all template files
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');

    app.get('/', function(request, response) {
      response.render('pages/index');
    });


    app.get('/available-images', function (request, response) {
        var col = db.collection('images');

        response.setHeader('Content-Type', 'application/json');
        col.find().limit(5).toArray().then(function (availableImages) {
            response.send(availableImages);
        });
    });

    app.listen(app.get('port'), function() {
      console.log('Node app is running on port', app.get('port'));
    });
}
