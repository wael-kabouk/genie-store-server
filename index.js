const express = require('express');
const mongoose = require('mongoose');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');
const productRouter = require('./routes/product');
const userRouter = require('./routes/user');
//init
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const app = express();
const dbUrl =
  'mongodb+srv://wael_kabouk:charisma2001@cluster0.jq6s8tp.mongodb.net/?retryWrites=true&w=majority';

//middleware
app.use(express.json());
app.use(authRouter);
app.use(adminRouter);
app.use(productRouter);
app.use(userRouter);

//conttections
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log('Connected Successfully');
  })
  .catch((e) => {
    console.log(e);
  });

app.listen(PORT, HOST, () => {
  console.log(`Listening at ${HOST}, on port ${PORT}`);
});
