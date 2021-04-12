const port = process.env.PORT || 8080;
const host = process.env.HOST ||  '127.0.0.1';
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

app.listen(port, function(err) {
    if (!err) {
        console.log('Your app is listening on ' + host + ' and port ' + port);
    } else {
        console.log(err);
    }
});

module.exports = app;
require('./loader');