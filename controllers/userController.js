import User from "../models/userModel.js";


import mongoose from "mongoose";

import bcrypt from 'bcryptjs';
import generateTokenAndSetCookies from "../utils/helpers/generateTokenAndSetCookies.js";
import { v2 as cloudinary} from 'cloudinary';
import Post from "../models/postModel.js";

// const getUserProfile = async (req, res) => {

//     const { username } = req.params; // Destructuring to extract the username directly
//     // we will fetch user profile either with username or userId
//     try {
//         const user = await User.findOne({ username }).select("-password").select("-updatedAt");
//         if (!user) return res.status(400).json({ error: "User not Found" });
//         res.status(200).json(user);
//     } catch (error) {
//         console.log("Can't get the profile:", error.message);
//         res.status(500).json({ error: error.message });
//     }
// }

const getUserProfile = async (req, res) => {
	// We will fetch user profile either with username or userId
	// query is either username or userId
	const { query } = req.params;

	try {
		let user;

		// query is userId
		if (mongoose.Types.ObjectId.isValid(query)) {
			user = await User.findOne({ _id: query }).select("-password").select("-updatedAt");
		} else {
			// query is username
			user = await User.findOne({ username: query }).select("-password").select("-updatedAt");
		}

		if (!user) return res.status(404).json({ error: "User not found" });

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in getUserProfile: ", err.message);
	}
};



// const getUserProfile = async (req,res) => {
//     const username = req.params;
//     try {
//         const user = await User.findOne({ username}).select("-password").select("-updatedAt");
//         if(!user) return res.status(400).json({error : "User not Found"});
//         res.status(200).json(user);
        
//     } catch (error) {
//         console.log("cant get the profile :" , error.message );
//         res.status(500).json({error : error.message});
        
//     }

// }


// const signupUser = async (req,res) => {
//     try {
//         const {name,email,username, password} = req.body;
//         const user = await User.findOne({$or : [{email}, {username} ]})

//         if(user){
//             return res.status(400).json({message : "user already exists"})
//         }
//             const salt = await bcrypt.genSalt(10);
//             const hashedPassword = await bcrypt.hash(password,salt)

//             const newUser=  new User({
//                 name,
//                 email,
//                 username,
//                 password : hashedPassword


//             });
//             await newUser.save();

//             if(newUser){
//                 generateTokenAndSetCookies(newUser._id, res);



//                 res.status(201).json({
//                     _id : newUser._id,
//                     name : newUser.name,
//                     email : newUser.email,
//                     username : newUser.username,
//                 })
//             }
//             else{
//                 res.status(400).json({message : " Invalid User"});
//             }
        

        
//     } catch (error) {
//         res.status(500).json({error : error.message});
//         console.log("error in signup", error.message);
        
//     }

// }



const signupUser = async (req, res) => {
	try {
		const { name, email, username, password } = req.body;
		const user = await User.findOne({ $or: [{ email }, { username }] });

		if (user) {
			return res.status(400).json({ error: "User already exists" });
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
			name,
			email,
			username,
			password: hashedPassword,
		});
		await newUser.save();

		if (newUser) {
			generateTokenAndSetCookies(newUser._id, res);

			res.status(201).json({
				_id: newUser._id,
				name: newUser.name,
				email: newUser.email,
				username: newUser.username,
                bio : newUser.bio,
                profilePic : newUser.profilePic,
				
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in signupUser: ", err.message);
	}
};

// const signupUser = async (req, res) => {
//     try {
//       const { name, email, username, password } = req.body;
//       const user = await User.findOne({ $or: [{ email }, { username }] });
  
//       if (user) {
//         return res.status(400).json({ error: "User already exists" });
//       }
  
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);
  
//       const newUser = new User({
//         name,
//         email,
//         username,
//         password: hashedPassword,
//       });
  
//       await newUser.save();
  
//       generateTokenAndSetCookies(newUser._id, res);
  
//       res.status(201).json({
//         _id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//         username: newUser.username,
//       });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//       console.error("Error in signup", error.message);
//     }
//   };
  

const loginUser =  async (req,res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password , user?.password  || "");

        if(!user  ||  !isPasswordCorrect){
                      return res.status(400).send({message: "Invalid Username or Password"})

        };
        generateTokenAndSetCookies(user?._id , res);
        return res.status(200).json({
            _id :user._id,
            name : user.name,
            email : user.email,
            username : user.username,
            bio : user.bio,
            profilePic : user.profilePic

        })
        
    } catch (error) {
        console.log("error in login", error.message);
        res.status(500).json({error : error.message})
        
    }

}


const logOutUser = async (req,res) => {
    try {
        res.cookie("jwt", "", {maxAge : 1} );
        res.status(200).json({message : "Logged out Successfully!!!"});
        
    } catch (error) {
        res.status(500).json({error : error.message});
        console.log('error in logout' , error.message);
        
    }

}

const followUnfollowedUser = async (req,res) => {
    try {
        const {id} = req.params;
        const userToModify = await User.findById(id)
        const currentUser = await User.findById(req.user._id);

        if(id===req.user._id.toString())
        return res.status(40).json({message : "you cannot follow/unfollow yourself"});
    if(!userToModify  || !currentUser)
    return res.status(400).json({message : "Invalid User" }); 

    const isFollowing = currentUser.following.includes(id);

    if(isFollowing){
        
        await User.findByIdAndUpdate(id, {$pull : {followers : req.user._id}})
await User.findByIdAndUpdate(req.user._id, {$pull : {following : id}})
        res.status(200).json({message : "User Unfollowed Successfully"})
    } else{
        
        await User.findByIdAndUpdate(id, {$push : {followers : req.user._id}})
          await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
        res.status(200).json({message : "User followed Successfully"})
    }
    } catch (error) {
        console.log("Error In Follow/Unfollow" , error.message);
        res.status(500).json({error : error.message});
        
    }

}


