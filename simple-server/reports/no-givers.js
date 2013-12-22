function getResults (result) {
    print(tojson(result));
}

db.wishes.find({
  'removed': false,
  '$or': [
    { 'givers': { '$exists': false } },
    { 'givers': { '$size': 0 } }
  ]
}, { 'descr': 1 }).forEach(getResults);
