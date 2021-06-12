const jwt = require('jsonwebtoken');
const { validate } = require('jsonschema');

const db = require('../db/db');

const secret = '1siRnaYfI';

const change = (req, res, next) => {
  const userSchema = {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      typeInterface: { type: 'string' },
      interface: { type: 'obj' },
      token: { type: 'string' }
    },
    required: ['userId', 'interface', 'typeInterface', 'token'],
    additionalProperties: false
  };

  const validationResult = validate(req.body, userSchema);
  if (!validationResult.valid) {
    throw new Error('INVALID_JSON_OR_API_FORMAT');
  }

  const { userId, token } = req.body;
  const dataInterface = req.body.interface;
  const payload = jwt.verify(token, secret);
  const { typeInterface } = req.body;

  if (payload.checkToken === req.ip) {
    try {
      const userData = db
        .get('userData')
        .find({ userId })
        .value();

      if (typeInterface === 'income') {
        userData.interface.income = dataInterface;
      }
      if (typeInterface === 'cost') {
        userData.interface.expense = dataInterface;
      }

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

module.exports = {
  change
};
