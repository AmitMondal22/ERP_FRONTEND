// const dayjs = require("dayjs");
// const utc   = require("dayjs/plugin/utc");
// dayjs.extend(utc);

// const {
//   insertData,
//   selectData,
//   selectOneData,
//   updateData,
//   deleteData,
//   customSelectSqlQuery2,
//   batchInsertData,
// } = require("../models/MasterModel");

// class ProjectSiteStatus {

//   // ================================================================
//   // CREATE — POST /project-site-status
//   // Body: { project_id, site_id, site_in_charge_id, status_type,
//   //         reason, message, reported_date, images: [url, ...] }
//   // ================================================================

//   async createStatus(req, res) {
//     try {
//       const {
//         project_id,
//         site_id,
//         site_in_charge_id = null,
//         status_type,
//         reason        = null,
//         message       = null,
//         reported_date = null,
//         images        = [],
//       } = req.body;

//       if (!project_id || !site_id || !status_type) {
//         return res.status(400).json({
//           success : false,
//           message : "project_id, site_id and status_type are required",
//         });
//       }

//       const now = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

//       // ── Insert status record ──
//       const status_id = await insertData("project_site_status", {
//         project_id,
//         site_id,
//         site_in_charge_id,
//         status_type,
//         reason,
//         message,
//         reported_date : reported_date || null,
//         created_at    : now,
//       });

    

//       const files = req.files || [];
// let insertedImages = [];

// if (files.length > 0) {

//   const imageRows = files.map(file => ({
//     status_id,
//     image_url: file.filename, // or file.path
//     uploaded_at: now
//   }));

//   const firstInsertId = await batchInsertData(
//     "project_site_status_images",
//     "status_id, image_url, uploaded_at",
//     imageRows
//   );

//   insertedImages = imageRows.map((row, i) => ({
//     image_id: firstInsertId + i,
//     ...row
//   }));
// }



//       return res.status(201).json({
//         success : true,
//         message : "Status created successfully",
//         data    : {
//           status_id,
//           project_id,
//           site_id,
//           site_in_charge_id,
//           status_type,
//           reason,
//           message,
//           reported_date,
//           created_at : now,
//           images     : insertedImages,
//         },
//       });

//     } catch (err) {
//       console.error("[createStatus]", err);
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }


//   // ================================================================
//   // GET ALL — GET /project-site-status
//   // Optional query params: project_id, site_id, status_type
//   // ================================================================
//   async getAllStatuses(req, res) {
//     try {
//       const { project_id, site_id, status_type } = req.query;

//       const conditions = [];
//       const params     = [];

//       if (project_id)  { conditions.push("s.project_id = ?");  params.push(project_id);  }
//       if (site_id)     { conditions.push("s.site_id = ?");      params.push(site_id);     }
//       if (status_type) { conditions.push("s.status_type = ?");  params.push(status_type); }

//       const whereClause = conditions.length
//         ? `WHERE ${conditions.join(" AND ")}`
//         : "";

//       const sql = `
//         SELECT
//           s.status_id, s.project_id, s.site_id, s.site_in_charge_id,
//           s.status_type, s.reason, s.message, s.reported_date, s.created_at,
//           i.image_id, i.image_url, i.uploaded_at
//         FROM project_site_status s
//         LEFT JOIN project_site_status_images i ON s.status_id = i.status_id
//         ${whereClause}
//         ORDER BY s.created_at DESC
//       `;

//       const rows = await customSelectSqlQuery2(sql, params, true);

//       // ── Group flat JOIN rows into status objects with images[] ──
//       const map = new Map();
//       for (const row of rows) {
//         if (!map.has(row.status_id)) {
//           map.set(row.status_id, {
//             status_id         : row.status_id,
//             project_id        : row.project_id,
//             site_id           : row.site_id,
//             site_in_charge_id : row.site_in_charge_id,
//             status_type       : row.status_type,
//             reason            : row.reason,
//             message           : row.message,
//             reported_date     : row.reported_date,
//             created_at        : row.created_at,
//             images            : [],
//           });
//         }
//         if (row.image_id) {
//           map.get(row.status_id).images.push({
//             image_id    : row.image_id,
//             image_url   : row.image_url,
//             uploaded_at : row.uploaded_at,
//           });
//         }
//       }

//       return res.status(200).json({
//         success : true,
//         count   : map.size,
//         data    : [...map.values()],
//       });

