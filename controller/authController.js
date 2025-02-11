const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const sendEmail = require("../utils/sendEmail");
const User = require("../model/User");

const verifyuserList = {};


async function signup(req, res) {
    try {
        const user = req.body;

        const existingUser = await User.findOne({ email: user.email });
        if (existingUser) {
            if (!existingUser.isVerified) {
                
                if (user.password !== user.confirmPassword) {
                    return res.render("./auth/signup", { message: "Passwords do not match" });
                }
                await User.findByIdAndUpdate(existingUser._id, {
                    name: user.name,
                    role:user.role,
                    password: await bcrypt.hash(user.password, 10),
                });

                const randomReq = uuid.v4();
                const userVerifyURL = `http://localhost:9999/auth/verify/${randomReq}/${existingUser._id}`;
                verifyuserList[existingUser._id] = {
                    time: Date.now(),
                    uniqueReq: randomReq,
                };

                return sendEmail(user.email, userVerifyURL, (err) => {
                    if (err) {
                        return res.status(500).send("Failed to send verification email");
                    }
                    return res.send("Check your mail and verify your account");
                });
            }

            return res.render("./auth/signup", { message: "User already exists with the same email" });
        }

        if (user.password !== user.confirmPassword) {
            return res.render("./auth/signup", { message: "Passwords do not match" });
        }

        const hashedPSW = await bcrypt.hash(user.password, 10);
        const newuser = new User({
            name: user.name,
            email: user.email,
            password: hashedPSW,
            role: user.role,
            isVerified: false,
        });
        await newuser.save();

        const randomReq = uuid.v4();
        const userVerifyURL = `http://localhost:9999/auth/verify/${randomReq}/${newuser._id}`;
        verifyuserList[newuser._id] = {
            time: Date.now(),
            uniqueReq: randomReq,
        };

        sendEmail(user.email, userVerifyURL, (err) => {
            if (err) {
                return res.status(500).send("Failed to send verification email");
            }
            return res.send("Check your mail and verify your account");
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}


async function login(req, res) {
    try {
        const user = req.body;
        // console.log(user);

        const foundUser = await User.findOne({ email: user.email });

        if (!foundUser || !(user.role === foundUser.role)) {
            return res.render("./auth/login", { message: "Invalid credentials role not match" });
        }
        if(!(await bcrypt.compare(user.password, foundUser.password))){
            return res.render("./auth/login", { message: "Invalid password" });
        }
        if (!foundUser.isVerified) {
            return res.render("./auth/login", { message: "Account not verified. Check your mail to verify." });
        }
        if (foundUser.isVerified && user.role === foundUser.role) {
            const token = jwt.sign({ id: foundUser.id, name: foundUser.username }, process.env.SECRET_KEY, { expiresIn: "1h" });
            res.cookie("authToken", token, {
                httpOnly: true,
                secure: false,
                maxAge: 60 * 60 * 1000,
            });
            if(user.role === "user"){
                return res.redirect("/");
            }
            else if(user.role === "seller"){
                return res.redirect("/seller");
            }
            else if(user.role === "admin"){
                return res.redirect("/admin");
            }
        } else {
            return res.render("./auth/login", { message: "Account not verified. Check your mail to verify." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}
let resetPasswordList = {};
async function resetPassword(req, res) {
    try {
        const email = req.body.email;

        const foundUser = await User.findOne({ email: email });
        if (!foundUser) {
            
            return res.status(404).send("User not found with given email");
        }
        const randomReq = uuid.v4();
        const userVerifyURL = `http://localhost:9999/auth/reset-password/${randomReq}/${foundUser.id}`;
        verifyuserList[foundUser.id] = {
            time: Date.now(),
            uniqueReq: randomReq,
        };
        resetPasswordList[foundUser.id] = {
            email: foundUser.email,
        };
        sendEmail(email, userVerifyURL, (err) => {
            if (err) {
                return res.status(500).send("Failed to send verification email");
            }
            return res.send("Check your mail and reset your password");
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}

async function updatePassword(req, res) {
    try {
        const password = req.body.password;
        const email = req.body.email;
        const userId = Object.keys(resetPasswordList).find(key => resetPasswordList[key].email === email);

        if (!resetPasswordList[userId]) {
            return res.status(404).send("can't update password please try again");
        }
        else {
            await User.findOneAndUpdate({ email: email }, { password: await bcrypt.hash(password, 10) });
            delete resetPasswordList[userId];
        }
        return res.render("./auth/login", { message: "Password updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}

async function verifysignup(req, res) {
    try {
        const randomReq = req.params.randomReq;
        const userId = req.params.id;

        // const foundUser = await User.findOne({ id: userId });
        if (verifyuserList[userId] && verifyuserList[userId].uniqueReq === randomReq &&
            (Date.now() - verifyuserList[userId].time) <= 60 * 60 * 1000) {

            await User.findOneAndUpdate({ _id: userId },{ isVerified: true });
            delete verifyuserList[userId];
            res.redirect("/auth/login");
        } else {
            delete verifyuserList[userId];
            res.redirect("/auth/signup");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}

function verifyResetPassword(req, res) {

    const randomReq = req.params.randomReq;
    const userId = req.params.id;

    if (verifyuserList[userId] && verifyuserList[userId].uniqueReq === randomReq &&
        (Date.now() - verifyuserList[userId].time) <= 10 * 60 * 1000) {
        res.redirect("/auth/updatePassword");
    } else {
        delete verifyuserList[userId];
        res.redirect("/auth/reset-password");
    }
}

module.exports = {
    signup,
    verifysignup,
    verifyResetPassword,
    login,
    resetPassword,
    updatePassword,
};
