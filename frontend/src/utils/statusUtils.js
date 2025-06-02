export const getStatusColor = (status) => {
    if (!status) return 'default';
    
    switch (status.toLowerCase()) {
        case 'disponivel':
            return 'success';
        case 'emmanutencao':
            return 'warning';
        case 'indisponivel':
            return 'error';
        default:
            return 'default';
    }
};

export const getStatusChipColor = (status) => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus === 'disponivel') return 'success';
    if (lowerStatus === 'emmanutencao') return 'warning';

    if (lowerStatus === 'indisponivel') return 'error';
    return 'default';
};
