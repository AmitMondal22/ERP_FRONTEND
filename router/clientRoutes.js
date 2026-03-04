const express = require("express");
const router = express.Router();
const authcheck = require("../middleware/auth");

const ClientController = require("../controller/ClientController");




// POST
router.post("/api/create-client",ClientController.createClient.bind(ClientController));


// GET
router.get("/api/getallclient", authcheck,ClientController.getAllClients.bind(ClientController));

router.get("/api/count-client",   authcheck,      ClientController.getClientCount.bind(ClientController));

router.get("/api/getclient/:id",     authcheck,      ClientController.getClientById.bind(ClientController));

//router.get("/status/:status",authcheck,ClientController.getClientsByStatus.bind(ClientController));

// PUT
router.post("/api/updateclient/:id",  authcheck,     ClientController.updateClient.bind(ClientController));

router.post("/api/:id/status", authcheck, ClientController.updateClientStatus.bind(ClientController));

// DELETE
router.delete("/api/deleteclient/:id",    authcheck,    ClientController.deleteClient.bind(ClientController));

module.exports = router;
