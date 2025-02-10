const Product = require('../model/Product');

// Add new product
const addProduct = async (req, res) => {
    try {
        // Extract product data
        const { name, description, price, stock, imageUrl } = req.body;
        const sellerId = req.user.id;
        // Validate all fields
        if (!name || !description || !price || !stock || !imageUrl) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Create new product
        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            imageUrl,
            sellerId
        });
        // Save product to the database
        await newProduct.save();
        // Send success response
        
        res.status(201).json({ message: 'Product created successfully', product: newProduct });
        // location.reload();  ///////////////////
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product', error });
    }
};
const deleteProduct = async (req, res) => {
    try {

        const productId = req.body.productId;
        // console.log(productId);  /////////////////////////////

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // await Product.findByIdAndDelete(productId);
        await Product.findByIdAndUpdate(productId, { isDeleted: true });

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
};

const editProduct = async (req, res) => {
    try {
        
        const productId = req.params.id;

        const { name, description, price, stock, imageUrl } = req.body;

        // Validate all fields
        if (!name || !description || !price || !stock || !imageUrl) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Find product and ensure it belongs to the user
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Update product details
        product.name = name;
        product.description = description;
        product.price = price;
        product.stock = stock;
        product.imageUrl = imageUrl;

        // Save updated product
        // console.log("product edited");
        await product.save();

        // Send success response
        res.status(200).json({ message: 'Product updated successfully', product }); 
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product', error });
    }
}

module.exports = {addProduct,deleteProduct,editProduct};