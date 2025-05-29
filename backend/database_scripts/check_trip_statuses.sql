-- Verificar todos os status existentes
SELECT DISTINCT status_viagem FROM viagens ORDER BY status_viagem;

-- Contagem de viagens por status
SELECT 
    status_viagem,
    COUNT(*) as quantidade
FROM viagens
GROUP BY status_viagem
ORDER BY status_viagem;

-- Verificar todos os registros com detalhes
SELECT 
    viagemid,
    status_viagem,
    data_saida,
    destino_completo,
    finalidade
FROM viagens
ORDER BY status_viagem, data_saida;
