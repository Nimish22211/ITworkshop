class Issue {
  constructor(pool) {
    this.pool = pool;
  }

  async create(issueData) {
    const {
      latitude, longitude, address, category, title, 
      description, severity, photos, reported_by
    } = issueData;

    const query = `
      INSERT INTO issues (latitude, longitude, address, category, title, description, severity, photos, reported_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      parseFloat(latitude), 
      parseFloat(longitude), 
      address, 
      category, 
      title, 
      description, 
      parseInt(severity), 
      JSON.stringify(photos), 
      reported_by
    ];
    
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      const result = await client.query(query, values);
      
      // Add to status history
      await this.addStatusHistory(result.rows[0].id, 'reported', reported_by, null, client);
      
      await client.query('COMMIT');
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findAll(filters = {}) {
    let query = `
      SELECT i.*, 
             u1.name as reported_by_name, u1.email as reported_by_email,
             u2.name as assigned_to_name, u2.email as assigned_to_email, u2.department
      FROM issues i
      LEFT JOIN users u1 ON i.reported_by = u1.id
      LEFT JOIN users u2 ON i.assigned_to = u2.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 0;

    if (filters.category && filters.category !== 'all') {
      paramCount++;
      query += ` AND i.category = $${paramCount}`;
      values.push(filters.category);
    }
    
    if (filters.status && filters.status !== 'all') {
      paramCount++;
      query += ` AND i.status = $${paramCount}`;
      values.push(filters.status);
    }
    
    if (filters.severity) {
      paramCount++;
      query += ` AND i.severity >= $${paramCount}`;
      values.push(parseInt(filters.severity));
    }

    if (filters.assigned_to) {
      paramCount++;
      query += ` AND i.assigned_to = $${paramCount}`;
      values.push(parseInt(filters.assigned_to));
    }

    if (filters.startDate) {
      paramCount++;
      query += ` AND i.created_at >= $${paramCount}`;
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      paramCount++;
      query += ` AND i.created_at <= $${paramCount}`;
      values.push(filters.endDate);
    }

    query += ` ORDER BY i.created_at DESC LIMIT 1000`;

    const result = await this.pool.query(query, values);
    
    // Parse photos JSON for each issue
    return result.rows.map(issue => ({
      ...issue,
      photos: typeof issue.photos === 'string' ? JSON.parse(issue.photos) : issue.photos
    }));
  }

  async findById(id) {
    const query = `
      SELECT i.*, 
             u1.name as reported_by_name, u1.email as reported_by_email, u1.phone as reported_by_phone,
             u2.name as assigned_to_name, u2.email as assigned_to_email, u2.department
      FROM issues i
      LEFT JOIN users u1 ON i.reported_by = u1.id
      LEFT JOIN users u2 ON i.assigned_to = u2.id
      WHERE i.id = $1
    `;
    
    const result = await this.pool.query(query, [id]);
    if (result.rows[0]) {
      result.rows[0].photos = typeof result.rows[0].photos === 'string' 
        ? JSON.parse(result.rows[0].photos) 
        : result.rows[0].photos;
    }
    return result.rows[0];
  }

  async updateStatus(id, status, updatedBy, internalNotes = null) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update issue
      let query = `UPDATE issues SET status = $1, updated_at = CURRENT_TIMESTAMP`;
      let values = [status];
      let paramCount = 1;
      
      if (internalNotes) {
        paramCount++;
        query += `, internal_notes = $${paramCount}`;
        values.push(internalNotes);
      }
      
      if (status === 'resolved') {
        query += `, resolved_at = CURRENT_TIMESTAMP`;
      }
      
      paramCount++;
      query += ` WHERE id = $${paramCount} RETURNING *`;
      values.push(parseInt(id));
      
      const result = await client.query(query, values);
      
      // Add to status history
      await this.addStatusHistory(id, status, updatedBy, internalNotes, client);
      
      await client.query('COMMIT');
      
      // Parse photos for return
      if (result.rows[0]) {
        result.rows[0].photos = typeof result.rows[0].photos === 'string' 
          ? JSON.parse(result.rows[0].photos) 
          : result.rows[0].photos;
      }
      
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async assignToOfficial(id, officialId, assignedBy) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const query = `
        UPDATE issues 
        SET assigned_to = $1, status = 'acknowledged', updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 
        RETURNING *
      `;
      
      const result = await client.query(query, [parseInt(officialId), parseInt(id)]);
      
      // Add to status history
      await this.addStatusHistory(id, 'acknowledged', assignedBy, `Assigned to official ID: ${officialId}`, client);
      
      await client.query('COMMIT');
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findByAssignedOfficial(officialId) {
    const query = `
      SELECT i.*, 
             u.name as reported_by_name, u.email as reported_by_email, u.phone as reported_by_phone
      FROM issues i
      LEFT JOIN users u ON i.reported_by = u.id
      WHERE i.assigned_to = $1
      ORDER BY 
        CASE i.status 
          WHEN 'acknowledged' THEN 1
          WHEN 'in_progress' THEN 2
          WHEN 'resolved' THEN 3
          WHEN 'verified' THEN 4
          ELSE 5
        END,
        i.severity DESC,
        i.created_at ASC
    `;
    
    const result = await this.pool.query(query, [parseInt(officialId)]);
    
    // Parse photos for each issue
    return result.rows.map(issue => ({
      ...issue,
      photos: typeof issue.photos === 'string' ? JSON.parse(issue.photos) : issue.photos
    }));
  }

  async addStatusHistory(issueId, status, updatedBy, notes = null, client = null) {
    const db = client || this.pool;
    const query = `
      INSERT INTO status_history (issue_id, status, updated_by, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await db.query(query, [
      parseInt(issueId), 
      status, 
      parseInt(updatedBy), 
      notes
    ]);
    return result.rows[0];
  }

  async getStatusHistory(issueId) {
    const query = `
      SELECT sh.*, u.name as updated_by_name, u.role
      FROM status_history sh
      LEFT JOIN users u ON sh.updated_by = u.id
      WHERE sh.issue_id = $1
      ORDER BY sh.created_at ASC
    `;
    
    const result = await this.pool.query(query, [parseInt(issueId)]);
    return result.rows;
  }

  async getAnalytics() {
    const queries = {
      totalIssues: 'SELECT COUNT(*) as count FROM issues',
      resolvedIssues: 'SELECT COUNT(*) as count FROM issues WHERE status = $1',
      avgResolutionTime: `
        SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_hours
        FROM issues 
        WHERE status = 'resolved' AND resolved_at IS NOT NULL
      `,
      issuesByCategory: `
        SELECT category, COUNT(*) as count 
        FROM issues 
        GROUP BY category 
        ORDER BY count DESC
      `,
      issuesByStatus: `
        SELECT status, COUNT(*) as count 
        FROM issues 
        GROUP BY status 
        ORDER BY 
          CASE status 
            WHEN 'reported' THEN 1
            WHEN 'acknowledged' THEN 2
            WHEN 'in_progress' THEN 3
            WHEN 'resolved' THEN 4
            WHEN 'verified' THEN 5
          END
      `
    };

    const results = {};
    
    for (const [key, query] of Object.entries(queries)) {
      try {
        if (key === 'resolvedIssues') {
          const result = await this.pool.query(query, ['resolved']);
          results[key] = parseInt(result.rows[0].count);
        } else {
          const result = await this.pool.query(query);
          results[key] = key.includes('By') ? result.rows : 
                       key === 'avgResolutionTime' ? parseFloat(result.rows[0].avg_hours) || 0 :
                       parseInt(result.rows[0].count);
        }
      } catch (error) {
        console.error(`Error fetching ${key}:`, error);
        results[key] = key.includes('By') ? [] : 0;
      }
    }

    return results;
  }

  async getTrendData(months = 6) {
    const query = `
      WITH monthly_stats AS (
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as issues,
          COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
        FROM issues 
        WHERE created_at >= NOW() - INTERVAL '${months} months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
      )
      SELECT 
        TO_CHAR(month, 'Mon') as month,
        issues::integer,
        resolved::integer
      FROM monthly_stats
    `;

    try {
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching trend data:', error);
      return [];
    }
  }

  async getOfficialStats(officialId) {
    const queries = {
      pending: `
        SELECT COUNT(*) as count 
        FROM issues 
        WHERE assigned_to = $1 AND status IN ('acknowledged', 'reported')
      `,
      inProgress: `
        SELECT COUNT(*) as count 
        FROM issues 
        WHERE assigned_to = $1 AND status = 'in_progress'
      `,
      resolvedThisWeek: `
        SELECT COUNT(*) as count 
        FROM issues 
        WHERE assigned_to = $1 
        AND status = 'resolved' 
        AND resolved_at >= NOW() - INTERVAL '7 days'
      `
    };

    const results = {};
    
    for (const [key, query] of Object.entries(queries)) {
      try {
        const result = await this.pool.query(query, [parseInt(officialId)]);
        results[key] = parseInt(result.rows[0].count);
      } catch (error) {
        console.error(`Error fetching ${key} for official ${officialId}:`, error);
        results[key] = 0;
      }
    }

    return results;
  }
}

module.exports = Issue;
