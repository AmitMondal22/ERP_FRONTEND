
const { insertData,selectData ,selectOneData,customSelectSqlQuery} = require("../models/MasterModel");



class productController{
//md_product


 createProduct = async (req, res) => {
    try {
      const { 	product_type_id,	product_name,	model_no,	unit_id,	manufacturer_name,	product_image,	created_by,	updated_at	
} = req.body; 


      if (!project_name || !city_id) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      // Use user ID from token
      const insertValues = {
        project_name,
        city_id,
        create_by: req.user.id,
        created_at,
      };

      const insertedId = await insertData("md_project", insertValues);
      const newProject = await selectOneData("md_project", "*", `project_id = ${insertedId}`);

      res.status(201).json({ success: true, message: "Project created", data: newProject });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to create project" });
    }
  };



getAllProducts=async (req,res) => {
    try {
        
    } catch (error) {
        
    }
    
}

getProductById= async (req,res) => {
    try {
        
    } catch (error) {
        
    }
    
}
updateProductById= async (req,res) => {
    try {
        
    } catch (error) {
        
    }
    
}

deleteProduct= async (req,res) => {
    try {
        
    } catch (error) {
        
    }
    
}



}

module.exports= new productController()