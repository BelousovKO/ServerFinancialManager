const express = require('express');

const router = express.Router();

const interfaceController = require('../controllers/interface');

// POST /interface
router.post('/', interfaceController.change);

module.exports = router;
