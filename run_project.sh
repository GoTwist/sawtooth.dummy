if [ -n $(docker ps -aq | wc -l ) ]; then 
  docker rm -f $(docker ps -aq)
fi

docker container prune -f && docker volume prune -f && docker network prune -f

docker-compose -f docker-compose.yaml up -d
