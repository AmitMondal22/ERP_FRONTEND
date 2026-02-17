const dayjs = require("dayjs");

const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
  batchInsertData,
  customSelectSqlQuery,
} = require("../models/MasterModel");

class DamagedProductClaimController {

  // ===============================
  // CREATE CLAIM
  // ===============================

  createClaim = async (req, res) => {

    try {

      const {
        project_id,
        project_site_id,
        vendor_id,
        product_type_id,
        product_id,
        purchase_id,
        reason_for_damage,
        date_of_damage,
        expected_replacement_date
      } = req.body;

      const created_by = req.user.id;

      const claimData = {

        project_id,
        project_site_id,
        vendor_id,
        product_type_id,
        product_id,
        purchase_id,
        reason_for_damage,
        date_of_damage,
        expected_replacement_date,
        created_by,
        created_at: dayjs().format("YYYY-MM-DD HH:mm:ss")

      };

      const claimId = await insertData(
        "md_damaged_product_claim",
        claimData
      );

 
      return res.status(201).json({

        success: true,
        message: "Damage Claim Created",
        damage_claim_id: claimId

      });

    }

    catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message: "Error creating claim"
      });

    }

  };


  // ===============================
  // ADD CLAIM IMAGE
  // ===============================

//   addClaimImage = async (req, res) => {

//     try {

//       const {

//         damage_claim_id,
//         product_id,
//         vendor_id

//       } = req.body;


//       const image_url = req.file.path;


//       const imageData = {

//         damage_claim_id,
//         image_url,
//         product_id,
//         vendor_id,
//         created_by: req.user.id

//       };


//       const imageId = await insertData(

//         "md_damaged_product_claim_images",
//         imageData

//       );


//       res.status(201).json({

//         success: true,
//         message: "Image Uploaded",
//         damage_image_id: imageId

//       });

//     }

//     catch (error) {

//       console.log(error);

//       res.status(500).json({

//         success: false,
//         message: "Image Upload Failed"

//       });

//     }

//   };


