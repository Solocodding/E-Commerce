const Cart = require("../model/Cart")
const Product = require("../model/Product")

const addToCart = async (req, res) => {

    if(!req.isAuthenticated){
        return res.redirect('/auth/login');
    }

    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // console.log(userId, productId, quantity);

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ error: "Product out Of Stock" });
    }

    //find user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
        const newCart = new Cart({ userId, products: [{ productId, quantity }] });
        await newCart.save();
        return res.status(201).json(newCart);
    }
    else {
        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
        if (productIndex !== -1) {
            if(cart.products[productIndex].quantity + quantity > product.stock){
                cart.products[productIndex].quantity = product.stock;
            }
            else{
                cart.products[productIndex].quantity += quantity;
            }
        }
        else {
            cart.products.push({ productId, quantity });
        }
        await cart.save();
        return res.status(200).json(cart);
    }
}
async function showCart(req, res) {
    if(!req.isAuthenticated){
        return res.redirect('/auth/login');
    }
    try{
        const cart= await Cart.findOne({ userId: req.user.id }).populate("products.productId");

        // cart.products.forEach(product)
        res.render('products/cart', {
            isAuthenticated: req.isAuthenticated,
            user: req.user,
            cart: cart ?cart.products : [],
        });
        // res.render("./products/cart", {products:products, });
      } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      }
}

async function removeFromCart(req, res) {
    if(!req.isAuthenticated){
        return res.redirect('/auth/login');
    }
    try {
        const productId = req.body.productId;
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ error: "Cart is Empty" });
        }
        cart.products = cart.products.filter(product => product.productId.toString() !== productId);
        await cart.save();
        res.status(200).json({ message: "Product removed from cart" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}

const updateCartQuantity = async (req, res) => {

    if(!req.isAuthenticated){
        return res.redirect('/auth/login');
    }

    const { productId, action } = req.body; 
    try {
        // Populate the productId field to access the full Product data, including stock
        const cart = await Cart.findOne({ userId: req.user.id }).populate("products.productId");
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        // Find the specific product in the cart
        const product = cart.products.find(p => p.productId._id.toString() === productId);
        if (!product) {
            return res.status(404).json({ error: "Product Out of Stock" });
        }

        // Update quantity based on the action
        if (action === "increase") {
            if (product.quantity < product.productId.stock) {
                product.quantity += 1;
            } else {
                return res.status(400).json({ error: "Do not have enough stock" });
            }
        } else if (action === "decrease") {
            if (product.quantity > 1) {
                product.quantity -= 1;
            } else {
                return res.status(400).json({ error: "Quantity cannot be less than 1" });
            }
        } else {
            return res.status(400).json({ error: "Invalid action" });
        }

        // Save the cart
        await cart.save();
        res.status(200).json({ message: "Product quantity updated" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};




module.exports = { addToCart, showCart, removeFromCart, updateCartQuantity};
