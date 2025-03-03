const jwt=require("jsonwebtoken");
const User=require("../model/User");

function verifyToken(req, res, next) {   
    const token = req.cookies.authToken; 

    if (!token) {
        req.isAuthenticated = false;
        req.user = {};
        return next();
    }

    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
        if (err) {
            req.isAuthenticated = false;
            req.user = {};
            return next();
        }
        const user = await User.findById(decoded.id).select('-password');

        if(!user){
            req.isAuthenticated = false;
            req.user = {};
            return next();
        }

        req.isAuthenticated = true;
        req.user = user;
        next();
    });
}

module.exports={
    verifyToken
};
