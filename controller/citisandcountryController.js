
const { insertData,selectData ,selectOneData,customSelectSqlQuery} = require("../models/MasterModel");



class cityAndCountryController { 

getAllstates = async (req, res) => {
    try {
      
      const condition = "country_id = 101";
      const states = await selectData("lo_states", "*", condition);

      if (!states || states.length === 0) {
        return res.status(404).json({ message: "No states found for India" });
      }

      return res.status(200).json({
        success: true,
        data: states,
      });
    } catch (error) {
      console.error("Error fetching Indian states:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };

  //4853--->westbengal

  //get all countrys  lo_countries

 getAllCities = async (req, res) => {
  try {
    
    const { id } = req.params;  

    if (!id) {
      return res.status(400).json({ message: "State ID is required" });
    }

    const condition = `state_id = ${id}`; 
    const cities = await selectData("lo_cities", "*", condition);

    if (!cities || cities.length === 0) {
      return res.status(404).json({ message: "No cities found for this state" });
    }

    return res.status(200).json({
      success: true,
      data: cities,
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};






}

module.exports = new cityAndCountryController();
