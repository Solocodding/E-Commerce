const express = require('express');
const { addToCart, showCart ,removeFromCart,updateCartQuantity}=require("../controller/cartController");
const { verifyToken } = require("../middlewares/auth");

const router = express.Router();

router.get("/", verifyToken, showCart);
router.delete("/remove",verifyToken,removeFromCart);
router.put("/update-quantity",verifyToken,updateCartQuantity);
router.post("/add",verifyToken,addToCart);


module.exports = router