const mongoose = require('mongoose');

const paramSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: true });

const sensorSchema = new mongoose.Schema({
  sensorId: { type: String, required: true },
  sensorName: { type: String, required: true },
  unit: { type: String, required: true },
  params: [paramSchema]
}, { _id: true });

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  deviceName: { type: String, required: true },
  deviceTypeId: { type: String, required: true },
  dataSource: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    long: { type: Number, required: true }
  },
  description: { type: String },
  sensors: [sensorSchema],
  tags: [String],
  icon: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);