const express=require("express");
const router=express.Router();
const { verifyToken } = require("../middlewares/auth");
const {createOrder,getUserOrders,updateOrderStatus}=require("../controller/orderController");

router.get("/userOrders",verifyToken,getUserOrders);
router.post("/createOrder",verifyToken,createOrder); 
router.patch("/updateOrderStatus/:orderId",verifyToken,updateOrderStatus);

module.exports=router;
