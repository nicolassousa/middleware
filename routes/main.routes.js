const router = require('express').Router();
const controllerhubspot = require('../controllers/hubspot.controller.js');
const controllerJasmin = require('../controllers/jasmin.controller');
const controllerMoloni = require('../controllers/moloni.controller');

//HUBSPOT
router.post('/Hubspot/', controllerhubspot.createClient);
router.post('/HubSpot/update/', controllerhubspot.updateClient);
router.post('/HubSpot/createTicket', controllerhubspot.createTicket);
router.get('/Hubspot/getClient/:email', controllerhubspot.getClient);

//JASMIN
router.post('/Jasmin/registarCompra', controllerJasmin.registarCompra);
router.get('/Jasmin/consumirSenha/:email', controllerJasmin.consumirSenha);

//MOLONI
router.post('/Moloni/registarEncomenda', controllerMoloni.registarEncomenda);

module.exports = router;