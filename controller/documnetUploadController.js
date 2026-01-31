const dayjs = require("dayjs");

const {
  batchInsertData,
  selectData,
  updateData,
  deleteData,
  customSelectSqlQuery
} = require("../models/MasterModel");

const TABLE = "md_documents_uploder";

/* =====================================================
   🔹 Generate Document Group ID (YYYYMMDD/SEQ)
   ===================================================== */
// async function generateDocumentGroupId() {
//   const today = dayjs().format("YYYYMMDD");

//   const sql = `
//     SELECT document_group_id
//     FROM ${TABLE}
//     WHERE document_group_id LIKE '${today}/%'
//     ORDER BY document_group_id DESC
//     LIMIT 1
//   `;

//   const last = await customSelectSqlQuery(sql, false);

//   if (!last) return `${today}/1`;

//   const lastIndex = parseInt(last.document_group_id.split("/")[1], 10);
//   return `${today}/${lastIndex + 1}`;
// }


async function generateDocumentGroupId() {
  const today = dayjs().format("YYYYMMDD");

  const sql = `
    SELECT document_group_id
    FROM ${TABLE}
    WHERE document_group_id LIKE '${today}/%'
    ORDER BY document_group_id DESC
    LIMIT 1
  `;

  // console.log("🔍 SQL Query:", sql);
  
  const last = await customSelectSqlQuery(sql, false);
  
  // console.log("🔍 Query Result:", last);
  // console.log("🔍 Type of result:", typeof last);
  // console.log("🔍 Is array?", Array.isArray(last));

  if (!last) {
    console.log("✅ No previous record, returning:", `${today}/1`);
    return `${today}/1`;
  }

  const lastIndex = parseInt(last.document_group_id.split("/")[1], 10);
  const newId = `${today}/${lastIndex + 1}`;
  
  console.log("✅ Generated ID:", newId);
  return newId;
}
/* =====================================================
   🔹 Detect File Type
   ===================================================== */
function detectFileType(mime) {
  if (!mime) return "OTHER";
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime === "application/pdf") return "PDF";
  if (mime.includes("csv")) return "EXCEL";
  if (mime.includes("spreadsheet")) return "EXCEL";
  if (mime.includes("word")) return "DOC";
  return "OTHER";
}

class DocumentUploadController {

  /* =====================================================
     ✅ CREATE (MULTIPLE FILE UPLOAD)
     ===================================================== */
  async createDocumentUpload(req, res) {
    try {
      const {
        title,
        project_id,
        project_site_id,
        remarks,
        created_by
      } = req.body;

      const files = req.files;

      if (!files || !files.length) {
        return res.status(400).json({
          success: false,
          message: "No files provided"
        });
      }

      if (!project_id || !project_site_id) {
        return res.status(400).json({
          success: false,
          message: "project_id and project_site_id are required"
        });
      }

      const document_group_id = await generateDocumentGroupId();

      const rows = files.map(file => ({
        document_group_id,
        title,
        project_id,
        project_site_id,
        file_type: detectFileType(file.mimetype),
        image_file_url: `/uploads/site_image/${file.filename}`,
        remarks,
        created_by
      }));

      await batchInsertData(
        TABLE,
        "document_group_id,title,project_id,project_site_id,file_type,image_file_url,remarks,created_by",
        rows
      );

      res.status(201).json({
        success: true,
        message: "Documents uploaded successfully",
        document_group_id
      });

    } catch (error) {
      console.error("createDocumentUpload error:", error);
      res.status(500).json({
        success: false,
        message: "Document upload failed"
      });
    }
  }

  /* =====================================================
     📥 READ BY PROJECT ID
     ===================================================== */
  async getByProjectId(req, res) {
    try {
      const { project_id } = req.params;

      if (!project_id || isNaN(project_id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project_id"
        });
      }

      const data = await selectData(
        TABLE,
        "*",
        `project_id = ${project_id}`,
        "created_at DESC"
      );

      res.json({ success: true, count: data.length, data });

    } catch (error) {
      console.error("getByProjectId error:", error);
      res.status(500).json({ success: false });
    }
  }

  /* =====================================================
     📥 READ BY DOCUMENT GROUP ID
     ===================================================== */
  async getByGroupId(req, res) {
    try {
      const { group_id } = req.params;

      const data = await selectData(
        TABLE,
        "*",
        `document_group_id = '${group_id}'`,
        "created_at DESC"
      );

      res.json({ success: true, count: data.length, data });

    } catch (error) {
      console.error("getByGroupId error:", error);
      res.status(500).json({ success: false });
    }
  }



