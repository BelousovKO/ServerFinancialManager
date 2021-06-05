const express = require('express');

const router = express.Router();

const costsController = require('../controllers/costs');

// POST /costs/new
router.post('/new', costsController.create);

// POST /costs/edit
router.post('/edit', costsController.edit);

module.exports = router;
