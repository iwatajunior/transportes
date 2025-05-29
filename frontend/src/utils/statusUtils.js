export const getStatusColor = (status) => {
    if (!status) return 'default';
    
    switch (status.toLowerCase()) {
        case 'pendente':
            return 'warning';
        case 'aprovada':
        case 'em andamento':
            return 'primary';
        case 'concluída':
            return 'success';
        case 'cancelada':
        case 'rejeitada':
            return 'error';
        default:
            return 'default';
    }
};
