export const TRIP_STATUS = {
    PENDING: 'Pendente',
    SCHEDULED: 'Agendada',
    IN_PROGRESS: 'Andamento',
    COMPLETED: 'Concluida',
    CANCELLED: 'Cancelada',
    REJECTED: 'Recusada'
};

export const TRIP_STATUS_OPTIONS = Object.values(TRIP_STATUS);

export const TRIP_STATUS_COLORS = {
    [TRIP_STATUS.PENDING]: 'warning',
    [TRIP_STATUS.SCHEDULED]: 'primary',
    [TRIP_STATUS.IN_PROGRESS]: 'primary',
    [TRIP_STATUS.COMPLETED]: 'success',
    [TRIP_STATUS.CANCELLED]: 'error',
    [TRIP_STATUS.REJECTED]: 'error'
};
