/**
 * DS360 API Server ΓÇö MySQL backend
 * Compatible with Node 10+ (uses mysql package, no optional chaining)
 * Port: process.env.PORT || 3002
 */
const http = require('http');
const mysql = require('mysql');
const path  = require('path');
const fs    = require('fs');

const PORT = process.env.PORT || 3002;

// Load credentials from env.php (one level up from server/)
let DB_HOST = process.env.DB_HOST || 'localhost';
let DB_NAME = process.env.DB_NAME || '';
let DB_USER = process.env.DB_USER || '';
let DB_PASS = process.env.DB_PASS || '';

const envPhpPath = path.join(__dirname, '..', 'env.php');
if (fs.existsSync(envPhpPath)) {
  const src = fs.readFileSync(envPhpPath, 'utf8');
  function extract(key) {
    const m = src.match(new RegExp("define\\('" + key + "',\\s*'([^']+)'\\)"));
    return m ? m[1] : '';
  }
  if (!DB_NAME) DB_NAME = extract('DB_NAME');
  if (!DB_USER) DB_USER = extract('DB_USER');
  if (!DB_PASS) DB_PASS = extract('DB_PASS');
  if (!DB_HOST) DB_HOST = extract('DB_HOST');
}

// ΓöÇΓöÇ Connection pool ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const pool = mysql.createPool({
  host:            DB_HOST,
  database:        DB_NAME,
  user:            DB_USER,
  password:        DB_PASS,
  connectionLimit: 10,
});