// const updateUser = async (req,res) => {
//     const {name,email,username, password,  bio} = req.body;
//     let {profilePic} = req.body;
//     const userId = req.user._id;
//     try {
//         let user = await User.findById(userId);
//         if(!user){
//             return res.status(400).json({message: "User not Found"});
//         }

//         if(req.params.id !== userId.toString())
//         return res.status(400).json({message : "you cannot update other's user profile"})
//         if(password){
//             const salt = await bcrypt.genSalt(10);
//             const hashedPassword = await bcrypt.hash(password,salt);
//             user.password = hashedPassword;

//         }

//         // if(profilePic){
//         //     if(user.profilePic){
//         //         await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
//         //     }
            
//         //     const uploadResponse =  await cloudinary.uploader.upload(profilePic);
//         //     profilePic = uploadResponse.secure_url;
//         //     console.log(uploadResponse);

            
//         // }
//         if(profilePic){
//                 try {
//                     if(user.profilePic){
//                         await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
//                     }
                    
//                     const uploadResponse =  await cloudinary.uploader.upload(profilePic);
//                     profilePic = uploadResponse.secure_url;
//                     console.log(uploadResponse);
//                 } catch (cloudinaryError) {
//                     console.error("Cloudinary error:", cloudinaryError.message);
//                     return res.status(500).json({ error: "Error with Cloudinary operations" });
//                 }
//             }
//       user.name = name || user.name,
//       user.email = email || user.email,
//       user.username = username || user.username,
//       user.profilePic = profilePic || user.profilePic,
//       user.bio = bio || user.bio


//       await user.save();

//     //   find all posts that this user replies and update username and userprofilepic fields
//       await Post.updateMany(
//         {"replies.userId" : userId },
//         { 
//             $set: {
//                 "replies.$[reply].username" : user.username,
//                 "replies.$[reply].userProfilePic" : user.profilePic
//             }
//         },
//         {arrayFilters : [{'reply.userId' : userId}]}
//       )
    
//     //   password should be null in response

//     user.password = null;

//       res.status(200).json( user);



        
//     } catch (error) {
//         console.log("Unable to Update" , error.message);
//         res.status(500).json({error : error.message});
        
//     }


// }
const updateUser = async (req, res) => {
	const { name, email, username, password, bio } = req.body;
	let { profilePic } = req.body;

	const userId = req.user._id;
	try {
		let user = await User.findById(userId);
		if (!user) return res.status(400).json({ error: "User not found" });

		if (req.params.id !== userId.toString())
			return res.status(400).json({ error: "You cannot update other user's profile" });

		if (password) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);
			user.password = hashedPassword;
		}

		if (profilePic) {
			if (user.profilePic) {
				await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profilePic);
			profilePic = uploadedResponse.secure_url;
		}

		user.name = name || user.name;
		user.email = email || user.email;
		user.username = username || user.username;
		user.profilePic = profilePic || user.profilePic;
		user.bio = bio || user.bio;

		user = await user.save();

		// Find all posts that this user replied and update username and userProfilePic fields
		await Post.updateMany(
			{ "replies.userId": userId },
			{
				$set: {
					"replies.$[reply].username": user.username,
					"replies.$[reply].userProfilePic": user.profilePic,
				},
			},
			{ arrayFilters: [{ "reply.userId": userId }] }
		);

		// password should be null in response
		user.password = null;

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in updateUser: ", err.message);
	}
};
// const updateUser = async (req, res) => {
// 	const { name, email, username, password, bio } = req.body;
// 	let { profilePic } = req.body;

// 	const userId = req.user._id;
// 	try {
// 		let user = await User.findById(userId);
// 		if (!user) return res.status(400).json({ error: "User not found" });

// 		if (req.params.id !== userId.toString())
// 			return res.status(400).json({ error: "You cannot update other user's profile" });

// 		if (password) {
// 			const salt = await bcrypt.genSalt(10);
// 			const hashedPassword = await bcrypt.hash(password, salt);
// 			user.password = hashedPassword;
// 		}

// 		if (profilePic) {
// 			if (user.profilePic) {
// 				await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
// 			}

// 			const uploadedResponse = await cloudinary.uploader.upload(profilePic);
// 			profilePic = uploadedResponse.secure_url;
// 		}

// 		user.name = name || user.name;
// 		user.email = email || user.email;
// 		user.username = username || user.username;
// 		user.profilePic = profilePic || user.profilePic;
// 		user.bio = bio || user.bio;

// 		user = await user.save();

// 		// Find all posts that this user replied and update username and userProfilePic fields
// 		await Post.updateMany(
// 			{ "replies.userId": userId },
// 			{
// 				$set: {
// 					"replies.$[reply].username": user.username,
// 					"replies.$[reply].userProfilePic": user.profilePic,
// 				},
// 			},
// 			{ arrayFilters: [{ "reply.userId": userId }] }
// 		);

// 		// password should be null in response
// 		user.password = null;

// 		res.status(200).json(user);
// 	} catch (err) {
// 		res.status(500).json({ error: err.message });
// 		console.log("Error in updateUser: ", err.message);
// 	}
// };










export   {logOutUser,loginUser, signupUser,  followUnfollowedUser , updateUser, getUserProfile };