//     } catch (err) {
//       console.error("[getAllStatuses]", err);
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }


//   // ================================================================
//   // GET ONE — GET /project-site-status/:id
//   // ================================================================
//   async getStatusById(req, res) {
//     try {
//       const { id } = req.params;

//       if (!id) {
//         return res.status(400).json({ success: false, message: "status_id is required" });
//       }

//       const sql = `
//         SELECT
//           s.status_id, s.project_id, s.site_id, s.site_in_charge_id,
//           s.status_type, s.reason, s.message, s.reported_date, s.created_at,
//           i.image_id, i.image_url, i.uploaded_at
//         FROM project_site_status s
//         LEFT JOIN project_site_status_images i ON s.status_id = i.status_id
//         WHERE s.status_id = ?
//       `;

//       const rows = await customSelectSqlQuery2(sql, [id], true);

//       if (!rows || rows.length === 0) {
//         return res.status(404).json({ success: false, message: "Status not found" });
//       }

//       const status = {
//         status_id         : rows[0].status_id,
//         project_id        : rows[0].project_id,
//         site_id           : rows[0].site_id,
//         site_in_charge_id : rows[0].site_in_charge_id,
//         status_type       : rows[0].status_type,
//         reason            : rows[0].reason,
//         message           : rows[0].message,
//         reported_date     : rows[0].reported_date,
//         created_at        : rows[0].created_at,
//         images            : rows
//           .filter(r => r.image_id)
//           .map(r => ({
//             image_id    : r.image_id,
//             image_url   : r.image_url,
//             uploaded_at : r.uploaded_at,
//           })),
//       };

//       return res.status(200).json({ success: true, data: status });

//     } catch (err) {
//       console.error("[getStatusById]", err);
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }


//   async updateStatus(req, res) {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ success: false, message: "status_id is required" });
//     }

//     const existing = await selectOneData(
//       "project_site_status",
//       "*",
//       `status_id = ${id}`
//     );

//     if (!existing) {
//       return res.status(404).json({ success: false, message: "Status not found" });
//     }

//     const {
//       project_id,
//       site_id,
//       site_in_charge_id,
//       status_type,
//       reason,
//       message,
//       reported_date,
//     } = req.body;

//     // ── Safe parse remove_image_ids from FormData ──
//     let remove_image_ids = req.body.remove_image_ids || req.body["remove_image_ids[]"] || [];
//     if (!Array.isArray(remove_image_ids)) {
//       remove_image_ids = [remove_image_ids];
//     }
//     remove_image_ids = remove_image_ids.map(Number).filter(Boolean);

//     // ── Build only fields that were actually sent ──
//     const updateFields = {};
//     if (project_id        !== undefined) updateFields.project_id        = project_id;
//     if (site_id           !== undefined) updateFields.site_id           = site_id;
//     if (site_in_charge_id !== undefined) updateFields.site_in_charge_id = site_in_charge_id;
//     if (status_type       !== undefined) updateFields.status_type       = status_type;
//     if (reason            !== undefined) updateFields.reason            = reason;
//     if (message           !== undefined) updateFields.message           = message;
//     if (reported_date     !== undefined) updateFields.reported_date     = reported_date;

//     // ── Run field update + bulk image delete in parallel ──
//     const tasks = [];

//     if (Object.keys(updateFields).length > 0) {
//       tasks.push(
//         updateData("project_site_status", updateFields, `status_id = ${id}`)
//       );
//     }

//     if (remove_image_ids.length > 0) {
//       const placeholders = remove_image_ids.map(() => "?").join(", ");
//       tasks.push(
//         customSelectSqlQuery2(
//           `DELETE FROM project_site_status_images
//            WHERE status_id = ? AND image_id IN (${placeholders})`,
//           [id, ...remove_image_ids],
//           false
//         )
//       );
//     }

//     await Promise.all(tasks);

//     // ── Batch insert new images from req.files ──
//     const now = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
//     const files = req.files || [];

//     if (files.length > 0) {
//       const imageRows = files.map(file => ({
//         status_id   : Number(id),
//         image_url   : file.filename,
//         uploaded_at : now,
//       }));

//       await batchInsertData(
//         "project_site_status_images",
//         "status_id, image_url, uploaded_at",
//         imageRows
//       );
//     }

