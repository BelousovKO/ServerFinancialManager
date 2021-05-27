const jwt = require('jsonwebtoken');
const { validate } = require('jsonschema');
const shortid = require('shortid');

const db = require('../db/db');

const secret = '1siRnaYfI';

const create = (req, res, next) => {
  const userSchema = {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      typeTransaction: { type: 'string' },
      title: { type: 'string' },
      date: { type: 'string' },
      category: { type: 'number' },
      amount: { type: 'number' },
      token: { type: 'string' }
    },
    required: ['userId', 'typeTransaction', 'title', 'date', 'category', 'amount', 'token'],
    additionalProperties: true
  };

  const validationResult = validate(req.body, userSchema);
  if (!validationResult.valid) {
    throw new Error('INVALID_JSON_OR_API_FORMAT');
  }

  const {
    userId, typeTransaction, title, date, category, amount, token
  } = req.body;

  const transaction = {
    id: shortid.generate(),
    title,
    date,
    category,
    amount
  };

  const payload = jwt.verify(token, secret);

  const userData = db
    .get('userData')
    .find({ userId })
    .value();

  if (payload.checkToken === req.ip) {
    try {
      if (typeTransaction === 'cost') {
        userData.costs.push(transaction);
      } else {
        userData.income.push(transaction);
      }

      db
        .get('userData')
        .write();
    } catch (error) {
      throw new Error(error);
    }

    res.json({
      status: 'OK',
      data: transaction
    });
  }
};

module.exports = {
  create
};
