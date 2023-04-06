const express = require('express');
const adminRouter = express.Router();
const admin = require('../middlewares/admin');
const { Product } = require('../models/product');
const Order = require('../models/order');

//add a product
adminRouter.post('/admin/add-product', admin, async (req, res) => {
  try {
    const { name, description, price, quantity, imagesUrls, category } =
      req.body;
    let product = new Product({
      name,
      description,
      price,
      quantity,
      imagesUrls,
      category,
      sellerId: req.user,
    });

    product = await product.save();
    res.json({ product });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRouter.get('/admin/get-products', admin, async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user });
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRouter.post('/admin/delete-product', admin, async (req, res) => {
  try {
    const { id } = req.body;
    let product = await Product.findByIdAndDelete(id);
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRouter.get('/admin/get-orders', admin, async (req, res) => {
  try {
    const orders = await Order.find({ 'products.product.sellerId': req.user });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRouter.post('/admin/change-order-status', admin, async (req, res) => {
  try {
    const { id, status } = req.body;
    let order = await Order.findById(id);
    order.status = status;
    order = await order.save();
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

adminRouter.get('/admin/analytics', admin, async (req, res) => {
  try {
    const orders = await Order.find({ 'products.product.sellerId': req.user });
    let totalEarnings = 0;

    for (let i = 0; i < orders.length; i++) {
      for (let j = 0; j < orders[i].products.length; j++) {
        totalEarnings +=
          orders[i].products[j].quantity * orders[i].products[j].product.price;
      }
    }
    // CATEGORY WISE ORDER FETCHING
    let mobileEarnings = await fetchCategoryWiseProduct('Mobiles', req.user);
    let essentialEarnings = await fetchCategoryWiseProduct(
      'Essentials',
      req.user
    );
    let applianceEarnings = await fetchCategoryWiseProduct(
      'Appliances',
      req.user
    );
    let booksEarnings = await fetchCategoryWiseProduct('Books', req.user);
    let fashionEarnings = await fetchCategoryWiseProduct('Fashion', req.user);

    let earnings = {
      totalEarnings,
      mobileEarnings,
      essentialEarnings,
      applianceEarnings,
      booksEarnings,
      fashionEarnings,
    };

    res.json(earnings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

async function fetchCategoryWiseProduct(category, sellerId) {
  let earnings = 0;
  let categoryOrders = await Order.find({
    'products.product.sellerId': sellerId,
    'products.product.category': category,
  });

  for (let i = 0; i < categoryOrders.length; i++) {
    for (let j = 0; j < categoryOrders[i].products.length; j++) {
      earnings +=
        categoryOrders[i].products[j].quantity *
        categoryOrders[i].products[j].product.price;
    }
  }
  return earnings;
}

module.exports = adminRouter;
