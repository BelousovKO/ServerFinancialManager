const jwt = require('jsonwebtoken');
const { validate } = require('jsonschema');

const db = require('../db/db');

const secret = '1siRnaYfI';

const change = (req, res, next) => {
  const userSchema = {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      expense: { type: 'arr' },
      token: { type: 'string' }
    },
    required: ['userId', 'expense', 'token'],
    additionalProperties: false
  };

  const validationResult = validate(req.body, userSchema);
  if (!validationResult.valid) {
    throw new Error('INVALID_JSON_OR_API_FORMAT');
  }

  const { userId, expense, token } = req.body;
  const payload = jwt.verify(token, secret);

  if (payload.checkToken === req.ip) {
    try {
      const userData = db
        .get('userData')
        .find({ userId })
        .value();
      userData.interface.expense = expense;

      db
        .get('userData')
        .write();
    } catch (error) {
      throw new Error(error);
    }

    res.json({
      status: 'OK'
    });
  }
};

const test = (req, res, next) => {
  const { userId } = req.params;
  console.log(userId);
  res.json({
    status: 'OK'
  });
};

module.exports = {
  change,
  test
};