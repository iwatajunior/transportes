const RouteStatus = {
  AGENDADA: 'Agendada',
  ANDAMENTO: 'Andamento',
  CONCLUIDA: 'Concluida',
  CANCELADA: 'Cancelada'
};

const routeStatusValues = Object.values(RouteStatus);

module.exports = {
  RouteStatus,
  routeStatusValues
};
