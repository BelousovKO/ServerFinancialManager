const express = require('express');

const router = express.Router();

const usersController = require('../controllers/users');

// GET /users/:userName
router.get('/:userName', usersController.checkUserName);

// GET /users/checkMail/:email
router.get('/checkMail/:email', usersController.checkMail);
/*
// GET /users/pasEmail/:email
router.get('/pasEmail/:email', usersController.getPasEmail); */

// GET /users/sendTo/:value
router.get('/sendTo/:value', usersController.sendMail);

// POST /users/m
router.post('/m', usersController.userReg);

// POST /users/login
router.post('/login', usersController.logInUser);

// POST /users/auth
router.post('/auth', usersController.authUser);

module.exports = router;
