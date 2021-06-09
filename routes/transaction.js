const express = require('express');

const router = express.Router();

const transactionController = require('../controllers/transaction');

// POST /transaction/new
router.post('/new', transactionController.create);

// POST /transaction/edit
router.post('/edit', transactionController.edit);

module.exports = router;
