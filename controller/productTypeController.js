const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const { insertData, selectData, selectOneData, updateData, deleteData, customSelectSqlQuery } = require("../models/MasterModel");

class ProductTypeController {

  // ✅ Add a new product type
  addProductType = async (req, res) => {
    try {
      const { product_type_name } = req.body;

      if (!product_type_name || !product_type_name.trim()) {
        return res.status(400).json({
          success: false,
          message: "product_type_name is required",
        });
      }

      const created_by = req.user?.id || null;
      const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      const insertValues = {
        product_type_name: product_type_name.trim(),
        created_by,
        created_at,
      };

      const product_type_id = await insertData("md_product_type", insertValues);

      return res.status(200).json({
        success: true,
        message: "Product type added successfully",
        data: { product_type_id, product_type_name: insertValues.product_type_name, created_by, created_at },
      });
    } catch (error) {
      console.error("Error adding product type:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to add product type",
        error: error.message,
      });
    }
  };

  // ✅ Get all product types
  getAllProductType = async (req, res) => {
    try {
      const productTypes = await selectData("md_product_type", "*", null, "product_type_id DESC");

      if (!productTypes || productTypes.length === 0) {
        return res.status(200).json({
          success: true,
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
        error: error.message,
      });
    }
  };

  // ✅ Get single product type by ID
  getProductTypeById = async (req, res) => {
    try {
      const { id } = req.params;
      const condition = `product_type_id = ${Number(id)}`;
      const productType = await selectOneData("md_product_type", "*", condition);

      if (!productType) {
        return res.status(404).json({
          success: false,
          message: "Product type not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: productType,
      });
    } catch (error) {
      console.error("Error fetching product type:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to fetch product type",
        error: error.message,
      });
    }
  };

  // ✅ Update product type by ID
  updateProductType = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Product type ID is required",
        });
      }

      const { product_type_name } = req.body;
      const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      const setValues = {};
      if (product_type_name !== undefined) setValues.product_type_name = product_type_name.trim();
      setValues.updated_at = updated_at;

      const condition = `product_type_id = ${Number(id)}`;
      const updatedRows = await updateData("md_product_type", setValues, condition);

      if (!updatedRows) {
        return res.status(404).json({
          success: false,
          message: "Product type not found or nothing to update",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Product type updated successfully",
        data: updatedRows,
      });
    } catch (error) {
      console.error("Error updating product type:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to update product type",
        error: error.message,
      });
    }
  };

  // ✅ Delete product type by ID
  deleteProductType = async (req, res) => {
    try {
      const { id } = req.params;
      const condition = `product_type_id = ${Number(id)}`;
      const deletedRows = await deleteData("md_product_type", condition);

      if (!deletedRows) {
        return res.status(404).json({
          success: false,
          message: "Product type not found or already deleted",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Product type deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting product type:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to delete product type",
        error: error.message,
      });
    }
  };
}

module.exports = new ProductTypeController();
