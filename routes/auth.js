const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt")

// REGISTER
router.post("/register", async (req, res) => {
    try {
        //generate new Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // create new User
        const newUser = await new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })

        //save user and respond
        const user = await newUser.save();
        res.status(200).json({
            "message": "Account Created successfully!! Please verfiy..", 
            "user": user,
        });

    } catch(err) {
        res.status(500).json(err);
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        !user && res.status(404).json("User not found. Please register your email"); 

        const validPassword = await bcrypt.compare(req.body.password, user.password)
        !validPassword && res.status(400).json("Wrong password");
        if (!user.isActive) {
            const changeStatus = await User.updateOne(user, {$set: {isActive: true,lastLoginTime: Date.now()},
            });
            !changeStatus && res.status(400).json("Failed to login");
        }
        const {password, ...others} = user._doc;
        res.status(200).json({
            "message": "Logged in Successfully!!",
            "user": others,
        });
    } catch (err) {
        res.status(500).json(err);
    }
})

// LOGOUT
router.post("/logout", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        !user && res.status(404).json("User not found. Please register your email"); 

        const validPassword = await bcrypt.compare(req.body.password, user.password)
        !validPassword && res.status(400).json("Wrong password");
        if (user.isActive) {
            const changeStatus = await User.updateOne(user, {$set: {isActive: false,totalActiveTime: (Date.now()-user.lastLoginTime)/60000},
            });
            !changeStatus && res.status(400).json("Failed to logout");
        }
        const {password, ...others} = user._doc;
        res.status(200).json({
            "message": "Logged Out Successfull!!",
            "user": others,
        });
    } catch (err) {
        res.status(500).json(err);
    }
})



module.exports = router;