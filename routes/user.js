const express = require('express');
const userRouter = express.Router();
const auth = require('../middlewares/auth');
const { Product } = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');

// userRouter.post('/api/add-to-cart', auth, async (req, res) => {
//   try {
//     const { id } = req.body;
//     let user = await User.findById(req.user);
//     const product = await Product.findById(id);

//     if (user.cart.length == 0) {
//       user.cart.push({ product, quantity: 1 });
//     } else {
//       let isProductFound = false;
//       for (let i = 0; i < user.cart.length; i++) {
//         if (user.cart[i].product._id.equals(product._id)) {
//           isProductFound = true;
//         }
//       }
//       if (isProductFound) {
//         let producttt = user.cart.find((productt) =>
//           productt.product._id.equals(product._id)
//         );
//         producttt.quantity += 1;
//       } else {
//         user.cart.push({ product, quantity: 1 });
//       }
//     }

//     user = await user.save();
//     res.json(user);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

userRouter.post('/api/add-to-cart', auth, async (req, res) => {
  try {
    const { id } = req.body;
    let user = await User.findById(req.user);
    const existingProduct = user.cart.find((prod) => {
      return prod.product._id.toString() === id;
    });

    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      let product = await Product.findById(id);
      user.cart.push({ product, quantity: 1 });
    }

    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRouter.delete('/api/remove-from-cart/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    let user = await User.findById(req.user);

    const productIndex = user.cart.findIndex(
      (prod) => prod.product._id.toString() === id
    );

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    if (user.cart[productIndex].quantity == 1) {
      user.cart.splice(productIndex, 1);
    } else {
      user.cart[productIndex].quantity--;
    }

    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// save user address
userRouter.post('/api/save-user-address', auth, async (req, res) => {
  try {
    const { address } = req.body;
    let user = await User.findById(req.user);
    user.address = address;
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// order product
// userRouter.post('/api/order', auth, async (req, res) => {
//   try {
//     const { cart, totalPrice, address } = req.body;
//     let products = [];

//     for (let i = 0; i < cart.length; i++) {
//       let product = await Product.findById(cart[i].product._id);
//       if (product.quantity >= cart[i].quantity) {
//         product.quantity -= cart[i].quantity;
//         products.push({ product, quantity: cart[i].quantity });
//         await product.save();
//       } else {
//         return res
//           .status(400)
//           .json({ msg: `${product.name} is out of stock!` });
//       }
//     }

//     let user = await User.findById(req.user);
//     user.cart = [];
//     user = await user.save();

//     let order = new Order({
//       products,
//       totalPrice,
//       address,
//       userId: req.user,
//       orderedAt: new Date().getTime(),
//     });
//     order = await order.save();
//     res.json(order);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

userRouter.post('/api/order', auth, async (req, res) => {
  try {
    const { cart, totalPrice, address } = req.body;

    var cartBySeller = {};

    for (let i = 0; i < cart.length; i++) {
      let product = await Product.findById(cart[i].product._id);
      if (product.quantity >= cart[i].quantity) {
        product.quantity -= cart[i].quantity;
        var sellerId = product.sellerId;
        if (!(sellerId in cartBySeller)) {
          cartBySeller[sellerId] = [];
        }
        cartBySeller[sellerId].push({ product, quantity: cart[i].quantity });
        await product.save();
      } else {
        return res
          .status(400)
          .json({ msg: `${product.name} is out of stock!` });
      }
    }

    let orders = [];
    for (const [key, value] of Object.entries(cartBySeller)) {
      let order = new Order({
        products: value,
        totalPrice,
        address,
        userId: req.user,
        sellerId: sellerId,
        orderedAt: new Date().getTime(),
      });
      order = await order.save();
      orders.push(order);
    }

    let user = await User.findById(req.user);
    user.cart = [];
    user = await user.save();

    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
userRouter.get('/api/orders/me', auth, async (req, res) => {
  try {
    let orders = await Order.find({ userId: req.user });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = userRouter;
