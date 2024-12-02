docker stop sep-auth-service
docker rm sep-auth-service
docker build -f Dockerfile -t auth-service ./..
docker run --network=host --name sep-auth-service -p 8080:8080 -p 8081:8081 auth-service