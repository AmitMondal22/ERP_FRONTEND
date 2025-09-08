const mongoose = require('mongoose');

const paramSchema = new mongoose.Schema({
  name: String,
  value: String
}, { _id: false });

const sensorSchema = new mongoose.Schema({
  sensorId: { type: String, required: true },
  sensorName: { type: String, required: true },
  unit: { type: String, required: true },
  params: [paramSchema]
});

const deviceTypeSchema = new mongoose.Schema({
  deviceTypeName: { type: String, required: true },
  deviceTypeID: { type: String, required: true, unique: true },
  device: { type: String, required: true },
  connectionTimeout: { type: String },
  breakdownTimeout: { type: String },
  description: { type: String },
  sensors: [sensorSchema],
  icon: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DeviceType', deviceTypeSchema);
