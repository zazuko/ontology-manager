# starts the database
dbup:
	docker-compose up -d db

# starts all services
up: dbup
	node setup/migrate.js

# stops all services
down:
	docker-compose down

# deletes the database files
reset: down
	rm -rf .pgdata

localup: reset
	docker-compose up -d
	docker-compose logs -f
