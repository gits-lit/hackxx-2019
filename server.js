/***** Configurations File *****/
global.config = require('./config.json');

/***** Import Modules *****/
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

/***** Front End Setup *****/
const app = express();
const port = 3000;

app.use(bodyParser());
app.use(cors());
app.use(express.static(__dirname + '/public'));

// Path joins the current directory name with views (aka current directory + views)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('index', {
    test: 'test'
  });
});

app.listen(port);
