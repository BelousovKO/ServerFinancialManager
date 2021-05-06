const express = require('express');

const router = express.Router();

const interfaceController = require('../controllers/interface');

// POST /interface
router.post('/', interfaceController.change);

// GET /interface/:userId
router.get('/:userId', interfaceController.test);

module.exports = router;
