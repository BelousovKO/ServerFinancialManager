const shortid = require('shortid');
const { validate } = require('jsonschema');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = require('../db/db');

const generateAccessToken = (username, hashPassword) => {
  const payload = {
    username,
    hashPassword,
  };
  const secret = 'secret_kye';
  return jwt.sign(payload, secret, { expiresIn: '6h' });
};

const checkUserName = (req, res, next) => {
  const { userName } = req.params;

  const user = db
    .get('users')
    .find({ userName })
    .value();

  if (!user) {
    res.json({
      status: 'OK',
      data: user
    });
  } else {
    res.json({
      status: 'CANCEL'
    });
  }
};

const getPasEmail = (req, res, next) => {
  const { email } = req.params;

  const user = db
    .get('users')
    .find({ email })
    .value();

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  res.json({
    status: 'OK',
    data: user
  });
};

const userReg = (req, res, next) => {
  const userSchema = {
    type: 'object',
    properties: {
      userName: { type: 'string' },
      password: { type: 'string' },
      email: { type: 'string' }
    },
    required: ['userName', 'password', 'email'],
    additionalProperties: true
  };

  const validationResult = validate(req.body, userSchema);
  if (!validationResult.valid) {
    throw new Error('INVALID_JSON_OR_API_FORMAT');
  }

  const { userName, password, email } = req.body;
  const hashPassword = bcrypt.hashSync(password, 7);
  const user = {
    id: shortid.generate(),
    userName,
    hashPassword,
    email
  };

  try {
    db.get('users')
      .push(user)
      .write();
  } catch (error) {
    throw new Error(error);
  }

  res.json({
    status: 'OK'
  });
};

const logInUser = (req, res, next) => {
  const userSchema = {
    type: 'object',
    properties: {
      userName: { type: 'string' },
      password: { type: 'string' }
    },
    required: ['userName', 'password'],
    additionalProperties: false
  };

  const validationResult = validate(req.body, userSchema);
  if (!validationResult.valid) {
    throw new Error('INVALID_JSON_OR_API_FORMAT');
  }

  const { userName, password } = req.body;

  const user = db
    .get('users')
    .find({ userName })
    .value();

  if (!user) {
    return res.json({ status: 'ERROR' });
  }
  if (user.userName === userName && bcrypt.compareSync(password, user.hashPassword)) {
    const token = generateAccessToken(user.userName, user.hashPassword);

    return res.json({
      status: 'OK',
      token,
    });
  }
  return res.json({ status: 'FALSE' });
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
  const { email } = req.params;

  const user = db
    .get('users')
    .find({ email })
    .value();

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const message = {
    to: user.email,
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
  checkUserName,
  getPasEmail,
  userReg,
  sendMail,
  logInUser
};
