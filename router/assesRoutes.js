const express= require('express');
const cityAndCountryController = require("../controller/citisandcountryController");
//const validate = require("../middleware/validate");

const userValidation = require('../validations/userValidation');
const productTypeController = require('../controller/productTypeController');


const router= express.Router();


router.get('/hello',(req,res)=>{ res.send('hello every one  iam hungry')})

router.get("/api/states", cityAndCountryController.getAllstates);

router.get("/api/cities/:id",cityAndCountryController.getAllCities);

router.get("/api/product_type",productTypeController.getAllProductType);



module.exports= router;