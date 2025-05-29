import React from 'react';
import { 
    Card, 
    CardHeader, 
    Avatar, 
    IconButton, 
    Box,
    Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[8],
    },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 48,
    height: 48,
    fontSize: '1.2rem',
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
    padding: theme.spacing(2),
    '& .MuiCardHeader-content': {
        flex: '1 1 auto',
    },
    '& .MuiCardHeader-action': {
        marginLeft: 'auto',
    },
}));

const ActionCard = ({ 
    icon, 
    title, 
    onExpand, 
    expanded,
    children,
    subtitle
}) => {
    return (
        <StyledCard>
            <StyledCardHeader
                avatar={
                    <StyledAvatar>
                        {icon}
                    </StyledAvatar>
                }
                title={
                    <Box display="flex" flexDirection="column">
                        <Typography variant="h6" component="h6" gutterBottom>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" color="textSecondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                }
                action={
                    <IconButton
                        aria-label="expand"
                        size="small"
                        onClick={onExpand}
                    >
                        <ExpandMoreIcon 
                            sx={{ 
                                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease-in-out'
                            }} 
                        />
                    </IconButton>
                }
            />
            {children}
        </StyledCard>
    );
};

export default ActionCard;
