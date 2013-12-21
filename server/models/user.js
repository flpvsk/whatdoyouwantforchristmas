var crypto = require('crypto'),
    async = require('async'),
    util = require('util'),
    AuthError = require('../error').AuthError,
    ValidationError = require('../error').ValidationError;

var mongoose = require('../lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  "fbId": {
    type: String
  },
  "name": {
    type: String
  },
  "first_name": {
    type: String
  },
  "last_name": {
    type: String
  },
  "link": {
    type: String
  },
  "username": {
    type: String
  },
  "hometown": {
    type: Object
  },
  "location": {
    type: Object
  },
  "sports": {
    type: Array
  },
  "favorite_teams": {
    type: Array
  },
  "education": {
    type: Array
  },
  "gender": {
    type: String
  },
  "email": {
    type: String
  },
  "timezone": {
    type: Number
  },
  "locale": {
    type: String
  },
  "verified": {
    type: Boolean
  },
  "updated_time": {
    type: String
  },
  "friends": {
    type: Array
  },
  wishlist: {
    type: Array
  }
}, { versionKey: false });

module.exports = mongoose.model('User', schema);