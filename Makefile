# starts the database
dbup:
	docker-compose up -d db

# starts all services
up: dbup
	sleep 30 && make migrate
	docker-compose up -d

# stops all services
down:
	docker-compose down

# migrates the database up
migrate: dbup
	docker-compose exec db /migrations/up.sh

# migrates the database down
drop: dbup
	docker-compose exec db /migrations/down.sh

# deletes the database files
reset: down
	rm -rf .pgdata
