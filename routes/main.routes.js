const router = require('express').Router();
const controllerhubspot = require('../controllers/hubspot.controller.js');
const controllerJasmin = require('../controllers/jasmin.controller');
const controllerauxJasmin = require('../controllers/jasmin.aux.controller');
const adyen = require('../controllers/adyen.encrypt');

//HUBSPOT
router.post('/Hubspot/', controllerhubspot.createClient);
router.post('/HubSpot/update/', controllerhubspot.updateClient);
router.post('/HubSpot/createTicket', controllerhubspot.createTicket);
router.get('/Hubspot/getClient/:email', controllerhubspot.getClient);

//JASMIN
router.post('/Jasmin/registarCompra', controllerJasmin.registarCompra);
router.post('/Jasmin/consumirSenha', controllerJasmin.consumirSenha);

module.exports = router;