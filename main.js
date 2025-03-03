require('dotenv').config();
const path = require("path");
const express = require("express");
const cookieParser=require("cookie-parser");

const port=process.env.PORT || 9191;

//Routes
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const productsRoutes=require('./routes/productsRoutes');
const cartRoutes=require('./routes/cartRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const orderRoutes = require('./routes/orderRoutes');


const connectDB=require('./config/db');
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/',productsRoutes);
app.use('/cart',cartRoutes);
app.use('/seller',sellerRoutes);
app.use('/order',orderRoutes);


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})
