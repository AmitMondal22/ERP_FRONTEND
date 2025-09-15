const { insertData, selectData, selectOneData, customSelectSqlQuery } = require("../models/MasterModel");

class ProductTypeController {
  
  // ✅ Get all product types
  getAllProductType = async (req, res) => {
    try {
      // Fetch all records from md_product_type table
      const productTypes = await selectData("md_product_type", "*");

      if (!productTypes || productTypes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No product types found",
          data: [],
        });
      }

      return res.status(200).json({
        success: true,
        message: "Product types fetched successfully",
        data: productTypes,
      });
    } catch (error) {
      console.error("Error fetching product types:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
}

module.exports = new ProductTypeController;
