var mongoose = require('mongoose');
var db = require('../../database-mongo/index.js');
var Product = require('../../database-mongo/models/Product');

module.exports = {

  allWines: () => {
    return Product.find({}, (err, results) => {
      return new Promise((resolve, reject) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      })
    })
  },

  searchWines: function(query, price, callback){
    console.log('searching', query);
    console.log('searching', price);
    Product.find({ "name": {"$regex": query, "$options": "i"}, "priceMin": {$lt: price, $gt: price-10}}).limit(50).sort({apiRating: -1}).exec(function(error, results){
      if(error){
        callback(error, null)
        } else {
          console.log('results searching', results)
        callback(null, results);
      }
    })
  },
   
  addWine: function(wine, callback) {
    Product.create(wine, function(error, results){
      if(error){
        callback(error, null)
      } else {
        callback(null, results);
      }
    })
  },

  top10Reds: function(callback) { //TODO: test against populated database once forcedRequest is up, or against dummy data
    // return db.Product.find({redORwhite:'Red Wines'}).sort({rating: -1}).limit(10)
    Product.find({redORwhite:'Red Wines'}).limit(10).sort({apiRating: -1}).exec(function(error, results){
      if(error){
        console.log('DB FIND TOP 10 ERRROR')
        callback(error, results)
      } else {
        console.log('TOP10RED')
        callback(error, results)
      }
    })
  },

  top10Whites: function(callback) { //TODO: test against populated database once forcedRequest is up, or against dummy data

    // return db.Product.findAsync({redORwhite:'White Wines'}).sort({rating: -1}).limit(10)
    Product.find({redORwhite:'White Wines'}).limit(10).sort({apiRating: -1}).exec(function(error, results){
      if(error){
        callback(error, null)
      } else {
        console.log('TOP10WHITE')
        callback(null, results)
      }
    })
  },

  top10Rated: function(callback) { //TODO: test against populated database once forcedRequest is up, or against dummy data
    // return db.Product.findAsync({}).sort({rating:-1}).limit(10)
    Product.find({}).limit(10).sort({apiRating:-1}).exec(function(error, results){
      if(error){
        callback(error, null)
      } else {
        console.log('TOP10')
        callback(null, results)
      }
    })
  },

  storeWines(wines, callback) {
    let promises = wines.map(function(wine) {
      return new Promise(function(res, rej) {
        Product.create({
          name: wine.Name,
          year: wine.Vintage,
          type: wine.Varietal.Name,
          redORwhite: wine.Varietal.WineType.Name,
          origin: wine.Appellation.Name,
          region: wine.Appellation.Region.Name,
          priceMin: wine.PriceMin,
          priceMax: wine.PriceMax,
          apiRating: wine.Ratings.HighestScore
        }, function(err, results) {
          res();
        });
      });
    });
    Promise.all(promises)
    .then(function() {
      callback();
    });
  }

}