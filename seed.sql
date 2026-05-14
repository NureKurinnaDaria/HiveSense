-- Запуск: Get-Content seed.sql | docker exec -i hivesense-backend-postgres-1 psql -U hivesense -d hivesense

INSERT INTO users (email, password, full_name, role, is_active, warehouse_id)
VALUES (
  'admin@hivesense.com',
  '$2b$10$HTy87nPdwUuasiH6YONWyuPddwNYg5cPX.1GjDfudp7B4TcVlrxsu',
  'Test Admin',
  'ADMIN',
  true,
  null
);