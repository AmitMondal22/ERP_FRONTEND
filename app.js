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
const app= express()
const cors = require('cors');

app.use(cors({
  origin: '*', // Consider restricting this in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


app.use(express.json({limit: '200kb'}));
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: 'application/octet-stream', limit: '200kb' }));

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


module.exports = app;


