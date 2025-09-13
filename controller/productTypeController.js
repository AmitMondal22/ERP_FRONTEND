
const { insertData,selectData ,selectOneData,customSelectSqlQuery} = require("../models/MasterModel");



class ProductTypeController {

    getAllProductType = async (req, res) => {
        try {
            const prtductType = await selectData("md_product_type", "*");

            if (!prtductType || prtductType.length === 0) {
                return res.status(404).json({ message: "No product type found" });
            }

            return res.status(200).json({
                success: true,
                data: prtductType,
            });
        } catch (error) {
            console.error("Error fetching Product type:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    };


}

module.exports = new ProductTypeController();
