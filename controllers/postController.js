
import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import {v2 as cloudinary} from 'cloudinary';


const getFeedPost = async(req,res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if(!user){
            return res.status(401).json({message : "User not found with :" , userId})
        }

        const following = user.following;
        const feedPosts =  await Post.find({postedBy : {$in : following}}).sort({createdAt : -1});
        res.status(200).json(feedPosts);

        
    } catch (error) {
        console.log("error while feeding");
        res.status(500).json({error: error.message});
        
    }
}

const createPost = async (req,res) => {
       
    try {
        const {postedBy ,text } = req.body;
        let {img}  = req.body;

        if(!postedBy || !text){
            return res.status(400).json({message : "postedBy and text fields are required"});
        }

        const user = await User.findById(postedBy);
        if(!user){
            return res.status(404).json({message : "User not Found"});
        }
        if(user._id.toString() != req.user._id){
            return res.status(400).json({message : "Unauthorized to create post"});
        };

        const maxLength = 500;
        if(text.length > maxLength) {
            return res.status(400).json({message : `text must be less than ${maxLength} characters`});

        }
        if(img){
            const uploadResponse =  await cloudinary.uploader.upload(img);
            img = uploadResponse.secure_url

        }
        const newPost = new Post({postedBy,text , img});

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({error : error.message});
        
    }
}
// const createPost = async (req, res) => {
// 	try {
// 		const { postedBy, text } = req.body;
// 		let { img } = req.body;

// 		if (!postedBy || !text) {
// 			return res.status(400).json({ error: "Postedby and text fields are required" });
// 		}

// 		const user = await User.findById(postedBy);
// 		if (!user) {
// 			return res.status(404).json({ error: "User not found" });
// 		}

// 		if (user._id.toString() !== req.user._id.toString()) {
// 			return res.status(401).json({ error: "Unauthorized to create post" });
// 		}

// 		const maxLength = 500;
// 		if (text.length > maxLength) {
// 			return res.status(400).json({ error: `Text must be less than ${maxLength} characters` });
// 		}

// 		if (img) {
// 			const uploadedResponse = await cloudinary.uploader.upload(img);
// 			img = uploadedResponse.secure_url;
// 		}

// 		const newPost = new Post({ postedBy, text, img });
// 		await newPost.save();

// 		res.status(201).json(newPost);
// 	} catch (err) {
// 		res.status(500).json({ error: err.message });
// 		console.log(err);
// 	}
// };


const getPost = async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(400).json({error:"Post Not Found"});
        }

        res.status(200).json(post);
        
    } catch (error) {
        
        res.status(500).json({error : error.message});
        console.log("Unable to get The Posts");
        
    }

}

const deletePost = async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({error: "post not found"});

            
        }
        
        if(post.postedBy.toString() !== req.user._id.toString()){
            return res.status(401).json({error : "Unauthorized to delete post"});


        }

        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
      await Post.findByIdAndDelete(req.params.id);
     
      
      res.status(200).json({message: "Post Deleted Successfully"});
} catch (error) {
    console.log("error while deleting")
    res.status(500).json({error : error.message});
    
}

}

const likeUnlikePost = async (req,res) => {
    try {
        const {id : postId} = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if(!postId){
            return res.status(404).json({error: "Post not Found "})

        }

        const userLikedPost =  post.likes.includes(userId);
        if(userLikedPost){
            //unlike post
            await Post.updateOne({_id : postId}, {$pull : {likes : userId}})
            res.status(200).json({message: "Post Unliked successfully"})


        }else{
            // like post
           post.likes.push(userId);
           await post.save();
           res.status(200).json({message: "post Liked Successfully"});


        }
    } catch (error) {
        console.log("Error while liking/unliking")
        res.status(500).json({error : error.message});
        
    }

}

const replyToPost = async (req,res) =>{
    try {
        const {text } = req.body
        const postId = req.params.id;
        const userId = req.user._id;
        const userProfilePic = req.user.profilePic;
        const username = req.user.username;
        if(!text){
            res.status(401).json({error : "replies not found"});
        }

        const post = await Post.findById(postId);
        if(!post){
            res.status(404).json({error: "Post not Found"});
        }

        const reply = {userId, username,userProfilePic, text};

        post.replies.push(reply);
        await post.save();

        res.status(200).json(reply);



        
    } catch (error) {
        console.log("error while replying")
        res.status(500).json({error: error.message});
        
    }
}

const getUserPosts = async(req,res) => {
    const{ username} = req.params;
    try {
        const user = await User.findOne({username});
        if(!user){
            return res.status(404).json({message : "User not found"});
        }
        
        const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });

        // const posts = await Post.find({postedBy : user._id}.sort({createdAt : -1}));
        res.status(200).json(posts);
        
    } catch (error) {
        res.status(500).json({error: error.message});
        
        
    }

}

export {createPost ,getPost,getUserPosts, deletePost, likeUnlikePost, replyToPost ,getFeedPost};