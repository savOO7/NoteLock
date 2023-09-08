
const express= require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../midddleware/fetchuser');

//ROUTE 1
//create a user using POST"api/auth/createuser". NO login required
router.post('/createuser',[
    body('email','Enter a valid email').isEmail(),
    body('name').isLength({ min: 3 }),
    body('password').isLength({ min: 5 })

],async(req,res)=>{
    let success = false;
    //if there are error return bad request and error using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //check whether the uses with this email exist already
    try {
        let user= await User.findOne({email:req.body.email});
        if(user){
            return res.status(400)
            .json({error:'Account already exist, try logging in!'});
        }
        //hashing password using bcryptjs
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password,salt);
        
        //Create new user using model saved
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        });

        //creating the user authorisation using json web token
        const data = {user:
            {id:user.id}
        }
        const secret = "im$@ks#am";
        const jwtToken = jwt.sign(data,secret);
        success = true
        res.json({success, jwtToken});

    } catch (error) { 
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})


//ROUTE 2
//auth a user using POST"api/auth/login". NO login required
router.post('/login',[
    body('email','Enter a valid email').isEmail(),
    body('password','Password cannot be blank').exists(),
], async (req,res)=>{
    let success = false;
     //if there are error return bad request and error using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email,password} = req.body;
    try {
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error:"Try login using correct credentials"})
        }

        const comparePass = await bcrypt.compare(password,user.password);
        if(!comparePass){
            return res.status(400).json({error:"Try login using correct credentials"})
        }

        //creating the user authorisation using json web token
        const data = {user:
            {id:user.id}
        }
        const secret = "im$@ks#am";
        const jwtToken = jwt.sign(data,secret);
        success = true;
        res.json({success,jwtToken});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }

})

//ROUTE 3
//get logged in user detail using: POST "api/auth/getuser". login req.
router.post('/getuser',fetchuser, async (req,res)=>{

    try {
        const  userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
        
    }


})

module.exports = router