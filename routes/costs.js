const express = require('express');

const router = express.Router();

const costsController = require('../controllers/costs');

// POST /costs/new
router.post('/new', costsController.create);

module.exports = router;
