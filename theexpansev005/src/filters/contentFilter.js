import pool from '../db/pool.js';

class ContentFilter {

async checkAccess(userId, contentKey, requiredLevel = 'FULL') {

try {

const userRole = await this.getUserRole(userId);

const contentExists = await this.getContentPermission(contentKey);

if (!contentExists) {

return {

allowed: false,

level: 'NONE',

reason: 'Content key not found in system'

};

}

if (!contentExists.is_enabled) {

return {

allowed: false,

level: 'NONE',

reason: 'Content is globally disabled'

};

}

const customAccess = await this.getUserCustomAccess(userId, contentKey);

if (customAccess) {

const allowed = this.validateAccessLevel(customAccess.access_level, requiredLevel);

await this.auditLog(userId, contentKey, 'VIEWED', allowed);

return {

allowed,

level: customAccess.access_level,

reason: customAccess.notes || `Custom access: ${customAccess.access_level}`

};

}

const roleAccess = this.getRoleDefaultAccess(userRole, contentKey);

const allowed = this.validateAccessLevel(roleAccess, requiredLevel);

await this.auditLog(userId, contentKey, allowed ? 'GRANTED' : 'DENIED', allowed);

return {

allowed,

level: roleAccess,

reason: `Role-based access (${userRole}): ${roleAccess}`

};

} catch (error) {

console.error('[ContentFilter] Access check error:', error);

return {

allowed: false,

level: 'NONE',

reason: 'System error checking permissions'

};

}

}

async getContentPermission(contentKey) {

const query = `

SELECT

permission_id,

content_key,

permission_type,

is_enabled,

description,

created_at

FROM content_permissions

WHERE content_key = $1

`;

const result = await pool.query(query, [contentKey]);

return result.rows[0] || null;

}

async getUserCustomAccess(userId, contentKey) {

const query = `

SELECT

uca.access_id,

uca.access_level,

uca.notes,

uca.granted_at,

uca.expires_at

FROM user_content_access uca

JOIN content_permissions cp ON uca.permission_id = cp.permission_id

WHERE uca.user_id = $1

AND cp.content_key = $2

AND (uca.expires_at IS NULL OR uca.expires_at > NOW())

ORDER BY uca.granted_at DESC

LIMIT 1

`;

const result = await pool.query(query, [userId, contentKey]);

return result.rows[0] || null;

}

async getUserRole(userId) {

const query = `SELECT role FROM users WHERE user_id = $1`;

const result = await pool.query(query, [userId]);

return result.rows[0]?.role || 'player';

}

getRoleDefaultAccess(role, contentKey) {

const defaults = {

'admin': 'ADMIN',

'moderator': 'FULL',

'sage': 'FULL',

'player': 'BASIC',

'guest': 'NONE'

};

const contentDefaults = {

'system_stats_user_counts': {

'admin': 'FULL',

'moderator': 'FULL',

'player': 'NONE',

'guest': 'NONE'

},

'debug_mode_access': {

'admin': 'FULL',

'moderator': 'BASIC',

'player': 'NONE',

'guest': 'NONE'

},

'pad_theory_basics': {

'admin': 'FULL',

'moderator': 'FULL',

'player': 'BASIC',

'guest': 'BASIC'

}

};

if (contentDefaults[contentKey]) {

return contentDefaults[contentKey][role] || 'NONE';

}

return defaults[role] || 'NONE';

}

validateAccessLevel(userLevel, requiredLevel) {

const hierarchy = { 'NONE': 0, 'BASIC': 1, 'FULL': 2, 'ADMIN': 3 };

return hierarchy[userLevel] >= hierarchy[requiredLevel];

}

async auditLog(userId, contentKey, action, allowed) {

try {

const query = `

INSERT INTO content_audit_log

(log_id, user_id, content_key, action, attempted_at, result)

VALUES

(gen_random_uuid(), $1, $2, $3, NOW(), $4)

`;

const result = allowed ? 'ALLOWED' : 'DENIED';

await pool.query(query, [userId, contentKey, action, result]);

} catch (error) {

console.error('[ContentFilter] Audit log error:', error);

}

}

}

export default new ContentFilter();
