const router = require("express").Router();
const  Post = require("../models/Post");
const User = require("../models/User");

// create a post
router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(200).json({
            "message": "Post created successfully!!",
            "data": savedPost
        });

    } catch(err) {
        res.status(500).json(err);
    }
})

// update a post
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const currentUser = await User.findById(post.userId);
        if (!currentUser.isActive) {
            res.status(403).json("Please login to update your post!!");
        }
        if (post.userId === req.body.userId) {
            await post.updateOne({$set:req.body});
            res.status(200).json({
                "message": "Your post has been updated!!",
                "data": post
            });
        } else {
            res.status(403).json("You can update only your post!!");
        }
    } catch (err) {
        res.status(500).json(err);
    }
})

// delete a post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const currentUser = await User.findById(post.userId);
        if (!currentUser.isActive) {
            res.status(403).json("Please login to delete your post!!");
        }
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("the post has been deleted")
        } else {
            res.status(403).json("you can delete only your post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
})

// like / dislike a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const currentUser = await User.findById(post.userId);
        if (!currentUser.isActive) {
            res.status(403).json("Please login to like or dislike your post!!");
        }
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: {likes: req.body.userId}});
            res.status(200).json("The post has been liked")
        } else {
            await post.updateOne({ $pull: {likes: req.body.userId}});
            res.status(200).json("The post has been disliked");
        }
    } catch (err) {
        res.status(500).json(err);
    }
})

// get a post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
})

// get timeline posts
router.get("/timeline/all", async (req, res) => {
    let postArray = [];
    try {
        const currentUser = await User.findById(req.body.userId);
        const userPosts = await Post.find({ userId: currentUser._id});
        const friendPosts = await Promise.all(
            currentUser.following.map((friendId) => {
                return Post.find({ userId: friendId});
            })
        );
        res.json(userPosts.concat(...friendPosts))
    } catch (err) {
        res.status(500).json(err);
    }
})

// router.get("/", (req, res) => {
//     console.log("post page");
// })

module.exports = router;