function query(sql, params) {
  return new Promise(function(resolve, reject) {
    pool.query(sql, params || [], function(err, results) {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// T-10b: Idempotent column adder. ALTER TABLE ADD COLUMN is not idempotent
// in MySQL — it errors if the column already exists. This helper checks
// INFORMATION_SCHEMA first and only issues the ALTER when the column is
// missing. Safe to call on every startup.
async function ensureColumn(table, column, columnDef) {
  try {
    var rows = await query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?",
      [table, column]
    );
    if (rows && rows.length > 0) return; // already exists
    await query("ALTER TABLE `" + table + "` ADD COLUMN `" + column + "` " + columnDef);
    console.log("[SCHEMA] Added column " + table + "." + column);
  } catch (e) {
    console.warn("[SCHEMA] ensureColumn(" + table + "." + column + ") failed: " + e.message);
    // Non-fatal: continue startup
  }
}

// ΓöÇΓöÇ Schema init ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
async function initSchema() {
  await query(`CREATE TABLE IF NOT EXISTS ds360_templates (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    active TINYINT(1) DEFAULT 1,
    approval_required TINYINT(1) DEFAULT 0,
    read_only VARCHAR(100) DEFAULT 'No (Editable by partners)',
    internal_use_only VARCHAR(100) DEFAULT 'No (Available to partners)',
    template_type_id VARCHAR(64) DEFAULT '',
    config_json LONGTEXT,
    elements_json LONGTEXT,
    typography_json LONGTEXT,
    source_file_name VARCHAR(255) DEFAULT '',
    imported_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
  // T-10b: Add the new columns to existing tables (idempotent ALTERs).
  // These ALTERs use INFORMATION_SCHEMA to check column existence first
  // so they can run safely on every startup.
  await ensureColumn('ds360_templates', 'source_file_name', "VARCHAR(255) DEFAULT ''");
  await ensureColumn('ds360_templates', 'imported_at', 'TIMESTAMP NULL DEFAULT NULL');
  await query(`CREATE TABLE IF NOT EXISTS ds360_images (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    active TINYINT(1) DEFAULT 1,
    preview_type VARCHAR(32) DEFAULT 'image',
    preview_src LONGTEXT,
    preview_aspect VARCHAR(64),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
  // Ensure preview_src can hold large base64 images
  try { await query("ALTER TABLE ds360_images MODIFY preview_src LONGTEXT"); } catch (e) { /* already LONGTEXT or no permission */ }
  await query(`CREATE TABLE IF NOT EXISTS ds360_report_fields (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    field_type VARCHAR(255) DEFAULT '',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
  await query(`CREATE TABLE IF NOT EXISTS ds360_template_types (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
  console.log('[DB] Schema ready');
}

// ΓöÇΓöÇ HTTP helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
function send(res, status, data) {
  var body = JSON.stringify(data);
  res.writeHead(status, Object.assign({ 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }, CORS));
  res.end(body);
}
function parseBody(req) {
  return new Promise(function(resolve) {
    var raw = '';
    req.on('data', function(c) { raw += c; });
    req.on('end', function() { try { resolve(JSON.parse(raw || '{}')); } catch(e) { resolve({}); } });
  });
}

// ΓöÇΓöÇ Server ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
var server = http.createServer(async function(req, res) {
  var method = req.method;
  var url    = new URL(req.url, 'http://localhost:' + PORT);
  var p      = url.pathname;

  if (method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }

  try {

    // Health
    if (method === 'GET' && p === '/api/health')
      return send(res, 200, { status: 'ok', time: new Date().toISOString() });

    // ΓöÇΓöÇ Templates ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    if (method === 'GET' && p === '/api/templates') {
      var rows = await query('SELECT id,name,active,description,approval_required,read_only,internal_use_only,template_type_id,source_file_name,imported_at FROM ds360_templates ORDER BY created_at DESC');
      return send(res, 200, rows.map(function(r) { return {
        id: r.id, name: r.name, active: r.active === 1,
        description: r.description || '',
        approvalRequired: r.approval_required === 1,
        readOnly: r.read_only, internalUseOnly: r.internal_use_only,
        templateTypeId: r.template_type_id || '',
        sourceFileName: r.source_file_name || '',
        importedAt: r.imported_at ? new Date(r.imported_at).toISOString() : null,
      }; }));
    }

    var tmplId = p.match(/^\/api\/templates\/(.+)$/);
    if (method === 'GET' && tmplId) {
      var row = (await query('SELECT * FROM ds360_templates WHERE id=?', [tmplId[1]]))[0];
      if (!row) return send(res, 404, { error: 'Not found' });
      return send(res, 200, {
        id: row.id, name: row.name, active: row.active === 1,
        description: row.description || '',
        approvalRequired: row.approval_required === 1,
        readOnly: row.read_only, internalUseOnly: row.internal_use_only,
        templateTypeId: row.template_type_id || '',
        sourceFileName: row.source_file_name || '',
        importedAt: row.imported_at ? new Date(row.imported_at).toISOString() : null,
        config_json: row.config_json, elements_json: row.elements_json,
        typography_json: row.typography_json,
      });
    }

    if (method === 'POST' && p === '/api/templates') {
      var b = await parseBody(req);
      if (!b.id || !b.name) return send(res, 400, { error: 'id and name required' });
      await query(
        'INSERT INTO ds360_templates (id,name,description,active,approval_required,read_only,internal_use_only,template_type_id,config_json,elements_json,typography_json,source_file_name,imported_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),description=VALUES(description),active=VALUES(active),approval_required=VALUES(approval_required),read_only=VALUES(read_only),internal_use_only=VALUES(internal_use_only),template_type_id=VALUES(template_type_id),config_json=VALUES(config_json),elements_json=VALUES(elements_json),typography_json=VALUES(typography_json),source_file_name=VALUES(source_file_name),imported_at=VALUES(imported_at),updated_at=CURRENT_TIMESTAMP',
        [b.id, b.name, b.description || '', b.active !== false ? 1 : 0, b.approvalRequired ? 1 : 0,
         b.readOnly || 'No (Editable by partners)', b.internalUseOnly || 'No (Available to partners)',
         b.templateTypeId || b.template_type_id || '',
         b.config_json || null, b.elements_json || null, b.typography_json || null,
         b.sourceFileName || b.source_file_name || '',
         b.importedAt || null]
      );
      console.log('[DB] Upserted template "' + b.name + '"');
      return send(res, 200, { success: true });
    }

    if (method === 'PUT' && tmplId) {
      var pb = await parseBody(req);
      if (!pb.id || !pb.name) return send(res, 400, { error: 'id and name required' });
      if (pb.id !== tmplId[1]) return send(res, 400, { error: 'id in URL and body do not match' });
      await query(
        'INSERT INTO ds360_templates (id,name,description,active,approval_required,read_only,internal_use_only,template_type_id,config_json,elements_json,typography_json,source_file_name,imported_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),description=VALUES(description),active=VALUES(active),approval_required=VALUES(approval_required),read_only=VALUES(read_only),internal_use_only=VALUES(internal_use_only),template_type_id=VALUES(template_type_id),config_json=VALUES(config_json),elements_json=VALUES(elements_json),typography_json=VALUES(typography_json),source_file_name=VALUES(source_file_name),imported_at=VALUES(imported_at),updated_at=CURRENT_TIMESTAMP',
        [pb.id, pb.name, pb.description || '', pb.active !== false ? 1 : 0, pb.approvalRequired ? 1 : 0,
         pb.readOnly || 'No (Editable by partners)', pb.internalUseOnly || 'No (Available to partners)',
         pb.templateTypeId || pb.template_type_id || '',
         pb.config_json || null, pb.elements_json || null, pb.typography_json || null,
         pb.sourceFileName || pb.source_file_name || '',
         pb.importedAt || null]
      );
      console.log('[DB] Updated template "' + pb.name + '" via PUT /api/templates/' + tmplId[1]);
      return send(res, 200, { success: true });
    }

    if (method === 'DELETE' && tmplId) {
      await query('DELETE FROM ds360_templates WHERE id=?', [tmplId[1]]);
      return send(res, 200, { success: true });
    }

    // ΓöÇΓöÇ Images ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    if (method === 'GET' && p === '/api/images') {
      var imgs = await query('SELECT * FROM ds360_images ORDER BY id');
      return send(res, 200, imgs.map(function(r) { return {
        id: r.id, name: r.name, active: r.active === 1,
        previewType: r.preview_type, previewSrc: r.preview_src, previewAspect: r.preview_aspect,
      }; }));
    }

    if (method === 'POST' && p === '/api/images/bulk') {
      var imgs = await parseBody(req);
      if (!Array.isArray(imgs)) return send(res, 400, { error: 'Array expected' });
      await query('DELETE FROM ds360_images');
      for (var i = 0; i < imgs.length; i++) {
        var img = imgs[i];
        if (!img.id) continue;
        await query('INSERT INTO ds360_images (id,name,active,preview_type,preview_src,preview_aspect) VALUES (?,?,?,?,?,?)',
          [img.id, img.name || '', img.active !== false ? 1 : 0, img.previewType || 'image', img.previewSrc || null, img.previewAspect || null]);
      }
      return send(res, 200, { success: true, count: imgs.length });
    }

    // ΓöÇΓöÇ Report Fields ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    if (method === 'GET' && p === '/api/report-fields') {
      var fields = await query('SELECT * FROM ds360_report_fields ORDER BY id');
      return send(res, 200, fields.map(function(r) { return { id: r.id, name: r.name, fieldType: r.field_type, description: r.description }; }));
    }

    if (method === 'POST' && p === '/api/report-fields/bulk') {
      var fields = await parseBody(req);
      if (!Array.isArray(fields)) return send(res, 400, { error: 'Array expected' });
      await query('DELETE FROM ds360_report_fields');
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        if (!f.id) continue;
        await query('INSERT INTO ds360_report_fields (id,name,field_type,description) VALUES (?,?,?,?)',
          [f.id, f.name || '', f.fieldType || '', f.description || '']);
      }
      return send(res, 200, { success: true, count: fields.length });
    }

    // ΓöÇΓöÇ Template Types ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    if (method === 'GET' && p === '/api/template-types') {
      var types = await query('SELECT * FROM ds360_template_types ORDER BY id');
      return send(res, 200, types.map(function(r) { return { id: r.id, name: r.name, description: r.description }; }));
    }

    if (method === 'POST' && p === '/api/template-types/bulk') {
      var types = await parseBody(req);
      if (!Array.isArray(types)) return send(res, 400, { error: 'Array expected' });
      await query('DELETE FROM ds360_template_types');
      for (var i = 0; i < types.length; i++) {
        var t = types[i];
        if (!t.id) continue;
        await query('INSERT INTO ds360_template_types (id,name,description) VALUES (?,?,?)',
          [t.id, t.name || '', t.description || '']);
      }
      return send(res, 200, { success: true, count: types.length });
    }

    // ΓöÇΓöÇ Users ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    // Status mapping: DB stores lowercase, UI uses Title Case
    function dbToUiStatus(s) {
      if (s === 'active')    return 'Active';
      if (s === 'suspended') return 'Suspended';
      if (s === 'inactive')  return 'Inactive';
      return 'Active';
    }
    function uiToDbStatus(s) {
      if (!s) return 'active';
      return s.toLowerCase();
    }

    if (method === 'GET' && p === '/api/users') {
      var users = await query('SELECT id,email,first_name,last_name,partner,partner_type,status FROM users ORDER BY id');
      return send(res, 200, users.map(function(r) { return {
        id:          String(r.id),
        email:       r.email,
        firstName:   r.first_name,
        lastName:    r.last_name,
        partner:     r.partner || '',
        partnerType: r.partner_type || 'Buyer',
        status:      dbToUiStatus(r.status),
      }; }));
    }

    if (method === 'POST' && p === '/api/users/bulk') {
      var users = await parseBody(req);
      if (!Array.isArray(users)) return send(res, 400, { error: 'Array expected' });
      for (var i = 0; i < users.length; i++) {
        var u = users[i];
        if (!u.email) continue;
        await query(
          'INSERT INTO users (email,first_name,last_name,partner,partner_type,status,password_hash) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE first_name=VALUES(first_name),last_name=VALUES(last_name),partner=VALUES(partner),partner_type=VALUES(partner_type),status=VALUES(status)',
          [u.email, u.firstName || '', u.lastName || '', u.partner || '', u.partnerType || 'Buyer', uiToDbStatus(u.status), u.password_hash || '$2y$12$placeholder']
        );
      }
      return send(res, 200, { success: true, count: users.length });
    }

    if (method === 'POST' && p === '/api/users') {
      var u = await parseBody(req);
      if (!u.email) return send(res, 400, { error: 'email required' });
      await query(
        'INSERT INTO users (email,first_name,last_name,partner,partner_type,status,password_hash) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE first_name=VALUES(first_name),last_name=VALUES(last_name),partner=VALUES(partner),partner_type=VALUES(partner_type),status=VALUES(status)',
        [u.email, u.firstName || '', u.lastName || '', u.partner || '', u.partnerType || 'Buyer', uiToDbStatus(u.status), u.password_hash || '$2y$12$placeholder']
      );
      return send(res, 200, { success: true });
    }

    var userId = p.match(/^\/api\/users\/(.+)$/);
    if (method === 'DELETE' && userId) {
      await query('DELETE FROM users WHERE id=?', [userId[1]]);
      return send(res, 200, { success: true });
    }

    // ── Template Migration ────────────────────────────────────────────────────
    const CANVAS_CONFIG_DEFAULTS = {
      marginTop: 24, marginRight: 24, marginBottom: 24, marginLeft: 24,
      paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
      contentWidth: "full", contentMaxWidth: 720, contentAlignment: "left",
      elementGap: 0, bgColor: "#ffffff",
      borderStyle: "none", borderWidth: 1, borderColor: "#000000",
      spacingUnit: "px",
      globalTypography: {
        templateTitle:    { fontFamily: "Montserrat", fontSize: 22, fontWeight: 700, color: "#46367F", textAlign: "left" },
        templateDescription: { fontFamily: "Poppins", fontSize: 13, fontWeight: 400, color: "#3A3A3A", textAlign: "left" },
        h1: { fontFamily: "Montserrat", fontSize: 28, fontWeight: 700, color: "#2D2D2D", textAlign: "left" },
        h2: { fontFamily: "Montserrat", fontSize: 22, fontWeight: 700, color: "#2D2D2D", textAlign: "left" },
        h3: { fontFamily: "Montserrat", fontSize: 18, fontWeight: 700, color: "#2D2D2D", textAlign: "left" },
        h4: { fontFamily: "Montserrat", fontSize: 15, fontWeight: 700, color: "#2D2D2D", textAlign: "left" },
        h5: { fontFamily: "Montserrat", fontSize: 13, fontWeight: 700, color: "#2D2D2D", textAlign: "left" },
        h6: { fontFamily: "Montserrat", fontSize: 11, fontWeight: 700, color: "#2D2D2D", textAlign: "left" },
        paragraph: { fontFamily: "Poppins", fontSize: 13, fontWeight: 400, color: "#6B6B6B", textAlign: "left" },
      },
      pageSizePreset: "letter", pageSizeWidth: 816, pageSizeHeight: 1056, pageOrientation: "portrait",
    };

    function needsMigration(configJson) {
      if (!configJson) return true;
      try {
        const cfg = JSON.parse(configJson);
        return Object.keys(CANVAS_CONFIG_DEFAULTS).some(k => cfg[k] === undefined);
      } catch { return true; }
    }

    function fixPageBreakConfig(elementsJson) {
      if (!elementsJson) return null;
      try {
        const els = JSON.parse(elementsJson);
        let changed = false;
        const fixed = els.map(el => {
          if (el.type === "page-break" && Array.isArray(el.config)) {
            changed = true;
            return { ...el, config: {} };
          }
          return el;
        });
        return changed ? JSON.stringify(fixed) : null;
      } catch { return null; }
    }

    if (method === 'GET' && p === '/api/templates/migrate/status') {
      const rows = await query("SELECT id, name, config_json, elements_json FROM ds360_templates ORDER BY created_at DESC");
      const status = rows.map(r => {
        const hasImportedPage = r.elements_json && r.elements_json.includes('"type":"imported-page"');
        return {
          id: r.id, name: r.name,
          needsConfig: needsMigration(r.config_json),
          hasPageBreakIssue: r.elements_json && r.elements_json.includes('"type":"page-break"'),
          hasImportedPage,
          skipped: hasImportedPage,
        };
      });
      return send(res, 200, { templates: status, total: rows.length });
    }

    if (method === 'POST' && p === '/api/templates/migrate') {
      const rows = await query("SELECT id, name, config_json, elements_json FROM ds360_templates ORDER BY created_at DESC");
      let patched = 0, skipped = 0, errors = 0;

      for (const row of rows) {
        try {
          const hasImportedPage = row.elements_json && row.elements_json.includes('"type":"imported-page"');
          if (hasImportedPage) { skipped++; continue; }

          let configJson = row.config_json;
          let elementsJson = row.elements_json;

          const needsConfig = needsMigration(configJson);
          const fixedElements = fixPageBreakConfig(elementsJson);

          if (!needsConfig && !fixedElements) { skipped++; continue; }

          if (needsConfig) {
            const existing = configJson ? JSON.parse(configJson) : {};
            const merged = Object.assign({}, CANVAS_CONFIG_DEFAULTS, existing);
            configJson = JSON.stringify(merged);
          }
          if (fixedElements) elementsJson = fixedElements;

          await query(
            "UPDATE ds360_templates SET config_json=?, elements_json=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
            [configJson, elementsJson, row.id]
          );
          patched++;
          console.log('[MIGRATE] Patched: ' + row.name + ' (' + row.id + ')');
        } catch (e) {
          errors++;
          console.error('[MIGRATE] Error on ' + row.id + ': ' + e.message);
        }
      }
      return send(res, 200, { success: true, patched, skipped, errors });
    }

    // ── T-10a: Server-side document import endpoint ─────────────
    // Accepts a file upload (multipart/form-data) or raw body, parses
    // server-side, and returns a normalized ParsedDocument. Useful for:
    // server-side file size validation, virus scanning, audit log.
    //
    // NOTE: This endpoint is a thin stub in v1. It validates the upload
    // and returns a structured response. Actual server-side parsing
    // (PDF/DOCX/XLSX) is intentionally left to the client for now
    // because the Node-side parser libraries add 100MB+ to the deploy
    // bundle. The endpoint exists to establish the wire format and
    // server-side validation surface; the field is set so the schema
    // can evolve without breaking the client contract.
    if (method === 'POST' && p === '/api/templates/import') {
      var imp = await parseBody(req);
      // Support two modes:
      //   1. { fileName, fileSize, fileType, source } — metadata-only
      //   2. { fileName, contentBase64 } — full upload (base64-encoded)
      if (!imp.fileName) return send(res, 400, { error: 'fileName required' });
      var fName = String(imp.fileName).slice(0, 255);
      var fSize = parseInt(imp.fileSize, 10) || 0;
      var fType = String(imp.fileType || '').toLowerCase();
      var allowedTypes = ['pdf', 'docx', 'xlsx', 'xls', 'md', 'txt'];
      if (allowedTypes.indexOf(fType) === -1) {
        return send(res, 400, { error: 'fileType must be one of: ' + allowedTypes.join(', ') });
      }
      if (fSize > 10 * 1024 * 1024) {
        return send(res, 413, { error: 'File too large (max 10MB)' });
      }
      console.log('[IMPORT] Server-side import request: ' + fName + ' (' + fSize + ' bytes, ' + fType + ')');
      // Return a structured response indicating the request was accepted
      // and the contract for what the server returns. Client uses the
      // response to drive the import flow.
      return send(res, 200, {
        accepted: true,
        fileName: fName,
        fileSize: fSize,
        fileType: fType,
        serverParsed: false,  // server-side parsing deferred to v2
        message: 'Server-side parsing is currently a stub. Client-side parsing should be used. This endpoint validates the request format and provides a stable contract.',
        timestamp: new Date().toISOString(),
      });
    }

    // ── T-10c: Audit log endpoint ─────────────────────────────────
    // Returns the import history for a template (which file, when).
    if (method === 'GET' && p.match(/^\/api\/templates\/(.+)\/import-history$/)) {
      var hidMatch = p.match(/^\/api\/templates\/(.+)\/import-history$/);
      var hidTmplId = hidMatch[1];
      var hist = await query(
        "SELECT id, name, source_file_name, imported_at, updated_at FROM ds360_templates WHERE id=?",
        [hidTmplId]
      );
      if (!hist || hist.length === 0) {
        return send(res, 200, { templateId: hidTmplId, history: [], message: 'No import history found (template not found or never imported).' });
      }
      var row = hist[0];
      return send(res, 200, {
        templateId: hidTmplId,
        templateName: row.name,
        history: row.source_file_name
          ? [{
              fileName: row.source_file_name,
              importedAt: row.imported_at ? new Date(row.imported_at).toISOString() : null,
              lastUpdated: row.updated_at ? new Date(row.updated_at).toISOString() : null,
            }]
          : [],
        message: row.source_file_name
          ? 'Import history available'
          : 'This template was not imported from a file (created manually or imported before this feature was added).',
      });
    }

    send(res, 404, { error: 'Not found' });

  } catch(err) {
    console.error('[ERROR]', err.message);
    send(res, 500, { error: err.message });
  }
});

initSchema().then(function() {
  server.listen(PORT, function() {
    console.log('[DS360 API] Listening on port ' + PORT);
    console.log('[DS360 API] DB: ' + DB_NAME + ' @ ' + DB_HOST);
  });
}).catch(function(err) {
  console.error('[FATAL] Schema init failed:', err.message);
  process.exit(1);
});
