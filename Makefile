# starts the database
dbup:
	docker-compose up -d db

# starts all services
up: dbup
	sleep 20 && \
	node migrations/migrate.js && \
	docker-compose up -d

# stops all services
down:
	docker-compose down

# deletes the database files
reset: down
	rm -rf .pgdata
