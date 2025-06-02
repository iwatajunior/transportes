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
    
    switch (lowerStatus) {
        case 'pendente':
            return 'default'; // Cinza para Pendente
        case 'agendada':
            return 'warning'; // Amarelo para Agendada
        case 'andamento':
            return 'primary'; // Azul para Andamento
        case 'concluida':
            return 'success'; // Verde para Concluída
        case 'cancelada':
            return 'error'; // Vermelho para Cancelada
        default:
            return 'default';
    }
};