// async getGroupedDocuments(req, res) {
//     try {
//       // SQL query to group documents and get file counts
//       const sql = `
//         SELECT 
//           document_group_id,
//           title,
//           project_id,
//           project_site_id,
//           remarks,
//           created_by,
//           COUNT(*) as total_files,
//           GROUP_CONCAT(file_type) as file_types,
//           MIN(created_at) as created_at,
//           MAX(created_at) as last_updated_at,
//           GROUP_CONCAT(image_file_url) as file_urls
//         FROM ${TABLE}
//         GROUP BY document_group_id, title, project_id, project_site_id, remarks, created_by
//         ORDER BY created_at DESC
//       `;

//       const data = await customSelectSqlQuery(sql, true);

//       // Transform the data to make it more readable
//       const transformedData = data.map(row => ({
//         document_group_id: row.document_group_id,
//         title: row.title,
//         project_id: row.project_id,
//         project_site_id: row.project_site_id,
//         total_files: row.total_files,
//         file_types: row.file_types ? row.file_types.split(',') : [],
//         remarks: row.remarks,
//         created_by: row.created_by,
//         created_at: row.created_at,
//         last_updated_at: row.last_updated_at,
//         file_urls: row.file_urls ? row.file_urls.split(',') : []
//       }));

//       res.json({
//         success: true,
//         count: transformedData.length,
//         data: transformedData
//       });

//     } catch (error) {
//       console.error("getGroupedDocuments error:", error);
//       res.status(500).json({
//         success: false,
//         message: "Failed to fetch grouped documents"
//       });
//     }
//   }

async getGroupedDocuments(req, res) {
  try {
    const sql = `
      SELECT 
        d.document_group_id,
        d.title,
        d.project_id,
        p.project_name,
        d.project_site_id,
        ps.project_site_name,
        d.remarks,
        d.created_by,
        COUNT(*) AS total_files,
        GROUP_CONCAT(d.file_type) AS file_types,
        MIN(d.created_at) AS created_at,
        MAX(d.created_at) AS last_updated_at,
        GROUP_CONCAT(d.image_file_url) AS file_urls
      FROM ${TABLE} d
      LEFT JOIN md_project p 
        ON p.project_id = d.project_id
      LEFT JOIN md_project_site ps 
        ON ps.project_site_id = d.project_site_id
      GROUP BY 
        d.document_group_id,
        d.title,
        d.project_id,
        p.project_name,
        d.project_site_id,
        ps.project_site_name,
        d.remarks,
        d.created_by
      ORDER BY created_at DESC
    `;

    const data = await customSelectSqlQuery(sql, true);

    const transformedData = data.map(row => ({
      document_group_id: row.document_group_id,
      title: row.title,

      project_id: row.project_id,
      project_name: row.project_name,

      project_site_id: row.project_site_id,
      project_site_name: row.project_site_name,

      total_files: row.total_files,
      file_types: row.file_types ? row.file_types.split(",") : [],
      remarks: row.remarks,
      created_by: row.created_by,
      created_at: row.created_at,
      last_updated_at: row.last_updated_at,
      file_urls: row.file_urls ? row.file_urls.split(",") : []
    }));

    res.json({
      success: true,
      count: transformedData.length,
      data: transformedData
    });

  } catch (error) {
    console.error("getGroupedDocuments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch grouped documents"
    });
  }
}

async deleteDocumentGroupbyGroupId(req, res) {
  try {
    const { id } = req.body;  // ← From BODY, not params
    console.log("🗑️ Deleting group from body:", id);
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "ID required in request body" 
      });
    }

    const affected = await deleteData(
      TABLE,
      `document_group_id = '${id.replace(/'/g, "\\'")}'`
    );

    res.json({
      success: affected > 0,
      affectedRows: affected,
      message: "Document group deleted successfully"
    });
  } catch (error) {
    console.error("deleteDocumentGroup error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}






  /* =====================================================
     ✏️ UPDATE DOCUMENT META
     ===================================================== */
  async updateDocument(req, res) {
    try {
      const { id } = req.params;
      const { title, remarks } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid document ID"
        });
      }

      const affected = await updateData(
        TABLE,
        { title, remarks },
        `document_uploder_id = ${id}`
      );

      res.json({
        success: affected > 0,
        message: affected ? "Document updated successfully" : "No changes made"
      });

    } catch (error) {
      console.error("updateDocument error:", error);
      res.status(500).json({ success: false });
    }
  }

  /* =====================================================
     🗑️ DELETE SINGLE DOCUMENT
     ===================================================== */
  async deleteDocument(req, res) {
    try {
      const { id } = req.params;

      const affected = await deleteData(
        TABLE,
        `document_uploder_id = ${id}`
      );
  console.log("calling")
      res.json({
        success: affected > 0,
        message: "Document deleted successfully"
      });

    } catch (error) {
      console.error("deleteDocument error:", error);
      res.status(500).json({ success: false });
    }
  }

  /* =====================================================
     🗑️ DELETE FULL DOCUMENT GROUP
     ===================================================== */
 
}

module.exports = new DocumentUploadController();
