# starts the database
dbup:
	docker-compose up -d db

# starts all services
up: dbup
	sleep 60 && make migrate
	docker-compose up -d
	docker-compose logs -f nuxt

# stops all services
down:
	docker-compose down

# migrates the database up
migrate: dbup
	docker exec -it ontology-editor_db_1 /migrations/up.sh

# migrates the database down
drop: dbup
	docker exec -it ontology-editor_db_1 /migrations/down.sh

# deletes the database files
reset: down
	rm -rf .pgdata
