import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js';



const createToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET);
}


//Route for user registration
const registerUser = async(req,res) => {
    try{
        const {name, email, password} = req.body;

        // checking user in DB
        const exist = await userModel.findOne({email})
        if (exist) {
            return res.json({success:false, message:"User already exists"})
        }

        // validating email format and password
        if (!validator.isEmail(email)) {
            return res.json({success:false, message:"Please enter a valid email"})
        }
        
        if (password.length < 5) {
            return res.json({success:false, message:"Please enter a strong password"})
        }

        //hashing user passwrod
        const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(password, salt);

        //Storing hashed password and email in DB
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user=  await newUser.save();

        const token = createToken(user._id);
        res.json({success:true, token});

    }
    catch(error){
        console.log(error);
        res.json({success:false, message:error.message});
    }
}

//Route for User login
const loginUser = async(req, res) => {
    try{
        const {email, password} = req.body;
        const user = await userModel.findOne({email});

        if(!user) {
            return res.json({success:false, message:"User does not exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(isMatch){
            const token = createToken(user._id)

            // ✅ Set userId as a secure HTTP-only cookie
            res.cookie("userId", user._id.toString(), {
            httpOnly: true,        // Prevents JS from accessing it on the client
            secure: true,          // Ensures it's sent over HTTPS
            sameSite: "Strict",    // Prevents CSRF in most cases
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.json({success:true, token, user})
        }
        else{
            res.json({success:false, message:"Invalid credentials"})
        }
    }
    catch(error){
        console.log(error);
        res.json({success:false, message:error.message});
    }
}

//Route for admin login
const adminLogin = async(req, res) => {
    try{
        const {email, password} = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password, process.env.JWT_SECRET);
            res.json({success:true, token})
        }
        else{
            res.json({success:false, message:"Invalid credentials"});
        }
    }
    catch(error){
        console.log(error);
        res.json({success:false, message:error.message});
    }
}

export {loginUser, registerUser, adminLogin};

