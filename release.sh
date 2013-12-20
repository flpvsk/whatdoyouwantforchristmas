cd client
grunt build
cd ..
git add -u .
git add .
git commit -m 'Build'
git push heroku release:master
