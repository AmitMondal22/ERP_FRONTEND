const fs = require("fs");
const path = require("path");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
} = require("../models/MasterModel");
const randomFutureDate = require("../utils/randomFutureDate");

class SiteImageController {

    createSiteImage = async (req, res) => {
        try {
            const {
                image_name,
                remarks,
                location,
                employee_id,
                project_id,
                project_site
            } = req.body;

            if (!image_name || !employee_id || !project_id) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing: image_name, employee_id, project_id"
            });
            }

            // Ensure upload folder exists
            const uploadDir = path.join(__dirname, "../uploads/site_image");
            if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Sanitize file name
            const safeName = image_name.replace(/[^a-zA-Z0-9]/g, "_");
            const { mimeType, buffer } = req.image;
            const extension = mimeType.split("/")[1];
            const fileName = `${safeName}_${Date.now()}.${extension}`;
            const uploadPath = path.join(uploadDir, fileName);

            // Write file
            fs.writeFileSync(uploadPath, buffer);

            const created_at = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

            const data = {
                image_url: `/uploads/site_image/${fileName}`,
                image_name,
                remarks: remarks || null,
                location: location || null,
                employee_id,
                project_id,
                project_site: project_site || null,
                created_by: req.user?.id || null,
                created_at,
                updated_at: created_at
            };

            const image_id = await insertData("td_site_image", data);
            if (!image_id) throw new Error("Failed to insert site image");



            const xtd_upload_reminder = await selectOneData("xtd_upload_reminder",'*', `user_id = ${req.user.id}`);
            if (!xtd_upload_reminder) {
                let instada = {
                    user_id:req.user.id,
                    date_time:randomFutureDate,
                    status:true
                }
                await insertData("xtd_upload_reminder", instada);
            }else{
                 let updateData = {
                    date_time:randomFutureDate,
                    status:true
                }
                await updateData("xtd_upload_reminder", updateData, `user_id = ${id}`);
            }




            res.status(201).json({
                success: true,
                message: "Site image uploaded and saved successfully",
                data: { image_id, ...data }
            });

        } catch (error) {
            console.error("Error in createSiteImage:", error.message);
            res.status(500).json({
            success: false,
            message: "Unable to create site image",
            error: error.message
            });
        }
    };

}


module.exports = new SiteImageController();