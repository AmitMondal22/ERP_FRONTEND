require('dotenv').config();
const express = require('express');
const router= require('./router/router')
const citysrouter= require('./router/citysAndCountries')
const vendorrouter= require('./router/vendorRoutes')
const unit= require('./router/unitRouter');
const projectRoutes= require('./router/projectRoutes')
const projectSitesRoutes= require('./router/projectSitesRoutes')
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
app.use('/',citysrouter)
app.use('/',vendorrouter)
app.use('/',unit)
app.use('/',projectRoutes)
app.use('/',projectSitesRoutes)


module.exports = app;


