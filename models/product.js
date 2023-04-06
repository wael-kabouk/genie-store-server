const mongose = require('mongoose');
const ratingSchema = require('./rating');

const productSchema = mongose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },

  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  imagesUrls: [
    {
      type: String,
      required: true,
    },
  ],
  category: {
    type: String,
    required: true,
    trim: true,
  },

  ratings: [ratingSchema],
  sellerId: { type: String, required: true },
});

const Product = mongose.model('Product', productSchema);

module.exports = { Product, productSchema };
