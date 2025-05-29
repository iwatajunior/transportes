SELECT DISTINCT status_viagem::text, 
       count(*) as quantidade
FROM viagens
GROUP BY status_viagem
ORDER BY status_viagem::text;
