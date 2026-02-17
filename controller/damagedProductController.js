const dayjs = require("dayjs");

const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
  batchInsertData,
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
        invoice_id,
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
        invoice_id,
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


// addClaimImage = async (req, res) => {

//   try {

//     const {

//       damage_claim_id,
//       product_id,
//       vendor_id

//     } = req.body;


//     const files = req.files;


//     if (!files || files.length === 0) {

//       return res.status(400).json({

//         success: false,
//         message: "No files uploaded"

//       });

//     }


//     const insertedIds = [];


//     for (const file of files) {

//       const imageData = {

//         damage_claim_id,

//         image_url: file.path,

//         product_id,

//         vendor_id,

//         created_by: req.user.id

//       };


//       const imageId = await insertData(

//         "md_damaged_product_claim_images",

//         imageData

//       );


//       insertedIds.push(imageId);

//     }


//     res.status(201).json({

//       success: true,

//       message: "Images Uploaded",

//       damage_image_ids: insertedIds

//     });

//   }

//   catch (error) {

//     console.log(error);

//     res.status(500).json({

//       success: false,

//       message: error.message

//     });

//   }

// };



  // ===============================
  // GET ALL CLAIMS
  // ===============================

  getAllClaims = async (req, res) => {

    try {

      const claims = await selectData(

        "md_damaged_product_claim",
        "*",
        null,
        "damage_claim_id DESC"

      );


      res.json({

        success: true,
        data: claims

      });

    }

    catch (error) {

      res.status(500).json({

        success: false,
        message: "Error fetching claims"

      });

    }

  };



  // ===============================
  // GET CLAIM BY ID
  // ===============================

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
