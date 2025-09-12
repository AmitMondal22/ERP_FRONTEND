const express= require('express');
const userController = require("../controller/controller");
const validate = require("../middleware/validate");

const userValidation = require('../validations/userValidation');

const authcheck= require('../middleware/auth')


const router= express.Router();


router.get('/hello',authcheck,(req,res)=>{ res.send('hello every one  iam hungry')})

router.post("/api/login",  validate(userValidation.loginSchema),   userController.login);
router.post("/api/create",validate(userValidation.createUserSchema),userController.create);



module.exports= router;