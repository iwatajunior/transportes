-- Verificar se o tipo ENUM ainda existe
SELECT typname 
FROM pg_type 
WHERE typname = 'status_viagem' 
AND typname::text = 'Recusada';

-- Verificar se há registros com status Recusada
SELECT COUNT(*) as count 
FROM viagens 
WHERE status_viagem::text = 'Recusada';

-- Verificar se há views que referenciam o status Recusada
SELECT viewname 
FROM pg_views 
WHERE definition::text LIKE '%Recusada%';

-- Verificar se há triggers que referenciam o status Recusada
SELECT proname 
FROM pg_proc 
WHERE prosrc::text LIKE '%Recusada%';
