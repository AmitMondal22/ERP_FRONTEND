const express = require("express");
const router = express.Router();
const storController = require("../controller/storController");
const authcheck= require('../middleware/auth')

const storeStockController= require('../controller/storeStockController')


router.post("/api/create_stor",authcheck, storController.createStore);

router.get("/api/get_all_stor",authcheck, storController.getAllStore);

router.post("/api/update_stor/:id",authcheck, storController.updateStore);

router.get("/api/get_stor/:id",authcheck, storController.getStoreById);

router.delete("/api/delete_stor/:id",authcheck, storController.deleteStore);


/////////////////////////////////////////////////////////////////////////////////////////////////////////




// ---------- WRITE OPERATIONS ----------
router.post("/api/purchase-entry-store-stock",  storeStockController.addPurchaseEntry);
router.post("/dpr-issue",  storeStockController.addDprIssueEntry);

router.post("/api/transfer-stock-from-store-to-store-project-to-project",  authcheck, storeStockController.transferStock);///

//////

router.post("/api/store-stock/issue-to-site", authcheck, storeStockController.issueMaterialToProjectSite);

//////////
router.get(
  "/api/stock-ledger/material-issues/by-store/:from_store_id",
  authcheck, // your existing auth middleware
  storeStockController.getMaterialIssuesByStore
);

//////////////////////////////////
// ---------- READ / REPORTS ----------
router.get("/available",              storeStockController.getAvailableStock);
router.get("/history",                storeStockController.getLedgerHistory);
router.get("/report/store-stock",     storeStockController.getStoreWiseStock);
router.get("/report/product-location",storeStockController.getProductLocation);
router.get("/report/transfers",       storeStockController.getTransferHistory);
router.get("/api/ledger/:ledger_id",             storeStockController.getLedgerById);


router.get("/api/get-store-fulldetails/:store_id",storeStockController.getStoreFullDetails);

router.post("/api/stock-ledger/deduct",      storeStockController.deductStockByProjectSite);

router.post("/api/stock-ledger/deduct-bulk", authcheck, storeStockController.deductStockBulk);/////////

//router.get( "/api/store-stock/:store_id/:project_id/:site_id",    storeStockController.getStoreProjectSiteStock);


router.post("/api/get-current-stock-as-per-store-project-site",        storeStockController.getStoreProjectSiteStock);

router.get("/api/store-projects/:store_id", storeStockController.getProjectsUnderStore);


//////////////////////////////////////////////////

module.exports = router;  
