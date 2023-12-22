import User from "../models/userModel.js";
import  jwt  from "jsonwebtoken";

const protectRoute = async (req,res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token) return res.status(401).json({message : "UnAuthorized"});
        const decoded = jwt.verify(token, process.env.JWT);

        const user = await User.findById(decoded.userId).select("-password");
        req.user = user

        next();
        
    } catch (error) {
        console.log("error in signUpUser" , error.message)
        res.status(500).json({error : error.message})
        
        
    }


}

export default protectRoute;
