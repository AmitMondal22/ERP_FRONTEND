const express= require('express');
const vendorController = require("../controller/citisandcountryController");
//const validate = require("../middleware/validate");

const userValidation = require('../validations/userValidation');


const router= express.Router();


router.get('/hello',(req,res)=>{ res.send('hello every one  iam hungry')})

router.get("/api/states", vendorController.getAllstates);

router.get("/api/cities/:id",vendorController.getAllCities);



module.exports= router;