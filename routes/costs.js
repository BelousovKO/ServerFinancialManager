const express = require('express');

const router = express.Router();

const costsController = require('../controllers/costs');

// POST /interface/new
router.post('/new', costsController.create);

module.exports = router;
