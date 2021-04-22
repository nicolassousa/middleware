const router = require('express').Router();
const controllerhubspot = require('../controllers/hubspot.controller.js');
const controllerJasmin = require('../controllers/jasmin.controller');
const controllerauxJasmin = require('../controllers/jasmin.aux.controller');

//HUBSPOT
router.post('/Hubspot/', controllerhubspot.createClient);
router.post('/HubSpot/update/', controllerhubspot.updateClient);
router.post('/HubSpot/createTicket', controllerhubspot.createTicket);

//JASMIN
router.post('/Jasmin/registarCompra', controllerJasmin.registarCompra);

module.exports = router;