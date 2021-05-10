const shortid = require('shortid');
const { validate } = require('jsonschema');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = require('../db/db');

const secret = '1siRnaYfI';

const generateAccessToken = (userName, hashPassword, checkToken) => {
  const payload = {
    userName,
    hashPassword,
    checkToken,
  };
  return jwt.sign(payload, secret, { expiresIn: '6h' });
};

const checkUserName = (req, res, next) => {
  const { userName } = req.params;

  const user = db
    .get('users')
    .find({ userName })
    .value();

  if (!user) {
    return res.json({
      status: 'OK'
    });
  }
  return res.json({
    status: 'CANCEL'
  });
};

const checkMail = (req, res, next) => {
  const { email } = req.params;

  const user = db
    .get('users')
    .find({ email })
    .value();

  if (!user) {
    return res.json({
      status: 'OK'
    });
  }
  return res.json({
    status: 'CANCEL'
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

  const userData = {
    userId: '',
    interface: {
      expense: [
        {
          title: 'Продукты',
          color: '#ce4b99',
          icon: 'add_shopping_cart'
        },
        {
          title: 'Квартплата',
          color: '#b1c94e',
          icon: 'apartment'
        },
        {
          title: 'Досуг',
          color: '#563227',
          icon: 'outdoor_grill'
        },
        {
          title: 'Транспорт',
          color: '#cf7e1a',
          icon: 'drive_eta'
        },
        {
          title: 'Здоровье',
          color: '#601480',
          icon: 'local_hospital'
        },
        {
          title: 'Подарки',
          color: '#377bbc',
          icon: 'cake'
        },
        {
          title: 'Семья',
          color: '#A50606',
          icon: 'family_restroom'
        },
        {
          title: 'Покупки',
          color: '#138539',
          icon: 'local_grocery_store'
        },
        {
          title: '',
          color: '#00B7C6',
          icon: 'beach_access'
        },
        {
          title: '',
          color: '#EA09B9',
          icon: 'ac_unit'
        },
        {
          title: '',
          color: '#d0db00',
          icon: 'fitness_center'
        },
        {
          title: '',
          color: '#09EA9B',
          icon: 'hiking'
        }
      ],
      income: [
        {
          title: 'Зарплата',
          color: '#ce4b99',
          icon: ''
        },
        {
          title: 'Вклады',
          color: '#b1c94e',
          icon: ''
        },
        {
          title: '',
          color: '#563227',
          icon: ''
        },
        {
          title: '',
          color: '#cf7e1a',
          icon: ''
        },
        {
          title: '',
          color: '#601480',
          icon: ''
        },
        {
          title: '',
          color: '#377bbc',
          icon: ''
        }
      ]
    },
    costs: []
  };

  const { userName, password, email } = req.body;
  const tempEmail = email.toLowerCase();
  const hashPassword = bcrypt.hashSync(password.toLowerCase(), 7);
  const checkToken = req.ip;
  const user = {
    id: shortid.generate(),
    userName,
    hashPassword,
    email: tempEmail
  };

  userData.userId = user.id;

  const token = generateAccessToken(user.userName, user.hashPassword, checkToken);

  try {
    db.get('users')
      .push(user)
      .write();

    db.get('userData')
      .push(userData)
      .write();
  } catch (error) {
    throw new Error(error);
  }

  res.json({
    status: 'OK',
    token
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
  const checkToken = req.ip;

  const user = db
    .get('users')
    .find({ userName })
    .value();

  const userData = db
    .get('userData')
    .find({ userId: user.id })
    .value();

  if (!user) {
    return res.json({ status: 'ERROR' });
  }

  if (user.userName === userName && bcrypt.compareSync(password, user.hashPassword)) {
    const token = generateAccessToken(user.userName, user.hashPassword, checkToken);

    return res.json({
      status: 'OK',
      token,
      userData
    });
  }
  return res.json({ status: 'FALSE' });
};

const authUser = (req, res, next) => {
  const userSchema = {
    type: 'object',
    properties: {
      token: { type: 'string' }
    },
    required: ['token'],
    additionalProperties: false
  };

  const validationResult = validate(req.body, userSchema);
  if (!validationResult.valid) {
    throw new Error('INVALID_JSON_OR_API_FORMAT');
  }

  const payload = jwt.verify(req.body.token, secret);

  const { userName, hashPassword, checkToken } = payload;

  const user = db
    .get('users')
    .find({ userName })
    .value();

  const userData = db
    .get('userData')
    .find({ userId: user.id })
    .value();

  if (!user || checkToken !== req.ip) {
    return res.json({ status: 'ERROR' });
  }
  if (user.userName === userName && hashPassword === user.hashPassword) {
    return res.json({
      status: 'OK',
      data: user.userName,
      userData
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
      user: 'financial-manager-angular@mail.ru',
      pass: 'CdWqYU6E([*wVGm2',
    }
  },
  {
    from: 'Financial manager <financial-manager-angular@mail.ru>',
  }
);

const sendMail = (req, res, next) => {
  const { value } = req.params;

  let user = db
    .get('users')
    .find({ userName: value })
    .value();

  if (!user) {
    user = db
      .get('users')
      .find({ email: value })
      .value();

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
  }

  const password = shortid.generate()
    .toLowerCase();
  user.hashPassword = bcrypt.hashSync(password, 7);

  db.get('users')
    .find({ email: user.email })
    .assign(user)
    .value();

  db.write();

  const message = {
    to: user.email,
    subject: 'Отправляем данные вашей учетной записи с новым паролем',
    html: `<h2>Данные вашей учетной записи</h2>
      <ul>
      <li>логин: <i>${user.userName}</i></li>
      <li>новый пароль: <i>${password}</i></li>
      </ul>`
  };
  transporter.sendMail(message, (err, info) => {
    if (err) return console.log(err);
    console.log('Mail send: ', info);
  });

  res.json({
    status: 'OK',
  });
};

module.exports = {
  checkUserName,
  checkMail,
  userReg,
  sendMail,
  logInUser,
  authUser
};
