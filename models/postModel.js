import mongoose from "mongoose";

const PostScehma = mongoose.Schema({
    postedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        requried : true, 
        
    },
    text : {
        type : String,
        maxLength : 500,

    },
    img : {
        type : String,
        
    },
     likes :{
       // array of user ids
       type : [mongoose.Schema.Types.ObjectId ],
       ref : "User",
       default : [],
    }, 
        replies : [{
            userId : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "User",
                requried:true,


            },
               text: {
                type : String,
                requried : true,

               },
               userProfilePic : {
                type : String,
                
               },
               username : {
                type: String,

               },

        }]

     

},
{timestamps : true})

const Post = mongoose.model("Post", PostScehma)
export default Post;