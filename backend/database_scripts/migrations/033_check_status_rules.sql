-- Verificar regras de status do veículo
SELECT DISTINCT status_viagem::text as status_viagem FROM viagens WHERE veiculo_alocado_id = 3 AND status_viagem IN ('Pendente', 'Andamento', 'EmAndamento'); SELECT proname, prosrc FROM pg_proc WHERE prosrc LIKE '%status_veiculo%' OR prosrc LIKE '%update_status%' OR prosrc LIKE '%check_status%';