addClaimImage = async (req, res) => {

  try {

    const {
      damage_claim_id,
      product_id,
      vendor_id
    } = req.body;

    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded"
      });
    }

    // Columns string (must match DB order)
    const columns = `
      damage_claim_id,
      image_url,
      product_id,
      vendor_id,
      created_by
    `;

    // Build rows array
    const rows = files.map(file => ({
      damage_claim_id,
      image_url: file.path,
      product_id,
      vendor_id,
      created_by: req.user.id
    }));

    // Batch insert
    const firstInsertId = await batchInsertData(
      "md_damaged_product_claim_images",
      columns,
      rows
    );

    res.status(201).json({
      success: true,
      message: "Images Uploaded",
      first_insert_id: firstInsertId
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};




// getAllClaims = async (req, res) => {

//   try {

//     const sql = `

//     SELECT

//     /* ================= CLAIM ================= */

//     c.damage_claim_id,
//     c.claim_status,
//     c.reason_for_damage,
//     c.date_of_damage,
//     c.expected_replacement_date,
//     c.created_at,


//     /* ================= PROJECT ================= */

//     p.project_id,
//     p.project_name,


//     /* ================= SITE ================= */

//     ps.project_site_id,
//     ps.project_site_name,


//     /* ================= VENDOR ================= */

//     v.vendor_id,
//     v.vendor_name,
//     v.vendor_mobile,
//     v.vendor_email,
//     v.vendor_address,
//     v.vendor_gst_in,




//     /* ================= PURCHASE ================= */

//     tp.purchase_id,
//     tp.invoice_no,
//     tp.invoice_date,
//     tp.delivery_date,


//     /* ================= PURCHASE ORDER ================= */

//     po.purchase_order_id,
//     po.po_no,
//     po.date AS po_date,
//     po.total_amount AS po_total,


//     /* ================= PURCHASE ORDER PRODUCT ================= */

//     pop.purchase_order_product_id,
//     pop.product_id,
//     pop.quantity,
//     pop.unit_price,
//     pop.total_amount AS product_total


//     FROM md_damaged_product_claim c


//     /* PURCHASE */

//     LEFT JOIN td_purchase tp
//     ON tp.purchase_id = c.purchase_id


//     /* PURCHASE ORDER */

//     LEFT JOIN td_purchase_order po
//     ON po.purchase_order_id = tp.purchase_order_id


//     /* PURCHASE ORDER PRODUCT */

//     LEFT JOIN td_purchase_order_product pop
//     ON pop.purchase_order_id = po.purchase_order_id


//     /* PROJECT */

//     LEFT JOIN md_project p
//     ON p.project_id = c.project_id


//     /* SITE */

//     LEFT JOIN md_project_site ps
//     ON ps.project_site_id = c.project_site_id


//     /* VENDOR */

//     LEFT JOIN md_vendor v
//     ON v.vendor_id = c.vendor_id



//     ORDER BY c.damage_claim_id DESC

//     `;



//     const claims = await customSelectSqlQuery(sql);



//     res.status(200).json({

//       success: true,
//       data: claims

//     });


//   }

//   catch (error) {

//     console.error(error);


//     res.status(500).json({

//       success: false,
//       message: "Error fetching claims"

//     });

//   }

// };

getAllClaims = async (req, res) => {
  try {
    const sql = `
      SELECT
        /* CLAIM */
        c.damage_claim_id,
        c.claim_status,
        c.reason_for_damage,
        c.date_of_damage,
        c.expected_replacement_date,
        c.created_at,

        /* PROJECT */
        p.project_id,
        p.project_name,

        /* SITE */
        ps.project_site_id,
        ps.project_site_name,

        /* VENDOR */
        v.vendor_id,
        v.vendor_name,
        v.vendor_mobile,
        v.vendor_email,
        v.vendor_address,
        v.vendor_gst_in,

        /* PURCHASE */
        tp.purchase_id,
        tp.invoice_no,
        tp.invoice_date,
        tp.delivery_date,

        /* PURCHASE ORDER */
        po.purchase_order_id,
        po.po_no,
        po.date AS po_date,
        po.total_amount AS po_total,

        /* PRODUCT */
        pr.product_id,
        pr.product_name,
        pr.hsn_code,
        pr.product_type_id

      FROM md_damaged_product_claim c
      LEFT JOIN td_purchase tp       ON tp.purchase_id = c.purchase_id
      LEFT JOIN td_purchase_order po ON po.purchase_order_id = tp.purchase_order_id
      LEFT JOIN md_project p         ON p.project_id = c.project_id
      LEFT JOIN md_project_site ps   ON ps.project_site_id = c.project_site_id
      LEFT JOIN md_vendor v          ON v.vendor_id = c.vendor_id
      LEFT JOIN md_product pr        ON pr.product_id = c.product_id

      ORDER BY c.damage_claim_id DESC
    `;

    const claims = await customSelectSqlQuery(sql);
    res.status(200).json({ success: true, data: claims });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching claims" });
  }
};





  getClaimById = async (req, res) => {

    try {

      const id = req.params.id;


      const claim = await selectOneData(

        "md_damaged_product_claim",
        "*",
        `damage_claim_id=${id}`

      );


      const images = await selectData(

        "md_damaged_product_claim_images",
        "*",
        `damage_claim_id=${id}`

      );


      res.json({

        success: true,
        data: claim,
        images

      });

    }

    catch (error) {

      res.status(500).json({

        success: false,
        message: "Error fetching claim"

      });

    }

  };



  // ===============================
  // UPDATE CLAIM
  // ===============================

  updateClaim = async (req, res) => {

    try {

      const id = req.params.id;

      const updated = await updateData(

        "md_damaged_product_claim",
        req.body,
        `damage_claim_id=${id}`

      );


      res.json({

        success: true,
        message: "Claim Updated"

      });

    }

    catch (error) {

      res.status(500).json({

        success: false,
        message: "Update Failed"

      });

    }

  };





  
  // ===============================
  // APPROVE CLAIM (SET claim_status = 'Y')
  // ===============================

  approveClaim = async (req, res) => {

    try {

      const id = req.params.id;

      // Check if the claim exists first
      const existingClaim = await selectOneData(
        "md_damaged_product_claim",
        "*",
        `damage_claim_id=${id}`
      );

      if (!existingClaim) {
        return res.status(404).json({
          success: false,
          message: "Claim not found"
        });
      }

      // Check if already approved
      if (existingClaim.claim_status === "Y") {
        return res.status(400).json({
          success: false,
          message: "Claim is already approved"
        });
      }

      await updateData(
        "md_damaged_product_claim",
        {
          claim_status: "Y",
          updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss")
        },
        `damage_claim_id=${id}`
      );

      return res.status(200).json({
        success: true,
        message: "Claim Approved Successfully",
        damage_claim_id: Number(id)
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message: "Error approving claim"
      });

    }

  };




  // ===============================
  // DELETE CLAIM
  // ===============================

  deleteClaim = async (req, res) => {

    try {

      const id = req.params.id;


      await deleteData(

        "md_damaged_product_claim",
        `damage_claim_id=${id}`

      );


      await deleteData(

        "md_damaged_product_claim_images",
        `damage_claim_id=${id}`

      );


      res.json({

        success: true,
        message: "Claim Deleted"

      });

    }

    catch (error) {

      res.status(500).json({

        success: false,
        message: "Delete Failed"

      });

    }

  };

}

module.exports = new DamagedProductClaimController();
