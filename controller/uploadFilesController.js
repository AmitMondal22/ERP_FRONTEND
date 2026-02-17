const dayjs = require("dayjs");

const {
  insertData,
  selectOneData,
  selectData,
  deleteData,
  batchInsertData
} = require("../models/MasterModel");


class UploadFilesController {


  // GENERATE GROUP ID

  // generateGroupId = async () => {

  //   const today = dayjs().format("DD-MM-YYYY");


  //   const lastRecord = await selectOneData(

  //     "td_uploads_files",

  //     "group_id",

  //     `group_id LIKE '${today}/%'`,

  //     "file_id DESC"

  //   );


  //   if (!lastRecord) {

  //     return `${today}/1`;

  //   }


  //   const lastNumber =
  //     parseInt(lastRecord.group_id.split("/")[1]);


  //   return `${today}${lastNumber + 1}`;

  // };

  generateGroupId = () => {
  const today = dayjs().format("DD-MM-YYYY");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${today}/${random}`;
  // produces e.g. "15-07-2025/K3X9F" — unique, instant, no DB round-trip
};



  // UPLOAD FILE
// uploadFile = async (req, res) => {

//   try {

//     const files = req.files;

//     if (!files || files.length === 0) {

//       return res.status(400).json({
//         success: false,
//         message: "No files uploaded"
//       });

//     }

//     // generate group id
//     const group_id = await this.generateGroupId();


//     // insert all files without for loop
//     const uploadedFiles = await Promise.all(

//       files.map(async (file) => {

//         const data = {

//           group_id: group_id,

//           file_name: file.filename,

//           original_name: file.originalname,

//           file_path: file.path,

//           file_type: file.mimetype,

//           file_size: file.size,

//           module_name: req.body.module_name,

//           reference_id: req.body.reference_id,

//           uploaded_by: req.user.id

//         };


//         const id = await insertData(
//           "td_uploads_files",
//           data
//         );


//         return {

//           file_id: id,
//           file_name: file.filename,
//           original_name: file.originalname

//         };

//       })

//     );


//     res.json({

//       success: true,

//       group_id: group_id,

//       files: uploadedFiles

//     });


//   }

//   catch (error) {

//     res.status(500).json({

//       success: false,
//       message: error.message

//     });

//   }

// };



uploadFile = async (req, res) => {

  try {

    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded"
      });
    }

    //console.log("iam being called")
    // Generate group id
    const group_id = await this.generateGroupId();

    // Column string (must match object key order)
    const columns = `
      group_id,
      file_name,
      original_name,
      file_path,
      file_type,
      file_size,
      module_name,
      reference_id,
      uploaded_by
    `;

    // Build rows
    const rows = files.map(file => ({
      group_id: group_id,
      file_name: file.filename,
      original_name: file.originalname,
      file_path: file.path,
      file_type: file.mimetype,
      file_size: file.size,
      module_name: req.body.module_name,
      reference_id: req.body.reference_id,
      uploaded_by: req.user.id
    }));

    // Batch insert
    const firstInsertId = await batchInsertData(
      "td_uploads_files",
      columns,
      rows
    );

    // Build response file list (simulate inserted IDs)
    const uploadedFiles = files.map((file, index) => ({
      file_id: firstInsertId + index,
      file_name: file.filename,
      original_name: file.originalname
    }));

    res.json({
      success: true,
      group_id: group_id,
      files: uploadedFiles
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};



// uploadFile = async (req, res) => {

//   try {

//     const files = req.files;

//     if (!files || files.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No files uploaded"
//       });
//     }

//     const group_id = await this.generateGroupId();

//     const uploadedFiles = [];

//     for (const file of files) {

//       const data = {

//         group_id: group_id,

//         file_name: file.filename,

//         original_name: file.originalname,

//         file_path: file.path,

//         file_type: file.mimetype,

//         file_size: file.size,

//         module_name: req.body.module_name,

//         reference_id: req.body.reference_id,

//         uploaded_by: req.user.id

//       };

//       const id = await insertData(
//         "td_uploads_files",
//         data
//       );

//       uploadedFiles.push({
//         file_id: id,
//         file_name: file.filename
//       });

//     }

//     res.json({

//       success: true,

//       group_id: group_id,

//       files: uploadedFiles

//     });

//   }

//   catch (error) {

//     res.status(500).json({

//       success: false,
//       message: error.message

//     });

//   }

// };


  // GET FILES

  getFiles = async (req, res) => {

    const group_id = req.params.group_id;


    const files = await selectData(

      "td_uploads_files",

      "*",

      `group_id='${group_id}'`

    );


    res.json({

      success: true,

      data: files

    });

  };



  // DELETE FILE

  deleteFile = async (req, res) => {

    const id = req.params.id;


    await deleteData(

      "td_uploads_files",

      `file_id=${id}`

    );


    res.json({

      success: true,

      message: "Deleted"

    });

  };


}


module.exports = new UploadFilesController();
