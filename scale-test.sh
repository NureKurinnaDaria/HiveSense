#!/bin/bash
# Скрипт демонструє горизонтальне масштабування

echo "=== Запуск системи з 1 репліком ==="
docker compose up -d --scale api=1
sleep 10
echo "Зараз запущено:"
docker compose ps api

echo ""
echo "=== Масштабування до 3 реплік ==="
docker compose up -d --scale api=3
sleep 5
echo "Зараз запущено:"
docker compose ps api

echo ""
echo "=== Масштабування до 5 реплік ==="
docker compose up -d --scale api=5
sleep 5
echo "Зараз запущено:"
docker compose ps api

echo ""
echo "=== Зменшення до 2 реплік ==="
docker compose up -d --scale api=2
sleep 5
echo "Зараз запущено:"
docker compose ps api

echo "Готово! Запусти Locust для навантажувального тестування."