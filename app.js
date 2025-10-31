require('dotenv').config();
const express = require('express');
const router= require('./router/router')
const assesrouter= require('./router/assesRoutes')
const vendorrouter= require('./router/vendorRoutes')
const unit= require('./router/unitRouter');
const projectRoutes= require('./router/projectRoutes')
const projectSitesRoutes= require('./router/projectSitesRoutes');
//const ProductType= require('./router/productTypeRoute')
const ProductRoutes= require('./router/productRoute');
const Employee= require('./router/employeeRoutes');
const Team= require('./router/teamRoutes');
const Stor= require('./router/storRouter');
const Relation= require('./router/relationRoutes');
const Upload= require('./router/uploadsRoutes');
const Bom= require('./router/bomRoutes');
const purchaseProduct= require('./router/purchaseProduct');
const productType= require('./router/productTypeRoute');
const progressRoutes= require('./router/progressRoutes')
const app= express()
const path = require("path");
const cors = require('cors');

app.use(cors({
  origin: '*', // Consider restricting this in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// app.use(express.json({limit: '200kb'}));
// app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: 'application/octet-stream', limit: '15mb' }));
// app.use(express.raw({ type: 'application/octet-stream', limit: '200kb' }));

app.use('/',router)
app.use('/',assesrouter)
app.use('/',vendorrouter)
app.use('/',unit)
app.use('/',projectRoutes) 
app.use('/',projectSitesRoutes)
app.use('/',ProductRoutes)
app.use('/',Employee)
app.use('/',Team)
app.use('/',Stor)
app.use('/',Relation)
app.use('/',Upload)
app.use('/',Bom)
app.use('/',purchaseProduct)
app.use('/',productType);
app.use('/',progressRoutes)



//need tomake Upload Path Public



// ---------- Scheduler Code ----------
function runEveryMinute() {
  console.log("Scheduler running at: ", new Date().toLocaleString());
}

// Run every 60,000 milliseconds (1 minute 1000)
// setInterval(runEveryMinute, 60 * 100);

// -------------------------------------


module.exports = app;


