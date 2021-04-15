const express = require('express');

const router = express.Router();

const usersController = require('../controllers/users');

// GET /users
router.get('/', usersController.getUsers);

// GET /users/:userName
router.get('/:userName', usersController.getUser);

// GET /users/pasEmail/:email
router.get('/pasEmail/:email', usersController.getPasEmail);

// GET /users/sendTo/:email
router.get('/sendTo/:email', usersController.sendMail);

// POST /users/m
router.post('/m', usersController.createUserM);

// POST /users/login
router.post('/login', usersController.logInUser);

// DELETE /users/:id
router.delete('/:id', usersController.deleteUser);

module.exports = router;
