const dayjs = require("dayjs");
const { insertData, selectData, selectOneData, updateData, deleteData,customSelectSqlQuery } = require("../models/MasterModel");

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
        hsn_code,
        uom_id,
        qty,
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
        hsn_code,
        qty,
        uom_id,
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



getAllProducts = async (req, res) => {
  try {
    const products = await customSelectSqlQuery(`
      SELECT 
        p.product_id,
        p.product_type_id,
        pt.product_type_name,      -- fetch the name
        p.product_name,
        p.model_no, 
        p.uom_id,
        p.unit_id,
        u.unit_name,
        p.hsn_code,
        p.qty,
        p.manufacturer_name,
        p.product_image,
        p.created_by
      FROM md_product p
      INNER JOIN md_unit u ON p.unit_id = u.unit_id
      INNER JOIN md_product_type pt ON p.product_type_id = pt.product_type_id
      ORDER BY p.product_id DESC
    `, true);  // fetch all rows

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products || [],
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

    const product = await customSelectSqlQuery(`
      SELECT 
        p.product_id,
        p.product_type_id,
        pt.product_type_name,
        p.product_name,
        p.model_no,
        p.unit_id,
        u.unit_name,
        p.hsn_code,
        p. uom_id,
        p.qty,
        p.manufacturer_name,
        p.product_image,
        p.created_by,
        p.created_at,
        p.updated_at
      FROM md_product p
      INNER JOIN md_unit u ON p.unit_id = u.unit_id
      INNER JOIN md_product_type pt ON p.product_type_id = pt.product_type_id
      WHERE p.product_id = ${id}
    `, true); // fetchAll = true

    if (!product || product.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product[0], // single object
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
       uom_id,
      manufacturer_name,
      hsn_code,
      qty,
      product_image,
    } = req.body;

    const product = await selectOneData("md_product", "*", `product_id = ${id}`);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const updated_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

    const updateValues = {
      product_type_id: product_type_id ?? null,
       uom_id: uom_id ?? null,
      product_name: product_name ?? null,
      model_no: model_no ?? null,
      unit_id: unit_id ?? null,
      manufacturer_name: manufacturer_name ?? null,
       hsn_code: hsn_code ?? null,
      qty: qty ?? null,
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

  
//  getProductsByTypeId = async (req, res) => {
//   try {
//     const { product_type_id } = req.body;

//     if (!product_type_id) {
//       return res.status(400).json({
//         success: false,
//         message: "product_type_id is required",
//       });
//     }

//     // Select only product_name where product_type_id matches
//     const products = await selectData(
//       "md_product",
//       "product_name",
//       "product_id",
//       `product_type_id = ${product_type_id}`
//     );

//     return res.status(200).json({
//       success: true,
//       data: products,
//     });
//   } catch (error) {
//     console.error("Error fetching products by type:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };


 getProductsByTypeId = async (req, res) => {
  try {
    const { product_type_id } = req.body;

    if (!product_type_id) {
      return res.status(400).json({
        success: false,
        message: "product_type_id is required",
      });
    }

    // Fetch only product_id and product_name where product_type_id matches
    // Corrected argument order
    const products = await selectData(
      "md_product",
      "product_id, product_name, product_type_id,qty",
      `product_type_id = ${product_type_id}`
    );

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found for this product_type_id",
      });
    }

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products by type:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
