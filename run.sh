kill -s 9 $(./pidof grunt)
cd client
grunt watch &
cd ../
NODE_ENV=DEV nodemon simple-server/server.js
