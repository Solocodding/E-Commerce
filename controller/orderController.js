const Order = require("../model/Order");
const Cart = require("../model/Cart");

const createOrder = async (req, res) => {
    try {
        const userId = req.user._id;

        // console.log(userId);

        // Find the user's cart
        const cart = await Cart.findOne({ userId }).populate('products.productId');

        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ error: 'Your cart is empty' });
        }

        let totalAmount = 0;
        let insufficientStock = false;
        let missingProductFields = false;
        let errorMessages = [];

        // Prepare product snapshots for the order and calculate total amount
        const productSnapshots = cart.products.map((cartItem) => {
            const product = cartItem.productId;

            // Handle deleted or missing products
            if (!product || product.isDeleted) {
                missingProductFields = true;
                errorMessages.push(`\n${cartItem.productId.name || cartItem.productId} is currently Unavailable`);
                return null;
            }

            // Check if there is enough stock
            if (product.stock < cartItem.quantity) {
                insufficientStock = true;
                errorMessages.push(`\nInsufficient stock for ${product.name}`);
                return null;
            }

            // Prepare product snapshot for the order
            const productSnapshot = {
                productId: product._id,
                name: product.name,
                description: product.description,
                price: product.price,
                imageUrl: product.imageUrl,
                sellerId: product.sellerId,
                quantity: cartItem.quantity
            };

            totalAmount += product.price * cartItem.quantity; // Calculate total amount

            return productSnapshot;
        });

        // If there are any errors related to stock or missing products, stop the process
        if (insufficientStock || missingProductFields) {
            return res.status(400).json({ message: `Order cannot be placed \n${errorMessages}` });
        }

        // Create the new order with the calculated totalAmount and product snapshots
        const newOrder = new Order({
            userId,
            products: productSnapshots, // Save the product snapshots in the order
            totalAmount,
            status: 'Pending' // Default status
        });

        // Save the order to the database
        await newOrder.save();

        // Update the stock for each product after placing the order
        await Promise.all(cart.products.map(async (cartItem) => {
            const product = cartItem.productId;
            product.stock -= cartItem.quantity; // Deduct the ordered quantity from stock
            await product.save(); // Save the updated product
        }));

        // Clear the user's cart after placing the order
        await Cart.findOneAndUpdate({ userId }, { products: [] });

        res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while placing the order' });
    }
};
const getUserOrders = async (req, res) => {
    if (!req.isAuthenticated) return res.redirect('/auth/login');
    try {
        const userId = req.user._id;

        // Fetch orders for the user
        const orders = await Order.find({ userId }).sort({ createdAt: -1 }); //newest first
        res.render('products/order', {
            orders: orders || [],
            isAuthenticated: req.isAuthenticated,
            user: req.user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching user orders' });
    }
};
const updateOrderStatus = async (req, res) => {
    try{
        const orderId = req.params.id;
        const status = req.body.status;

        //valid statuses
        const valideStatuses = ['Pending','Shipped','Delivered', 'Cancelled'];

        if(!valideStatuses.includes(status)){
            return res.status(400).json({error: 'Invalid status'});
        }

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId },
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating order status' });   
    }
}


module.exports = { createOrder, getUserOrders, updateOrderStatus };