//     // ── Fetch and return updated record ──
//     const sql = `
//       SELECT
//         s.status_id, s.project_id, s.site_id, s.site_in_charge_id,
//         s.status_type, s.reason, s.message, s.reported_date, s.created_at,
//         i.image_id, i.image_url, i.uploaded_at
//       FROM project_site_status s
//       LEFT JOIN project_site_status_images i ON s.status_id = i.status_id
//       WHERE s.status_id = ?
//     `;

//     const rows = await customSelectSqlQuery2(sql, [id], true);

//     const updated = {
//       status_id         : rows[0].status_id,
//       project_id        : rows[0].project_id,
//       site_id           : rows[0].site_id,
//       site_in_charge_id : rows[0].site_in_charge_id,
//       status_type       : rows[0].status_type,
//       reason            : rows[0].reason,
//       message           : rows[0].message,
//       reported_date     : rows[0].reported_date,
//       created_at        : rows[0].created_at,
//       images            : rows
//         .filter(r => r.image_id)
//         .map(r => ({
//           image_id    : r.image_id,
//           image_url   : r.image_url,
//           uploaded_at : r.uploaded_at,
//         })),
//     };

//     return res.status(200).json({
//       success : true,
//       message : "Status updated successfully",
//       data    : updated,
//     });

//   } catch (err) {
//     console.error("[updateStatus]", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// }
//   ///////

//   // ================================================================
//   // DELETE — DELETE /project-site-status/:id
//   // Deletes status AND all its images
//   // ================================================================
//   async deleteStatus(req, res) {
//     try {
//       const { id } = req.params;

//       if (!id) {
//         return res.status(400).json({ success: false, message: "status_id is required" });
//       }

//       const existing = await selectOneData(
//         "project_site_status",
//         "status_id",
//         `status_id = ${id}`
//       );

//       if (!existing) {
//         return res.status(404).json({ success: false, message: "Status not found" });
//       }

//       // ── Delete images first (FK safety), then status ──
//       await deleteData("project_site_status_images", `status_id = ${id}`);
//       await deleteData("project_site_status", `status_id = ${id}`);

//       return res.status(200).json({
//         success : true,
//         message : `Status ${id} and all its images deleted successfully`,
//       });

//     } catch (err) {
//       console.error("[deleteStatus]", err);
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }


//   // ================================================================
//   // ADD IMAGES — POST /project-site-status/:id/images
//   // Body: { images: [url, url, ...] }
//   // ================================================================
//   async addImages(req, res) {
//     try {
//       const { id }          = req.params;
//       const { images = [] } = req.body;

//       if (!id) {
//         return res.status(400).json({ success: false, message: "status_id is required" });
//       }

//       if (!Array.isArray(images) || images.length === 0) {
//         return res.status(400).json({ success: false, message: "images[] array is required" });
//       }

//       // ── Check parent exists ──
//       const existing = await selectOneData(
//         "project_site_status",
//         "status_id",
//         `status_id = ${id}`
//       );

//       if (!existing) {
//         return res.status(404).json({ success: false, message: "Status not found" });
//       }

//       const now = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

//       const imageRows = images
//         .filter(url => !!url)
//         .map(url => ({
//           status_id   : Number(id),
//           image_url   : url,
//           uploaded_at : now,
//         }));

//       if (imageRows.length === 0) {
//         return res.status(400).json({ success: false, message: "No valid image URLs provided" });
//       }

//       // ── Single batch insert for all images ──
//       const firstInsertId = await batchInsertData(
//         "project_site_status_images",
//         "status_id, image_url, uploaded_at",
//         imageRows
//       );

//       const insertedImages = imageRows.map((row, i) => ({
//         image_id : firstInsertId + i,
//         ...row,
//       }));

//       return res.status(201).json({
//         success : true,
//         message : `${insertedImages.length} image(s) added`,
//         data    : insertedImages,
//       });

//     } catch (err) {
//       console.error("[addImages]", err);
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }


//   // ================================================================
//   // DELETE IMAGE — DELETE /project-site-status/:id/images/:imageId
//   // ================================================================
//   async deleteImage(req, res) {
//     try {
//       const { id, imageId } = req.params;

//       if (!id || !imageId) {
//         return res.status(400).json({
//           success : false,
//           message : "status_id and image_id are required",
//         });
//       }

//       const existing = await selectOneData(
//         "project_site_status_images",
//         "image_id",
//         `image_id = ${imageId} AND status_id = ${id}`
//       );

//       if (!existing) {
//         return res.status(404).json({ success: false, message: "Image not found for this status" });
//       }

