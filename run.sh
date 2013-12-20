kill -s 9 $(./pidof grunt)
cd client
grunt watch &
cd ../
nodemon simple-server/server.js
