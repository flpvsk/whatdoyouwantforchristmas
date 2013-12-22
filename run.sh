ENV=${1:-DEV}
echo Starting with ENV: $ENV

kill -s 9 $(./pidof grunt)

cd client

if [ $ENV = "DEV" ]; then
  echo "Starting grunt watch"
  grunt watch &
fi

if [ $ENV = "production" ]; then
  echo "Building project"
  grunt build
fi


cd ../
NODE_ENV=$ENV nodemon simple-server/server.js
