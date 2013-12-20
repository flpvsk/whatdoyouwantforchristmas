cd client
grunt build
cd ..
git add -u .
git commit -m 'Build'
git push heroku release:master
