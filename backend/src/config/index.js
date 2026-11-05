import 'dotenv/config';

const list = (value) =>
  (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const zoho = {
  dc: process.env.ZOHO_DC || 'com',
  clientId: process.env.ZOHO_CLIENT_ID || '',
  clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
  refreshToken: process.env.ZOHO_REFRESH_TOKEN || '',
  leadAssignmentRuleId: process.env.ZOHO_LEAD_ASSIGNMENT_RULE_ID || '',
  leadSource: process.env.ZOHO_LEAD_SOURCE || 'Website',
  taskDueDays: Number(process.env.ZOHO_TASK_DUE_DAYS || 1),
};

export const config = {
  // AppSail injects X_ZOHO_CATALYST_LISTEN_PORT; PORT is the local fallback.
  port: Number(process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || 9000),
  env: process.env.NODE_ENV || 'development',
  corsOrigins: list(process.env.CORS_ORIGINS),
  storeDriver: process.env.STORE_DRIVER || 'memory',
  draftTtlDays: Number(process.env.DRAFT_TTL_DAYS || 30),
  adminApiKey: process.env.ADMIN_API_KEY || '',
  zoho,
  crmEnabled: Boolean(zoho.clientId && zoho.clientSecret && zoho.refreshToken),
};
