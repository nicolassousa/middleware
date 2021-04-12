const app = require('./server');
const router = require('./routes/main.routes');
//const cookieParser = require('cookie-parser');
const expressSanitizer = require('express-sanitizer');
const bodyParser = require('body-parser');
app.use(expressSanitizer());
//app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use('/', router);
module.exports = app;