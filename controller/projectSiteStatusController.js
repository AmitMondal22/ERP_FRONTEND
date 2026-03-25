const dayjs = require("dayjs");
const utc   = require("dayjs/plugin/utc");
dayjs.extend(utc);

const {
  insertData,
  selectData,
  selectOneData,
  updateData,
  deleteData,
  customSelectSqlQuery2,
  batchInsertData,
} = require("../models/MasterModel");

class ProjectSiteStatus {

  // ================================================================
  // CREATE — POST /project-site-status
  // Body: { project_id, site_id, site_in_charge_id, status_type,
  //         reason, message, reported_date, images: [url, ...] }
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
        reported_date = null,
        images        = [],
      } = req.body;

      if (!project_id || !site_id || !status_type) {
        return res.status(400).json({
          success : false,
          message : "project_id, site_id and status_type are required",
        });
      }

      const now = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

      // ── Insert status record ──
      const status_id = await insertData("project_site_status", {
        project_id,
        site_id,
        site_in_charge_id,
        status_type,
        reason,
        message,
        reported_date : reported_date || null,
        created_at    : now,
      });

      // ── Batch insert all images in ONE query ──
      // const files = req.files || [];
      // let insertedImages = [];
      // if (files.length > 0) {
      //   const imageRows = images
      //     .filter(url => !!url)
      //     .map(url => ({
      //       status_id,
      //       image_url   : url,
      //       uploaded_at : now,
      //     }));

      //   if (imageRows.length > 0) {
      //     const firstInsertId = await batchInsertData(
      //       "project_site_status_images",
      //       "status_id, image_url, uploaded_at",
      //       imageRows
      //     );
      //     insertedImages = imageRows.map((row, i) => ({
      //       image_id : firstInsertId + i,
      //       ...row,
      //     }));
      //   }
      // }

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
  // GET ALL — GET /project-site-status
  // Optional query params: project_id, site_id, status_type
  // ================================================================
  async getAllStatuses(req, res) {
    try {
      const { project_id, site_id, status_type } = req.query;

      const conditions = [];
      const params     = [];

      if (project_id)  { conditions.push("s.project_id = ?");  params.push(project_id);  }
      if (site_id)     { conditions.push("s.site_id = ?");      params.push(site_id);     }
      if (status_type) { conditions.push("s.status_type = ?");  params.push(status_type); }

      const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

      const sql = `
        SELECT
          s.status_id, s.project_id, s.site_id, s.site_in_charge_id,
          s.status_type, s.reason, s.message, s.reported_date, s.created_at,
          i.image_id, i.image_url, i.uploaded_at
        FROM project_site_status s
        LEFT JOIN project_site_status_images i ON s.status_id = i.status_id
        ${whereClause}
        ORDER BY s.created_at DESC
      `;

      const rows = await customSelectSqlQuery2(sql, params, true);

      // ── Group flat JOIN rows into status objects with images[] ──
      const map = new Map();
      for (const row of rows) {
        if (!map.has(row.status_id)) {
          map.set(row.status_id, {
            status_id         : row.status_id,
            project_id        : row.project_id,
            site_id           : row.site_id,
            site_in_charge_id : row.site_in_charge_id,
            status_type       : row.status_type,
            reason            : row.reason,
            message           : row.message,
            reported_date     : row.reported_date,
            created_at        : row.created_at,
            images            : [],
          });
        }
        if (row.image_id) {
          map.get(row.status_id).images.push({
            image_id    : row.image_id,
            image_url   : row.image_url,
            uploaded_at : row.uploaded_at,
          });
        }
      }

      return res.status(200).json({
        success : true,
        count   : map.size,
        data    : [...map.values()],
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
          s.status_type, s.reason, s.message, s.reported_date, s.created_at,
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


  // ================================================================
  // UPDATE — PUT /project-site-status/:id
  // Body: updatable fields + add_images: [url] + remove_image_ids: [id]
  // ================================================================
  // async updateStatus(req, res) {
  //   try {
  //     const { id } = req.params;

  //     if (!id) {
  //       return res.status(400).json({ success: false, message: "status_id is required" });
  //     }

  //     // ── Check if record exists ──
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
  //       add_images       = [],
  //       remove_image_ids = [],
  //     } = req.body;

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

  //     if (Array.isArray(remove_image_ids) && remove_image_ids.length > 0) {
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

  //     // ── Fire update + delete simultaneously ──
  //     await Promise.all(tasks);

  //     // ── Batch insert new images in ONE query ──
  //     const now = dayjs().utc().format("YYYY-MM-DD HH:mm:ss");

  //     if (Array.isArray(add_images) && add_images.length > 0) {
  //       const imageRows = add_images
  //         .filter(url => !!url)
  //         .map(url => ({
  //           status_id   : Number(id),
  //           image_url   : url,
  //           uploaded_at : now,
  //         }));

  //       if (imageRows.length > 0) {
  //         await batchInsertData(
  //           "project_site_status_images",
  //           "status_id, image_url, uploaded_at",
  //           imageRows
  //         );
  //       }
  //     }

  //     // ── Fetch and return the fully updated record ──
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
        s.status_type, s.reason, s.message, s.reported_date, s.created_at,
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

}

module.exports = new ProjectSiteStatus();
