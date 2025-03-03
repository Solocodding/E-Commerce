const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const {adminCheck} = require("../middlewares/adminCheck");
const {addProduct,deleteProduct,editProduct} = require("../controller/adminController");
const Product = require("../model/Product");

router.get("/", verifyToken, adminCheck, async (req, res) => {
    if (!req.isAuthenticated) {
        return res.redirect('/auth/login');
    }
    try {
        // Ensure the user is an admin
        if (!req.user.role==="admin") {
            return res.status(403).send('Access denied. Only admins can access this page.');
        }
        
        // Fetch all products
        const products = await Product.find({isDeleted:false});
        
        // Render the admin dashboard and pass the products to the template
        res.render('admin/dashboard', {
            isAuthenticated: req.isAuthenticated,
            user: req.user,
            products: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

router.post("/addProduct", verifyToken, addProduct);

router.post("/deleteProduct", verifyToken, deleteProduct); 

router.post("/editProduct/:id", verifyToken, editProduct);
  
module.exports = router;  