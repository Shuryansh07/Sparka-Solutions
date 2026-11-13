import 'dotenv/config';

const zoho = {
  leadSource: process.env.ZOHO_LEAD_SOURCE || 'Website',
  // Zoho CRM Web-to-Lead form: the hidden xnQsjsdp / xmIwtLD values from the generated form code.
  webform: {
    url: process.env.ZOHO_WEBFORM_URL || 'https://crm.zoho.com/crm/WebToLeadForm',
    xnQsjsdp: process.env.ZOHO_WEBFORM_XNQSJSDP || '',
    xmIwtLD: process.env.ZOHO_WEBFORM_XMIWTLD || '',
    returnUrl: process.env.ZOHO_WEBFORM_RETURN_URL || 'https://sparka-solution.onslate.com/',
  },
};

// The assistant is on only when explicitly configured: an OpenAI key and a model ID.
export function chatConfig(env) {
  const apiKey = env.OPENAI_API_KEY || '';
  const model = env.CHAT_MODEL || '';
  return {
    apiKey,
    model,
    enabled: env.CHAT_ENABLED !== 'false' && Boolean(apiKey && model),
    // Reasoning models need their encrypted reasoning passed back when store is false.
    // Set CHAT_ENCRYPTED_REASONING=false if the chosen model rejects it.
    encryptedReasoning: env.CHAT_ENCRYPTED_REASONING !== 'false',
  };
}

export const config = {
  chat: chatConfig(process.env),
  // AppSail injects X_ZOHO_CATALYST_LISTEN_PORT; PORT is the local fallback.
  port: Number(process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || 9000),
  env: process.env.NODE_ENV || 'development',
  storeDriver: process.env.STORE_DRIVER || 'memory',
  draftTtlDays: Number(process.env.DRAFT_TTL_DAYS || 30),
  adminApiKey: process.env.ADMIN_API_KEY || '',
  zoho,
  crmEnabled: Boolean(zoho.webform.xnQsjsdp && zoho.webform.xmIwtLD),
};
