const sellerCheck = (req, res, next) => {
    if (req.user && req.user.role==="seller") {
        next();
    } else {
        // res.status(403).send('Access Denied: Sellers only');
        res.redirect('/auth/login');
    }
};

module.exports = {sellerCheck};