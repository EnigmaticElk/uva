const NN = require('../neural-network.js');
const Product = require('../models/product.js');

const convertWinetoNeuron = (wine) => {
  let type = wine.redORwhite === 'Red Wines' ? 1 : 0;
  let price = wine.priceMin / 100;
  let cab = wine.type === 'Cabernet Sauvignon' ? 1 : 0;
  let merlot = wine.type === 'Merlot' ? 1 : 0;
  let chard = wine.type === 'Chardonnay' ? 1 : 0;
  let sauv = wine.type === 'Sauvignon Blanc' ? 1 : 0;
  return [type, cab, merlot, chard, sauv, price];
}

module.exports.recommendations = (username) => { 
  return Product.allWines()
    .then((wines) => {
      return wines.map((wine) => {
        return convertWinetoNeuron(wine);
      })
    })
}

module.exports.recommendations()
  .then((queries) => {
    console.log(queries);
  })
  .catch((err) => {
    console.error(err);
  })