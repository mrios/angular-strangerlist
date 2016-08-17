
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var multer  = require('multer');
var _ = require('lodash');
var app = express();

var ITEMS_FILE = path.join(__dirname, 'items.json');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/assets/images'))
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage });

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest items.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/api/items', function(req, res) {
  fs.readFile(ITEMS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/items', upload.single('imageSrc'), function(req, res) {
    //write file
    fs.readFile(ITEMS_FILE, function(err, data) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      var items = JSON.parse(data);
      
      if(!_.isUndefined(req.body.id) && req.body.id !=="") {

        var id = parseInt(req.body.id);

        // Find item index using indexOf+find
        var index = _.indexOf(items, _.find(items, {id: id}));
        var original = items[index];

        if(index>=0) {
          // Replace item at index using native splice
          var objectUpdated = _.has(req,'file') 
            ? {id: id, imageSrc: req.file.originalname, text: req.body.text}
            : {id: id, imageSrc: original.imageSrc, text: req.body.text}

          items.splice(index, 1, objectUpdated);
        }
      }
      else {

        var newItem = {
          id: Date.now(),
          imageSrc: req.file.originalname,
          text: req.body.text
        };
        items.push(newItem);
      }

      fs.writeFile(ITEMS_FILE, JSON.stringify(items, null, 4), function(err) {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        
        res.redirect('/');
      });
        
  
  });
  
});

app.put('/api/items', function(req, res) {
  fs.readFile(ITEMS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    fs.writeFile(ITEMS_FILE, JSON.stringify(req.body, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(req.body);
    });
  });
});

app.delete('/api/items/:id', function(req, res) {
  
  fs.readFile(ITEMS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    var id = parseInt(req.params.id);
    var items = JSON.parse(data);

    items = _.reject(items, {id: id});

    fs.writeFile(ITEMS_FILE, JSON.stringify(items, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      res.json(items);
    });
  });
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});