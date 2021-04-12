const router = require('express').Router();
const { default: Hubspot } = require('hubspot');
const controllerhubspot = require('../controllers/hubspot.controller.js');


router.post('/HubSpot/', controllerhubspot.createClient);
router.post('/HubSpot/update/', controllerhubspot.updateClient);
router.post('/HubSpot/createTicket', controllerhubspot.createTicket);

module.exports = router;