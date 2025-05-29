export const getStatusColor = (status) => {
    if (!status) return 'default';
    
    switch (status.toLowerCase()) {
        case 'agendada':
            return 'warning';
        case 'andamento':
            return 'info';
        case 'concluída':
            return 'success';
        case 'cancelada':
        case 'recusada':
            return 'error';
        default:
            return 'default';
    }
};

export const getStatusChipColor = (status) => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus === 'agendada') return 'warning';
    if (lowerStatus.includes('concluída') || lowerStatus.includes('realizada')) return 'success';
    if (lowerStatus.includes('andamento') || lowerStatus.includes('iniciada')) return 'info';
    if (lowerStatus.includes('cancelada') || lowerStatus.includes('recusada')) return 'error';
    return 'default';
};
