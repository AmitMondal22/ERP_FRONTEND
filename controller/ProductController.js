
// const { insertData,selectData ,selectOneData,customSelectSqlQuery} = require("../models/MasterModel");



// class productController{
// //md_product
// //	product_id	product_type_id	product_name	model_no	unit_id	manufacturer_name	product_image	created_by	created_at	updated_at

//  createProduct = async (req, res) => {
//     try {
//       const { 	product_type_id,	product_name,	model_no,	unit_id,	manufacturer_name,	product_image,	created_by,	updated_at	
// } = req.body; 


//       if (!project_name || !city_id) {
//         return res.status(400).json({ success: false, message: "Missing required fields" });
//       }

//       const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

//       // Use user ID from token
//       const insertValues = {
//         project_name,
//         city_id,
//         create_by: req.user.id,
//         created_at,
//       };

//       const insertedId = await insertData("md_project", insertValues);
//       const newProject = await selectOneData("md_project", "*", `project_id = ${insertedId}`);

//       res.status(201).json({ success: true, message: "Project created", data: newProject });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: false, message: "Unable to create project" });
//     }
//   };



// getAllProducts=async (req,res) => {
//     try {
        
//     } catch (error) {
        
//     }
    
// }

// getProductById= async (req,res) => {
//     try {
        
//     } catch (error) {
        
//     }
    
// }
// updateProductById= async (req,res) => {
//     try {
        
//     } catch (error) {
        
//     }
    
// }

// deleteProduct= async (req,res) => {
//     try {
        
//     } catch (error) {
        
//     }
    
// }



// }

// module.exports= new productController()



















const dayjs = require("dayjs");
const { insertData, selectData, selectOneData, updateData, deleteData } = require("../models/MasterModel");

class productController {
  // ---------------- CREATE PRODUCT ----------------
  createProduct = async (req, res) => {
    try {
      const {
        product_type_id,
        product_name,
        model_no,
        unit_id,
        manufacturer_name,
        product_image = null, // default to null
      } = req.body;

      if (!product_name || !product_type_id || !unit_id) {
        return res.status(400).json({
          success: false,
          message: "product_name, product_type_id, and unit_id are required",
        });
      }

      const created_by = req.user.id; // from auth middleware
      const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      const insertValues = {
        product_type_id,
        product_name,
        model_no,
        unit_id,
        manufacturer_name,
        product_image, // will be null if not provided
        created_by,
        created_at,
      };

      const insertedId = await insertData("md_product", insertValues);
      const newProduct = await selectOneData("md_product", "*", `product_id = ${insertedId}`);

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: newProduct,
      });
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ success: false, message: "Unable to create product" });
    }
  };

  // ---------------- GET ALL PRODUCTS ----------------
  getAllProducts = async (req, res) => {
    try {
      const products = await selectData("md_product", "*", null, "product_id DESC");

      res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: products,
      });
    } catch (error) {
      console.error("Get all products error:", error);
      res.status(500).json({ success: false, message: "Unable to fetch products" });
    }
  };

  // ---------------- GET PRODUCT BY ID ----------------
  getProductById = async (req, res) => {
    try {
      const { id } = req.params;
      const product = await selectOneData("md_product", "*", `product_id = ${id}`);

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      res.status(200).json({
        success: true,
        message: "Product fetched successfully",
        data: product,
      });
    } catch (error) {
      console.error("Get product by ID error:", error);
      res.status(500).json({ success: false, message: "Unable to fetch product" });
    }
  };

  // ---------------- UPDATE PRODUCT BY ID ----------------

  // updateProductById = async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const {
  //       product_type_id,
  //       product_name,
  //       model_no,
  //       unit_id,
  //       manufacturer_name,
  //       // product_image = null, // default to null
  //     } = req.body;

  //     const product = await selectOneData("md_product", "*", `product_id = ${id}`);
  //     if (!product) {
  //       return res.status(404).json({ success: false, message: "Product not found" });
  //     }

  //     const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

  //     const updateValues = {
  //       product_type_id,
  //       product_name,
  //       model_no,
  //       unit_id,
  //       manufacturer_name,
  //       // product_image,
  //       updated_at,
  //     };

  //     await updateData("md_product", updateValues, `product_id = ${id}`);
  //     const updatedProduct = await selectOneData("md_product", "*", `product_id = ${id}`);

  //     res.status(200).json({
  //       success: true,
  //       message: "Product updated successfully",
  //       data: updatedProduct,
  //     });
  //   } catch (error) {
  //     console.error("Update product error:", error);
  //     res.status(500).json({ success: false, message: "Unable to update product" });
  //   }
  // };

updateProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_type_id,
      product_name,
      model_no,
      unit_id,
      manufacturer_name,
      product_image,
    } = req.body;

    const product = await selectOneData("md_product", "*", `product_id = ${id}`);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

    const updateValues = {
      product_type_id: product_type_id ?? null,
      product_name: product_name ?? null,
      model_no: model_no ?? null,
      unit_id: unit_id ?? null,
      manufacturer_name: manufacturer_name ?? null,
      product_image: product_image ?? null,
      updated_at,
    };

    await updateData("md_product", updateValues, `product_id = ${id}`);
    const updatedProduct = await selectOneData("md_product", "*", `product_id = ${id}`);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ success: false, message: "Unable to update product" });
  }
};



  // ---------------- DELETE PRODUCT ----------------
  deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;

      const product = await selectOneData("md_product", "*", `product_id = ${id}`);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      await deleteData("md_product", `product_id = ${id}`);

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ success: false, message: "Unable to delete product" });
    }
  };
}

module.exports = new productController();
