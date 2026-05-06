const dayjs = require("dayjs");

const {
  
  customSelectSqlQuery,
} = require("../models/MasterModel");


class dashboard{

    getDashboardData = async (req, res) => {
    try {
      // Run all queries in parallel
      const [monthlySales, monthlyPurchase, projectProgress] = await Promise.all([

        // ── 1. MONTHLY SALES ──────────────────────────────────────────
        customSelectSqlQuery(`
          SELECT
            DATE_FORMAT(created_at, '%Y-%m') AS month,
            SUM(amount)                      AS total_sales
          FROM md_project_billing
          GROUP BY month
          ORDER BY month ASC
        `),

        // ── 2. MONTHLY PURCHASE ───────────────────────────────────────
        customSelectSqlQuery(`
          SELECT
            DATE_FORMAT(created_at, '%Y-%m') AS month,
            SUM(total_amount)                AS total_purchase
          FROM td_purchase_order
          GROUP BY month
          ORDER BY month ASC
        `),

        // ── 3. PROJECT PROGRESS (fully in SQL — no JS merge loops) ────
        
        // customSelectSqlQuery(`
        //   SELECT
        //     p.project_id,
        //     mp.project_name
        //     COALESCE(p.total_estimation, 0)  AS total_estimation,
        //     COALESCE(c.total_completed, 0)   AS total_completed,
        //     ROUND(
        //       CASE
        //         WHEN COALESCE(p.total_estimation, 0) = 0 THEN 0
        //         ELSE (COALESCE(c.total_completed, 0) / p.total_estimation) * 100
        //       END, 2
        //     )                                AS progress_percent
        //   FROM (
        //     -- Latest estimation per (project_id, bom_id), summed per project
        //     SELECT
        //       project_id,
        //       SUM(rep_task) AS total_estimation
        //     FROM tx_project_details_with_estimation t1
        //     WHERE created_at = (
        //       SELECT MAX(t2.created_at)
        //       FROM tx_project_details_with_estimation t2
        //       WHERE t2.project_id = t1.project_id
        //         AND t2.bom_id    = t1.bom_id
        //     )
        //     GROUP BY project_id
        //   ) p
        //   LEFT JOIN (
        //     SELECT
        //       project_id,
        //       SUM(boms_completed_count) AS total_completed
        //     FROM work_billing_order
        //     GROUP BY project_id
        //   ) c ON c.project_id = p.project_id

        //   UNION

        //   -- Projects that have completions but no estimation rows
        //   SELECT
        //     c.project_id,
        //     0                                AS total_estimation,
        //     c.total_completed,
        //     0                                AS progress_percent
        //   FROM (
        //     SELECT
        //       project_id,
        //       SUM(boms_completed_count) AS total_completed
        //     FROM work_billing_order
        //     GROUP BY project_id
        //   ) c
        //   WHERE c.project_id NOT IN (
        //     SELECT DISTINCT project_id
        //     FROM tx_project_details_with_estimation
        //   )
        // `),


        customSelectSqlQuery(`
  SELECT
    p.project_id,
    mp.project_name,
    COALESCE(p.total_estimation, 0)  AS total_estimation,
    COALESCE(c.total_completed, 0)   AS total_completed,
    ROUND(
      CASE
        WHEN COALESCE(p.total_estimation, 0) = 0 THEN 0
        ELSE (COALESCE(c.total_completed, 0) / p.total_estimation) * 100
      END, 2
    ) AS progress_percent
  FROM (
    -- Latest estimation per (project_id, bom_id), summed per project
    SELECT
      project_id,
      SUM(rep_task) AS total_estimation
    FROM tx_project_details_with_estimation t1
    WHERE created_at = (
      SELECT MAX(t2.created_at)
      FROM tx_project_details_with_estimation t2
      WHERE t2.project_id = t1.project_id
        AND t2.bom_id    = t1.bom_id
    )
    GROUP BY project_id
  ) p

  LEFT JOIN (
    SELECT
      project_id,
      SUM(boms_completed_count) AS total_completed
    FROM work_billing_order
    GROUP BY project_id
  ) c ON c.project_id = p.project_id

  LEFT JOIN md_project mp ON mp.project_id = p.project_id


  UNION


  -- Projects that have completions but no estimation
  SELECT
    c.project_id,
    mp.project_name,
    0 AS total_estimation,
    c.total_completed,
    0 AS progress_percent
  FROM (
    SELECT
      project_id,
      SUM(boms_completed_count) AS total_completed
    FROM work_billing_order
    GROUP BY project_id
  ) c

  LEFT JOIN md_project mp ON mp.project_id = c.project_id

  WHERE c.project_id NOT IN (
    SELECT DISTINCT project_id
    FROM tx_project_details_with_estimation
  )
`)
      ]);

      return res.json({
        success: true,
        data: { monthlySales, monthlyPurchase, projectProgress },
      });

    } catch (error) {
      console.error("Dashboard Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };



}


module.exports= new dashboard()