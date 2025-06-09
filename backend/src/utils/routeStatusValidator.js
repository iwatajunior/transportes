const { routeStatusValues } = require('../constants/routeStatus');

const validateRouteStatus = (status) => {
  if (!routeStatusValues.includes(status)) {
    throw new Error(`Status inválido. Status deve ser um dos seguintes valores: ${routeStatusValues.join(', ')}`);
  }
  return status;
};

module.exports = validateRouteStatus;
