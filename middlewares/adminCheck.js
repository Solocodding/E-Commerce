const adminCheck = (req,res,next)=>{
    if(req.user && req.user.roe==="admin"){
        next();
    }else{
        // res.status(403).send("Access Denied: Admins only");
        res.redirect('/auth/login');
    }
}
module.exports={adminCheck};