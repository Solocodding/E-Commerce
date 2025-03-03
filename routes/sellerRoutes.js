const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const { sellerCheck }  = require("../middlewares/sellerCheck");
const {addProduct,deleteProduct,editProduct} = require("../controller/adminController");
const Product = require("../model/Product");

router.get('/', verifyToken, sellerCheck, async (req, res) => {

    if (!req.isAuthenticated) {
        return res.redirect('/auth/login');
    }
    try {
        // Ensure the user is a seller
        if (!req.user.role==="seller") {
            return res.status(403).send('Access denied. Only sellers can access this page.');
        }

        // Fetch the products that belong to the authenticated seller
        const products = await Product.find({ sellerId: req.user._id, isDeleted: false });

        // Render the seller's dashboard and pass the seller's products to the template
        res.render('seller/dashboard', {
            isAuthenticated: req.isAuthenticated,
            user: req.user,
            products: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }

    
});
router.get('/addProduct', verifyToken, sellerCheck, (req, res) => {
    if (!req.isAuthenticated) {
        res.redirect('/auth/login');
    } else {
        res.render('seller/addProduct', {
            isAuthenticated: req.isAuthenticated,
            user: req.user,
        });
    }
});
router.get('/editProduct/:id', verifyToken, sellerCheck, async(req, res) => {
    if (!req.isAuthenticated) {
        res.redirect('/auth/login');    
    } else {
        const product=await Product.findById(req.params.id);

        if(product) {
            res.render('seller/editProduct', {
                product: product,
                isAuthenticated: req.isAuthenticated,
                user: req.user,
            });
        }
        else{
            return res.status(404).json({ message: 'Product not found' });
        }
    }
});

router.post('/addProduct', verifyToken, sellerCheck, addProduct);

router.post('/deleteProduct/:id', verifyToken, sellerCheck,deleteProduct);

router.post('/editProduct/:id', verifyToken, sellerCheck, editProduct);

module.exports = router;