//       await deleteData(
//         "project_site_status_images",
//         `image_id = ${imageId} AND status_id = ${id}`
//       );

//       return res.status(200).json({
//         success : true,
//         message : `Image ${imageId} deleted successfully`,
//       });

//     } catch (err) {
//       console.error("[deleteImage]", err);
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }


//   ////////////////////////////




//   async getStatusByFilter(req, res) {
//   try {
//     const { project_id, site_id, date } = req.query;

//     if (!project_id && !site_id && !date) {
//       return res.status(400).json({
//         success : false,
//         message : "At least one filter (project_id, site_id, date) is required",
//       });
//     }

//     const conditions = [];
//     if (project_id) conditions.push(`project_id = ${project_id}`);
//     if (site_id)    conditions.push(`site_id = ${site_id}`);
//     if (date)       conditions.push(`(DATE(created_at) = '${date}' OR DATE(reported_date) = '${date}')`);

//     const condition = conditions.join(" AND ");

//     // ── Query 1: fetch matching statuses ──
//     const statuses = await selectData(
//       "project_site_status",
//       "*",
//       condition,
//       "created_at DESC"
//     );

//     if (!statuses || statuses.length === 0) {
//       return res.status(404).json({
//         success : false,
//         message : "No records found for given filters",
//       });
//     }

//     console.log("iam been called")

//     // ── Query 2: fetch ALL images for matched statuses in ONE query ──
//     const statusIds = statuses.map(s => s.status_id).join(",");

//     const images = await selectData(
//       "project_site_status_images",
//       "*",
//       `status_id IN (${statusIds})`
//     );

//     // ── Group images by status_id using a Map ──
//     const imageMap = new Map();
//     for (const img of images) {
//       if (!imageMap.has(img.status_id)) {
//         imageMap.set(img.status_id, []);
//       }
//       imageMap.get(img.status_id).push(img);
//     }

//     // ── Attach images to each status ──
//     const result = statuses.map(status => ({
//       ...status,
//       images : imageMap.get(status.status_id) || [],
//     }));

//     return res.status(200).json({
//       success : true,
//       count   : result.length,
//       data    : result,
//     });

//   } catch (err) {
//     console.error("[getStatusByFilter]", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// }

// }

// module.exports = new ProjectSiteStatus();





//////////////////////////////////////////////////////////









const dayjs = require("dayjs");
const utc   = require("dayjs/plugin/utc");
dayjs.extend(utc);

const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
  customSelectSqlQuery,
  customSelectSqlQuery2,
  batchInsertData,
} = require("../models/MasterModel");

class ProjectSiteStatus {

  // ================================================================
  // CREATE — POST /project-site-status
  // Body: { project_id, site_id, site_in_charge_id, status_type,
  //         reason, message, latitude, longitude, created_by,
  //         reported_date, images: [url, ...] }
  // ================================================================

