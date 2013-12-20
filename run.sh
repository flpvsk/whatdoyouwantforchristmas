kill -s 9 $(./pidof grunt)
cd client
grunt watch &
cd ../
node simple-server/server.js
