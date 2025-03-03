const express = require('express');
const { signup,verifysignup,verifyResetPassword,login,resetPassword,updatePassword}=require("../controller/authController");
const { verifyToken } = require("../middlewares/auth");
const router = express.Router();

router.get("/signup",verifyToken,(req, res) => {
    if(req.isAuthenticated && req.user.role==="user") {
        return res.redirect('/');
    }else if(req.isAuthenticated && req.user.role==="seller") {
        return res.redirect("/seller");
    }else if(req.isAuthenticated && req.user.role==="admin") {
        return res.redirect("/admin");
    }else{
        res.render("./auth/signup");
    }
})

router.get("/login",verifyToken,(req, res) => {
    if(req.isAuthenticated && req.user.role==="user") {
        return res.redirect('/');
    }else if(req.isAuthenticated && req.user.role==="seller") {
        return res.redirect("/seller");
    }else if(req.isAuthenticated && req.user.role==="admin") {
        return res.redirect("/admin");
    }else{
        res.render("./auth/login");
    }
})

router.get("/reset-password",verifyToken,(req, res) => {
    res.render("./auth/resetPassword");
})

router.get("/updatePassword", verifyToken,(req, res) => {
    // if(!req.isAuthenticated){
    //     return res.redirect('/auth/login');
    // }
    res.render("./auth/updatePassword"); 
});
router.get('/logout', (req, res) => {
    res.clearCookie('authToken'); // Clear the authentication cookie
    res.redirect('/auth/login'); // Redirect to the login page or homepage
});

router.get(`/verify/:randomReq/:id`,verifysignup);
router.get(`/reset-password/:randomReq/:id`,verifyResetPassword);

router.post("/signup",signup);
router.post("/login",login);

router.post("/reset-password",resetPassword);
router.post("/updatePassword",updatePassword);


module.exports = router;