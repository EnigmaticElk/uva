var Product = require('./models/product.js');
var User = require('./models/user.js');
var Review = require('./models/review.js');
const Like = require('./models/likes.js');
var wineApiUtils = require('./utilities/wineApiUtils.js');
var NNUtils = require('./utilities/neuralNetworkUtils.js');
const NN = require('./neural-network.js');

module.exports.init = function(req, res) {
  var wines = {
    top10Reds: [],
    top10Whites: [],
    topRated: [],
  };
  Product.top10Reds(function(error, topReds) {
    if (error) {
      res.send(error);
    } else {
      wines.top10Reds = topReds;
      Product.top10Whites(function(error, topWhites) {
        if(error){
          res.send(error)
        } else {
          wines.top10Whites = topWhites;
          NNUtils.recommendations(req.user)
            .then((recommendations) => {
              wines.topRated = recommendations.filter((wine, i) => {
                return i < 10;
              })
              return Like.addLikesToWines(req.user, wines.topRated)
            })
            .then((response) => {
              wines.topRated = response;
              res.send(wines);
            })
            .catch((err) => {
              res.send(err);
            })
        }
      });
    }
  });
}

module.exports.passportAuth = (accessToken, refreshToken, profile, done) => {
  User.findUser(profile.displayName)
    .then((user) => {
      if (user.length === 0) {
        User.createUser(profile.displayName, accessToken)
          .then((user) => {
            done(null, user);
          })
      } else {
        done(null, user);
      }
    })
    .catch((err) => {
      done(err, null);
    })
}

module.exports.getWines = function(req, res) {
  // can be modified to take in a price from req/res later
  var price = 10;

  wineApiUtils.topRed(price, function(error, results) {
    Product.storeWines(results.Products.List, function() {
      wineApiUtils.topWhite(price, function(error, results) {
        Product.storeWines(results.Products.List, function() {
          res.send('storage of red and white wines complete!');
        });
      });
    });
  });
}

module.exports.search = function(req, res) {
  var query = req.body.search;
  var price = req.body.price || 10;

  Product.searchWines(query, price, function(error, results) {
    if(error){
      console.log('Error from server API request', error);
      res.sendStatus(404).send('not found')
    } else {
      res.send(results);
    }
  })
}


module.exports.usersUsername = function(req, res) {
  var username = req.body.username;

  User.checkuserName(username, function(error, valid, results){
    if(error){
      console.error(error)
      res.send(error);
    } else {
      console.log('results from checkuserName', results);
      res.send(results);
    }
  });
}

module.exports.review = function(req, res) {
  var content = req.body.review;
  var rating = req.body.rating;
  var product = req.body.product;
  var username = req.body.username;
  var product_id = req.body.product_id;
  var review = {
    content: content,
    rating: rating,
    product: product,
    username: username,
    product_id: product_id
  }
  Review.addReview(review, function(error, results){
    if(error){
      console.log('error inside dbUtils addReview', error);
    } else {
      console.log('success after add wine review', results);
      res.send(results)
    }
  })
}

module.exports.reviews = function(req, res) {
  var product_id = req.body.product_id;
  console.log('product inside reviews GET all', product_id);

  Review.getReviews(product_id, function(error, reviews){
    if(error){
      console.log('error in post-reviews')
      res.send(error)
    } else {
      res.send(reviews)
    }
  })
}

module.exports.likes = (req, res) => {
  if (!req.body.wine || !req.user) {
    res.status(400);
    res.end();
  } else {
    Like.addLike(req.user, req.body.wine._id, req.body.wine.like)
      .then(() => {
        return NNUtils.retrain(req.user, req.body.wine, req.body.wine.like)
      })
      .then((response) => {
        if (!response === 'success') {
          res.status(500);
        }
        res.end();
      })
      .catch((error) => {
        res.status(500);
        res.end();
      })
    }
}

module.exports.train = function(req, res) {
  const trainingData = NNUtils.transformQuestResultsToTrainingData(req.body);
  return User.findUser(req.user)
    .then((user) => {
      const trainedNN = NN.train(user[0].recommendation_profile, trainingData);
      const profile = trainedNN.toJSON();
      return User.updateUserNN(req.user, profile)
    })
    .then(() => {
      // might want to change this to response to a redirect once we incorporate the form 
      res.send('trained NN');
    })
    .catch((err) => {
      console.error(err);
      res.writeHead(500);
      res.end();
    })
}
