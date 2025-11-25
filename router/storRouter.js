const express = require("express");
const router = express.Router();
const storController = require("../controller/storController");
const authcheck= require('../middleware/auth')



router.post("/api/create_stor",authcheck, storController.createStore);

router.get("/api/get_all_stor",authcheck, storController.getAllStore);

router.post("/api/update_stor/:id",authcheck, storController.updateStore);

router.get("/api/get_stor/:id",authcheck, storController.getStoreById);

router.delete("/api/delete_stor/:id",authcheck, storController.deleteStore);

module.exports = router;  
