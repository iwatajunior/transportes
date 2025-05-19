# Estilos e Animações - RotaVeiculo

## Componente Principal
```javascript
const RotaContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  padding: theme.spacing(1, 0),
  height: 'auto',
  overflow: 'visible',
  minWidth: '100%',
  flex: 1
}));
```

## Linha da Rota
```javascript
const LinhaRota = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '20px',
  left: 0,
  right: 0,
  height: theme.spacing(0.75),
  backgroundColor: ({ isReturning, theme }) => 
    isReturning ? theme.palette.warning.main : theme.palette.success.main,
  zIndex: 0
}));
```

## Container de Cidade
```javascript
const CidadeContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '100px',
  padding: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    zIndex: 1
  }
}));
```

## Animação do Caminhão
```javascript
const AnimatedCaminhao = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '10px',
  width: theme.spacing(6),
  height: theme.spacing(6),
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1)',
    zIndex: 2
  }
}));
```

## Estilos do Ícone do Caminhão
```javascript
const caminhaoStyle = {
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1)'
  }
};
```

## Progresso do Caminhão
```javascript
const getProgressStyle = (index) => ({
  position: 'absolute',
  top: '10px',
  left: `${progress}%`,
  transform: isReturning ? 'scaleX(-1)' : 'scaleX(1)',
  transition: 'all 0.5s ease-in-out'
});
```

## Animação Spring
```javascript
const springProps = useSpring({
  opacity: isPaused ? 0.5 : 1,
  config: { duration: 500 }
});
```

## Estilos do Ícone de Localização
```javascript
const locationIconStyle = {
  fontSize: theme.spacing(3),
  position: 'relative',
  top: '-10px',
  mb: 1,
  transition: 'transform 0.3s ease-in-out'
};
```

## Estilos do Texto da Cidade
```javascript
const cidadeTextStyle = {
  mt: theme.spacing(0.5),
  fontSize: theme.typography.body2.fontSize,
  fontWeight: 500,
  color: 'text.primary',
  textTransform: 'capitalize',
  position: 'relative',
  top: '-10px'
};
```

## Notas Importantes
- A rota é representada por uma linha verde que conecta todos os pontos da viagem
- O caminhão se move ao longo da linha com uma animação suave
- Os ícones de localização aparecem acima da linha
- O caminhão pode ser pausado/corrido clicando nele ou na linha
- O caminhão muda de direção (inverte) quando em modo de volta
- Os pontos de parada são destacados com um efeito de escala ao passar o mouse
- O caminhão também tem um efeito de escala ao passar o mouse
- As cores da linha mudam dependendo do modo (ida/volta)
