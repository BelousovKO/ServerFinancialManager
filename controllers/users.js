const shortid = require('shortid');
const { validate } = require('jsonschema');
const nodemailer = require('nodemailer');
const db = require('../db/db');

const getUsers = (req, res, next) => {
  let users = [];
  try {
    users = db.get('users');
  } catch (error) {
    throw new Error(error);
  }
  res.json({
    status: 'OK',
    data: users
  });
};

const getUser = (req, res, next) => {
  const { userName } = req.params;

  const user = db
    .get('users')
    .find({ userName })
    .value();

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  res.json({
    status: 'OK',
    data: user
  });
};

const getPasEmail = (req, res, next) => {
  const { userMail } = req.params;

  const user = db
    .get('users')
    .find({ userMail })
    .value();

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  res.json({
    status: 'OK',
    data: user
  });
};

const createUserM = (req, res, next) => {
  const userSchema = {
    type: 'object',
    properties: {
      userName: { type: 'string' },
      password: { type: 'string' },
      userMail: { type: 'string' }
    },
    required: ['userName', 'password', 'userMail'],
    additionalProperties: true
  };

  const validationResult = validate(req.body, userSchema);
  if (!validationResult.valid) {
    throw new Error('INVALID_JSON_OR_API_FORMAT');
  }

  const { userName, password, userMail } = req.body;
  const user = {
    id: shortid.generate(),
    userName,
    password,
    userMail
  };

  try {
    db.get('users')
      .push(user)
      .write();
  } catch (error) {
    throw new Error(error);
  }

  res.json({
    status: 'OK',
    data: user
  });
};

const deleteUser = (req, res, next) => {
  db.get('users')
    .remove({ id: req.params.id })
    .write();

  res.json({ status: 'OK' });
};

const transporter = nodemailer.createTransport(
  {
    host: 'smtp.mail.ru',
    port: '465',
    secure: true,
    auth: {
      user: 'city-directory@mail.ru',
      pass: 'newfocusstart2021',
    }
  },
  {
    from: 'City directory <city-directory@mail.ru>',
  }
);

const sendMail = (req, res, next) => {
  const { userMail } = req.params;

  const user = db
    .get('users')
    .find({ userMail })
    .value();

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const message = {
    to: user.userMail,
    subject: 'Отправляем данные вашей учетной записи',
    html: `<h2>Данные вашей учетной записи</h2>
      <ul>
      <li>логин: <i>${user.userName}</i></li>
      <li>пароль: <i>${user.password}</i></li>
      </ul>`
  };
  transporter.sendMail(message, (err, info) => {
    if (err) return console.log(err);
    console.log('Mail send: ', info);
  });

  res.json({
    status: 'OK',
    data: user
  });
};

module.exports = {
  getUsers,
  getUser,
  getPasEmail,
  createUserM,
  deleteUser,
  sendMail
};
