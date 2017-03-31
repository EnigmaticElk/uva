const NN = require('../neural-network.js');
const Product = require('../models/product.js');
const User = require('../models/user.js');
const synaptic = require("synaptic");

const convertWinetoNeuron = (wine) => {
  let obj = {details: wine};
  let type = wine.redORwhite === 'Red Wines' ? 1 : 0;
  let price = wine.priceMin / 100;
  let cab = wine.type === 'Cabernet Sauvignon' ? 1 : 0;
  let merlot = wine.type === 'Merlot' ? 1 : 0;
  let chard = wine.type === 'Chardonnay' ? 1 : 0;
  let sauv = wine.type === 'Sauvignon Blanc' ? 1 : 0;
  obj.neurons = [type, cab, merlot, chard, sauv, price];
  return obj;
}

module.exports.recommendations = (username) => {
  let profile = null;
  let wineNeurons = null;
  let recommendations = null;
  return Product.allWines()
    .then((wines) => {
      wines = wines.map((wine) => {
        return convertWinetoNeuron(wine);
      })
      return User.findUser(username)
        .then((user) => {
          if (user[0]) {
            profile = synaptic.Network.fromJSON(user[0].recommendation_profile);
          }
          recommendations = wines.map((wine) => {
            let obj = {details: wine.details};
            obj.rating = profile.activate(wine.neurons)[0];
            return obj;
          })
          return recommendations.sort((a, b) => {
            return b.rating - a.rating;
          });
        })
    })
}

// module.exports.recommendations('Tyler Arbus')
//   .then((queries) => {
//     console.log(queries);
//   })
//   .catch((err) => {
//     console.error(err);
//   })