  async createStatus(req, res) {
    try {
      const {
        project_id,
        site_id,
        site_in_charge_id = null,
        status_type,
        reason        = null,
        message       = null,
        latitude      = null,
        longitude     = null,
        reported_date = null,
        images        = [],
      } = req.body;

      if (!project_id || !site_id || !status_type) {
        return res.status(400).json({
          success : false,
          message : "project_id, site_id and status_type are required",
        });
      }

      // ── created_by is derived from the authenticated user, never trusted from the client ──
      const created_by = req.user.id;

      const now = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      // ── Insert status record ──
      const status_id = await insertData("project_site_status", {
        project_id,
        site_id,
        site_in_charge_id,
        status_type,
        reason,
        message,
        latitude,
        longitude,
        created_by,
        reported_date : reported_date || null,
        created_at    : now,
      });

    

      const files = req.files || [];
let insertedImages = [];

if (files.length > 0) {

  const imageRows = files.map(file => ({
    status_id,
    image_url: file.filename, // or file.path
    uploaded_at: now
  }));

  const firstInsertId = await batchInsertData(
    "project_site_status_images",
    "status_id, image_url, uploaded_at",
    imageRows
  );

  insertedImages = imageRows.map((row, i) => ({
    image_id: firstInsertId + i,
    ...row
  }));
}



      return res.status(201).json({
        success : true,
        message : "Status created successfully",
        data    : {
          status_id,
          project_id,
          site_id,
          site_in_charge_id,
          status_type,
          reason,
          message,
          latitude,
          longitude,
          created_by,
          reported_date,
          created_at : now,
          images     : insertedImages,
        },
      });

    } catch (err) {
      console.error("[createStatus]", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }



  // ================================================================
  // GET ALL — GET /api/get-all-project-site-status
  // Optional query params: project_id, site_id, status_type
  // ================================================================
  async getAllStatuses(req, res) {
    try {
      const { project_id, site_id, status_type } = req.query;

      const conditions = [];
      const params     = [];

      if (project_id && project_id !== "undefined" && project_id !== "null") {
        conditions.push("s.project_id = ?");
        params.push(project_id);
      }
      if (site_id && site_id !== "undefined" && site_id !== "null") {
        conditions.push("s.site_id = ?");
        params.push(site_id);
      }
      if (status_type && status_type !== "undefined" && status_type !== "null" && String(status_type).trim() !== "") {
        conditions.push("s.status_type = ?");
        params.push(status_type);
      }

      const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

      // ── Query 1: Fetch statuses without heavy JOIN duplication ──
      const sqlStatuses = `
        SELECT
          s.status_id, s.project_id, s.site_id, s.site_in_charge_id,
          s.status_type, s.reason, s.message, s.latitude, s.longitude,
          s.created_by, s.reported_date, s.created_at
        FROM project_site_status s
        ${whereClause}
        ORDER BY s.created_at DESC
      `;

      const statuses = await customSelectSqlQuery2(sqlStatuses, params, true);

      if (!statuses || statuses.length === 0) {
        return res.status(200).json({
          success : true,
          count   : 0,
          data    : [],
        });
      }

      // ── Query 2: Batch fetch images for matched statuses ──
      const statusIds = statuses.map((s) => s.status_id);
      const placeholders = statusIds.map(() => "?").join(",");

      const sqlImages = `
        SELECT image_id, status_id, image_url, uploaded_at
        FROM project_site_status_images
        WHERE status_id IN (${placeholders})
      `;

      const images = await customSelectSqlQuery2(sqlImages, statusIds, true);

      // ── Group images using plain object dictionary (faster than Map in production) ──
      const imagesByStatusId = {};
      if (Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (!imagesByStatusId[img.status_id]) {
            imagesByStatusId[img.status_id] = [];
          }
          imagesByStatusId[img.status_id].push({
            image_id    : img.image_id,
            image_url   : img.image_url,
            uploaded_at : img.uploaded_at,
          });
        }
      }

      // ── Combine images into status objects ──
      for (let i = 0; i < statuses.length; i++) {
        statuses[i].images = imagesByStatusId[statuses[i].status_id] || [];
      }

      return res.status(200).json({
        success : true,
        count   : statuses.length,
        data    : statuses,
      });

    } catch (err) {
      console.error("[getAllStatuses]", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  // ================================================================
  // GET ONE — GET /project-site-status/:id
  // ================================================================
  async getStatusById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: "status_id is required" });
      }

      const sql = `
        SELECT
          s.status_id, s.project_id, s.site_id, s.site_in_charge_id,
          s.status_type, s.reason, s.message, s.latitude, s.longitude,
          s.created_by, s.reported_date, s.created_at,
          i.image_id, i.image_url, i.uploaded_at
        FROM project_site_status s
        LEFT JOIN project_site_status_images i ON s.status_id = i.status_id
        WHERE s.status_id = ?
      `;

      const rows = await customSelectSqlQuery2(sql, [id], true);

      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: "Status not found" });
      }

      const status = {
        status_id         : rows[0].status_id,
        project_id        : rows[0].project_id,
        site_id           : rows[0].site_id,
        site_in_charge_id : rows[0].site_in_charge_id,
        status_type       : rows[0].status_type,
        reason            : rows[0].reason,
        message           : rows[0].message,
        latitude          : rows[0].latitude,
        longitude         : rows[0].longitude,
        created_by        : rows[0].created_by,
        reported_date     : rows[0].reported_date,
        created_at        : rows[0].created_at,
        images            : rows
          .filter(r => r.image_id)
          .map(r => ({
            image_id    : r.image_id,
            image_url   : r.image_url,
            uploaded_at : r.uploaded_at,
          })),
      };

      return res.status(200).json({ success: true, data: status });

    } catch (err) {
      console.error("[getStatusById]", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  async updateStatus(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "status_id is required" });
    }

    const existing = await selectOneData(
      "project_site_status",
      "*",
      `status_id = ${id}`
    );

    if (!existing) {
      return res.status(404).json({ success: false, message: "Status not found" });
    }

    const {
      project_id,
      site_id,
      site_in_charge_id,
      status_type,
      reason,
      message,
      latitude,
      longitude,
      created_by,
      reported_date,
    } = req.body;

    // ── Safe parse remove_image_ids from FormData ──
    let remove_image_ids = req.body.remove_image_ids || req.body["remove_image_ids[]"] || [];
    if (!Array.isArray(remove_image_ids)) {
      remove_image_ids = [remove_image_ids];
    }
    remove_image_ids = remove_image_ids.map(Number).filter(Boolean);

    // ── Build only fields that were actually sent ──
    const updateFields = {};
    if (project_id        !== undefined) updateFields.project_id        = project_id;
    if (site_id           !== undefined) updateFields.site_id           = site_id;
    if (site_in_charge_id !== undefined) updateFields.site_in_charge_id = site_in_charge_id;
    if (status_type       !== undefined) updateFields.status_type       = status_type;
    if (reason            !== undefined) updateFields.reason            = reason;
    if (message           !== undefined) updateFields.message           = message;
    if (latitude          !== undefined) updateFields.latitude          = latitude;
    if (longitude         !== undefined) updateFields.longitude         = longitude;
    if (created_by        !== undefined) updateFields.created_by        = created_by;
    if (reported_date     !== undefined) updateFields.reported_date     = reported_date;

    // ── Run field update + bulk image delete in parallel ──
    const tasks = [];

    if (Object.keys(updateFields).length > 0) {
      tasks.push(
        updateData("project_site_status", updateFields, `status_id = ${id}`)
      );
    }

    if (remove_image_ids.length > 0) {
      const placeholders = remove_image_ids.map(() => "?").join(", ");
      tasks.push(
        customSelectSqlQuery2(
          `DELETE FROM project_site_status_images
           WHERE status_id = ? AND image_id IN (${placeholders})`,
          [id, ...remove_image_ids],
          false
        )
      );
    }

    await Promise.all(tasks);

    // ── Batch insert new images from req.files ──
    const now = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");
    const files = req.files || [];

    if (files.length > 0) {
      const imageRows = files.map(file => ({
        status_id   : Number(id),
        image_url   : file.filename,
        uploaded_at : now,
      }));

      await batchInsertData(
        "project_site_status_images",
        "status_id, image_url, uploaded_at",
        imageRows
      );
    }

    // ── Fetch and return updated record ──
    const sql = `
      SELECT
        s.status_id, s.project_id, s.site_id, s.site_in_charge_id,
        s.status_type, s.reason, s.message, s.latitude, s.longitude,
        s.created_by, s.reported_date, s.created_at,
        i.image_id, i.image_url, i.uploaded_at
      FROM project_site_status s
      LEFT JOIN project_site_status_images i ON s.status_id = i.status_id
      WHERE s.status_id = ?
    `;

    const rows = await customSelectSqlQuery2(sql, [id], true);

    const updated = {
      status_id         : rows[0].status_id,
      project_id        : rows[0].project_id,
      site_id           : rows[0].site_id,
      site_in_charge_id : rows[0].site_in_charge_id,
      status_type       : rows[0].status_type,
      reason            : rows[0].reason,
      message           : rows[0].message,
      latitude          : rows[0].latitude,
      longitude         : rows[0].longitude,
      created_by        : rows[0].created_by,
      reported_date     : rows[0].reported_date,
      created_at        : rows[0].created_at,
      images            : rows
        .filter(r => r.image_id)
        .map(r => ({
          image_id    : r.image_id,
          image_url   : r.image_url,
          uploaded_at : r.uploaded_at,
        })),
    };

    return res.status(200).json({
      success : true,
      message : "Status updated successfully",
      data    : updated,
    });

  } catch (err) {
    console.error("[updateStatus]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
  ///////

  // ================================================================
  // DELETE — DELETE /project-site-status/:id
  // Deletes status AND all its images
  // ================================================================
  async deleteStatus(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: "status_id is required" });
      }

      const existing = await selectOneData(
        "project_site_status",
        "status_id",
        `status_id = ${id}`
      );

      if (!existing) {
        return res.status(404).json({ success: false, message: "Status not found" });
      }

      // ── Delete images first (FK safety), then status ──
      await deleteData("project_site_status_images", `status_id = ${id}`);
      await deleteData("project_site_status", `status_id = ${id}`);

      return res.status(200).json({
        success : true,
        message : `Status ${id} and all its images deleted successfully`,
      });

    } catch (err) {
      console.error("[deleteStatus]", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  // ================================================================
  // ADD IMAGES — POST /project-site-status/:id/images
  // Body: { images: [url, url, ...] }
  // ================================================================
  async addImages(req, res) {
    try {
      const { id }          = req.params;
      const { images = [] } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, message: "status_id is required" });
      }

      if (!Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ success: false, message: "images[] array is required" });
      }

      // ── Check parent exists ──
      const existing = await selectOneData(
        "project_site_status",
        "status_id",
        `status_id = ${id}`
      );

      if (!existing) {
        return res.status(404).json({ success: false, message: "Status not found" });
      }

      const now = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      const imageRows = images
        .filter(url => !!url)
        .map(url => ({
          status_id   : Number(id),
          image_url   : url,
          uploaded_at : now,
        }));

      if (imageRows.length === 0) {
        return res.status(400).json({ success: false, message: "No valid image URLs provided" });
      }

      // ── Single batch insert for all images ──
      const firstInsertId = await batchInsertData(
        "project_site_status_images",
        "status_id, image_url, uploaded_at",
        imageRows
      );

      const insertedImages = imageRows.map((row, i) => ({
        image_id : firstInsertId + i,
        ...row,
      }));

      return res.status(201).json({
        success : true,
        message : `${insertedImages.length} image(s) added`,
        data    : insertedImages,
      });

    } catch (err) {
      console.error("[addImages]", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  // ================================================================
  // DELETE IMAGE — DELETE /project-site-status/:id/images/:imageId
  // ================================================================
  async deleteImage(req, res) {
    try {
      const { id, imageId } = req.params;

      if (!id || !imageId) {
        return res.status(400).json({
          success : false,
          message : "status_id and image_id are required",
        });
      }

      const existing = await selectOneData(
        "project_site_status_images",
        "image_id",
        `image_id = ${imageId} AND status_id = ${id}`
      );

      if (!existing) {
        return res.status(404).json({ success: false, message: "Image not found for this status" });
      }

      await deleteData(
        "project_site_status_images",
        `image_id = ${imageId} AND status_id = ${id}`
      );

      return res.status(200).json({
        success : true,
        message : `Image ${imageId} deleted successfully`,
      });

    } catch (err) {
      console.error("[deleteImage]", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }


  ////////////////////////////




  async getStatusByFilter(req, res) {
  try {
    const { project_id, site_id, date } = req.query;

    if (!project_id && !site_id && !date) {
      return res.status(400).json({
        success : false,
        message : "At least one filter (project_id, site_id, date) is required",
      });
    }

    const conditions = [];
    if (project_id) conditions.push(`project_id = ${project_id}`);
    if (site_id)    conditions.push(`site_id = ${site_id}`);
    if (date)       conditions.push(`(DATE(created_at) = '${date}' OR DATE(reported_date) = '${date}')`);

    const condition = conditions.join(" AND ");

    // ── Query 1: fetch matching statuses ──
    // NOTE: "*" already includes latitude, longitude, created_by
    // from the updated table structure — no change needed here.
    const statuses = await selectData(
      "project_site_status",
      "*",
      condition,
      "created_at DESC"
    );

    if (!statuses || statuses.length === 0) {
      return res.status(404).json({
        success : false,
        message : "No records found for given filters",
      });
    }

    console.log("iam been called")

    // ── Query 2: fetch ALL images for matched statuses in ONE query ──
    const statusIds = statuses.map(s => s.status_id).join(",");

    const images = await selectData(
      "project_site_status_images",
      "*",
      `status_id IN (${statusIds})`
    );

    // ── Group images by status_id using a Map ──
    const imageMap = new Map();
    for (const img of images) {
      if (!imageMap.has(img.status_id)) {
        imageMap.set(img.status_id, []);
      }
      imageMap.get(img.status_id).push(img);
    }

    // ── Attach images to each status ──
    const result = statuses.map(status => ({
      ...status,
      images : imageMap.get(status.status_id) || [],
    }));

    return res.status(200).json({
      success : true,
      count   : result.length,
      data    : result,
    });

  } catch (err) {
    console.error("[getStatusByFilter]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/////////////////////////////////////////////////////



// ================================================================
// GET BY LOGGED-IN USER — GET /project-site-status/my-status
// Fetches all statuses created by the authenticated user,
// joined with project name and site name.
// Optional query param: status_type
// ================================================================
async getStatusByUser(req, res) {
  try {
    const userId = parseInt(req.user.id, 10);

    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Authenticated user id not found",
      });
    }

    const { status_type } = req.query;

    // Whitelist-style validation: adjust allowed values to match your actual enum/status_type values
    const ALLOWED_STATUS_TYPES = ["pending", "approved", "rejected", "in_progress"]; // <-- update to real values

    let condition = `s.created_by = ${userId}`;

    if (status_type) {
      if (!ALLOWED_STATUS_TYPES.includes(status_type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status_type. Allowed values: ${ALLOWED_STATUS_TYPES.join(", ")}`,
        });
      }
      condition += ` AND s.status_type = '${status_type}'`;
    }

    const sql = `
      SELECT
        s.status_id,
        s.project_id,
        s.site_id,
        s.site_in_charge_id,
        s.status_type,
        s.reason,
        s.message,
        s.latitude,
        s.longitude,
        s.created_by,
        s.reported_date,
        s.created_at,
        p.project_name,
        ps.project_site_name
      FROM project_site_status s
      LEFT JOIN md_project p
        ON s.project_id = p.project_id
      LEFT JOIN md_project_site ps
        ON s.site_id = ps.project_site_id
      WHERE ${condition}
      ORDER BY s.created_at DESC
    `;

    const statusData = await customSelectSqlQuery(sql, true);

    if (!statusData || statusData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No status records found.",
      });
    }

    // ------------------------------------------------------------
    // Fetch all images in a single query instead of one-per-row
    // ------------------------------------------------------------
    const statusIds = statusData
      .map((row) => parseInt(row.status_id, 10))
      .filter((id) => !Number.isNaN(id));

    let imagesByStatusId = {};

    if (statusIds.length > 0) {
      const imageSql = `
        SELECT
          image_id,
          status_id,
          image_url,
          uploaded_at
        FROM project_site_status_images
        WHERE status_id IN (${statusIds.join(",")})
        ORDER BY image_id ASC
      `;

      const allImages = await customSelectSqlQuery(imageSql, true);

      imagesByStatusId = (allImages || []).reduce((acc, img) => {
        if (!acc[img.status_id]) acc[img.status_id] = [];
        acc[img.status_id].push(img);
        return acc;
      }, {});
    }

    statusData.forEach((row) => {
      row.images = imagesByStatusId[row.status_id] || [];
    });

    return res.status(200).json({
      success: true,
      count: statusData.length,
      data: statusData,
    });

  } catch (err) {
    console.error("getStatusByUser:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}


/////////////////////


//  async getLoggedInUserDetails(req, res) {
//   try {
//     const userId = req.user?.id; // set by your auth middleware after JWT verification

//     if (!userId || isNaN(Number(userId))) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized. No valid user found in request.",
//       });
//     }

//     const user = await selectOneData(
//       "users",
//       "name, email, mobile_no",
//       `id = ${Number(userId)}` // cast to Number to avoid injection since condition is raw string
//     );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: user, // { name, email, mobile_no }
//     });
//   } catch (error) {
//     console.error("Error fetching logged-in user details:", {
//       message: error.message,
//       sqlMessage: error.sqlMessage,
//       code: error.code,
//       sql: error.sql,
//       stack: error.stack,
//     });

//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while fetching user details.",
//     });
//   }
// };



async getLoggedInUserDetails(req, res) {
  try {
    const userId = req.user?.id; // set by your auth middleware after JWT verification

    if (!userId || isNaN(Number(userId))) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No valid user found in request.",
      });
    }

    const user = await selectOneData(
      "users u LEFT JOIN em_employees e ON u.id = e.user_id", // table + join
      `u.name, u.email, u.mobile_no, e.employee_id, e.job_title, e.employee_dob`, // select
      `u.id = ${Number(userId)}` // condition (cast to Number to avoid injection)
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user, // { name, email, mobile_no, employee_id, job_title, employee_dob }
    });
  } catch (error) {
    console.error("Error fetching logged-in user details:", {
      message: error.message,
      sqlMessage: error.sqlMessage,
      code: error.code,
      sql: error.sql,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching user details.",
    });
  }
}





}

module.exports = new ProjectSiteStatus();