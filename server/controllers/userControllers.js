const asyncHandler = require("express-async-handler");
const User = require("../model/UserModel");
const generateToken = require("../config/generateToken");
const { ObjectId } = require('mongodb');
const { log } = require("console");

let otp=0;


const registerUser =asyncHandler(async(req,res)=>{
const {name,email,password,pic,mobno,address,city,state,zip,district,gender,proof} = req.body;
if(!name || !email || !password){
    res.status(400)
    throw new Error('Please enter all fields')
}
const userExist = await User.findOne({email})
if(userExist){
    res.status(400)
    throw new Error('User already exist')
}
const user = await User.create({
    name,
    email,
    password,
    pic,
    mobno,
    address,
    city,
    district,
    state,
    zip,
    proof,
    gender
})

if(user){
    res.status(201).json({
        _id:user._id,
        name:user.name,
        email:user.email,
        pic:user.pic,
        mobno:user.mobno,
        gender:user.gender,
        token:generateToken(user._id)
    })
}else{
    res.status(400)
    throw new Error('Invalid user data')
}
})

const findUserAcc = asyncHandler(async (req, res) => {
    const { mobnum } = req.body;

    const user = await User.find({mobnum})
   
        res.json({user})
     
})


const authUser = asyncHandler(async (req, res) => {
    const { id, password } = req.body;
    const objectId = ObjectId(id);
    
    if(password){
        
        try{
            const user = await User.findOne({ _id: new ObjectId(id) })
        
            if(user&& (await user.matchPassword(password))){
                res.json({
                    _id:user._id,
                    name:user.name,
                    email:user.email,
                    pic:user.pic,
                    token:generateToken(user._id)
                })
            }else{
                res.status(401).json({ message: 'Invalid email or password' });
                throw new Error('Invalid email or password')
            }  

        }catch(err){
            console.log(err);
        }
        
    }else{
        console.log(objectId);

        try{
            const user = await User.findOne({ _id: new ObjectId(id) })
            
            console.log(user);
           
            if(user){
                //get mobnum
                mobnum=user.mobno;
           

                otp = Math.floor(100000 + Math.random() * 900000);
                 //send otp to mobile
            //
            //
            //

            //send otp to client
                res.json({otp})
            }else{
                res.status(401)
                throw new Error('Invalid user')
            }
        } catch(err){
            console.log(err);
        }
      

         
        
    }

   
})

const otpValidate = asyncHandler(async (req, res) => {
    const {  otplocal, id } = req.body;
    const objectId = ObjectId(id);
    const user = await User.findOne({ _id: new ObjectId(id) })
    if(user){
        console.log(otplocal,otp);
        if(otplocal==otp){
            res.json({
                _id:user._id,
                name:user.name,
                email:user.email,
                pic:user.pic,
                token:generateToken(user._id)
            })
        }else{
            res.status(401)
            throw new Error('Invalid otp')
        }

    }else{
        res.status(401)
        throw new Error('Invalid email or password')
    }   
})




const allUsers = asyncHandler(async (req, res) => {

    const keyword = req.query.search ? {   
        $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { mobno: { $regex: req.query.search, $options: 'i' } },
        ],
    }:{};

    const users = await User.find(keyword).find()
    
    res.send(users)
    
});




// const allUsers = asyncHandler(async (req, res) => {

//     const keyword = req.query.search ? {   
//         $or: [
//             { name: { $regex: req.query.search, $options: 'i' } },
//             { mobno: { $regex: req.query.search, $options: 'i' } },
//         ],
//     }:{};

//     const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })
    
//     res.send(users)
    
// });



module.exports = {registerUser,authUser,allUsers,findUserAcc,otpValidate};
