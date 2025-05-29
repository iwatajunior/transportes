# Script para configurar o PostgreSQL para permitir conexões remotas

# Caminho do arquivo de configuração
$pgHbaPath = "C:\Program Files\PostgreSQL\16\data\pg_hba.conf"

# Adicionar regra para permitir conexões do IP específico
Add-Content -Path $pgHbaPath -Value "`n# Permitir conexões do IP 10.1.1.42`nhost    all             postgres        10.1.1.42/32            md5`n"

# Configurar o PostgreSQL para aceitar conexões de rede
$postgresqlConfPath = "C:\Program Files\PostgreSQL\16\data\postgresql.conf"
Add-Content -Path $postgresqlConfPath -Value "`n# Configurar para aceitar conexões de rede`nlisten_addresses = '*'`n"

# Reiniciar o serviço PostgreSQL
Write-Host "Reiniciando o serviço PostgreSQL..."
Restart-Service postgresql-x64-16 -Force

Write-Host "Configuração concluída! O PostgreSQL agora aceita conexões do IP 10.1.1.42."
