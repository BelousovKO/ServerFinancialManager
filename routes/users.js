const express = require('express');

const router = express.Router();

const usersController = require('../controllers/users');

// GET /users
router.get('/', usersController.getUsers);

// GET /users/:userName
router.get('/:userName', usersController.getUser);

// GET /users/pasEmail/:userMail
router.get('/pasEmail/:userMail', usersController.getPasEmail);

// GET /users/sendTo/:userMail
router.get('/sendTo/:userMail', usersController.sendMail);

// POST /users/m
router.post('/m', usersController.createUserM);

// DELETE /users/:id
router.delete('/:id', usersController.deleteUser);

module.exports = router;
