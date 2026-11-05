import axios from 'axios';
import { config } from '../../config/index.js';

const { zoho } = config;
const accountsUrl = `https://accounts.zoho.${zoho.dc}/oauth/v2/token`;
const crm = axios.create({ baseURL: `https://www.zohoapis.${zoho.dc}/crm/v8`, timeout: 15000 });

let cachedToken = null;

async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const { data } = await axios.post(accountsUrl, null, {
    params: {
      refresh_token: zoho.refreshToken,
      client_id: zoho.clientId,
      client_secret: zoho.clientSecret,
      grant_type: 'refresh_token',
    },
    timeout: 15000,
  });
  if (!data.access_token) throw new Error(`Zoho OAuth failed: ${data.error || 'no access_token'}`);
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 };
  return cachedToken.value;
}

async function call(method, url, body) {
  const token = await accessToken();
  const { data } = await crm.request({
    method,
    url,
    data: body,
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  const result = data?.data?.[0];
  if (result && result.status !== 'success') {
    throw new Error(`Zoho CRM ${url}: ${result.code} ${result.message}`);
  }
  return result?.details;
}

function splitName(full) {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { First_Name: '', Last_Name: parts[0] };
  return { First_Name: parts.slice(0, -1).join(' '), Last_Name: parts.at(-1) };
}

function dueDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const ROUTE_LABEL = { guide: 'Guide Me', describe: "I'll Tell You What I Need", talk: "Let's Talk" };

export async function syncSubmissionToCrm(submission) {
  if (!config.crmEnabled) return { status: 'skipped', leadId: null, error: null };

  try {
    const { contact } = submission;
    const leadBody = {
      data: [
        {
          ...splitName(contact.name),
          Company: contact.company || `${contact.name} (individual)`,
          Email: contact.email || undefined,
          Phone: contact.phone || undefined,
          Lead_Source: zoho.leadSource,
          Description: `Sparka Discovery ${submission.reference} via ${ROUTE_LABEL[submission.route]}`,
        },
      ],
      ...(zoho.leadAssignmentRuleId ? { lar_id: zoho.leadAssignmentRuleId } : {}),
      trigger: ['workflow', 'approval'],
    };
    const lead = await call('post', '/Leads', leadBody);

    await call('post', `/Leads/${lead.id}/Notes`, {
      data: [
        {
          Note_Title: `Discovery ${submission.reference} - ${ROUTE_LABEL[submission.route]}`,
          Note_Content: submission.heard.join('\n'),
        },
      ],
    });

    await call('post', '/Tasks', {
      data: [
        {
          Subject:
            submission.route === 'talk'
              ? `Consultation request ${submission.reference}: contact customer`
              : `Discovery ${submission.reference}: call customer to recap before any estimate`,
          Due_Date: dueDate(zoho.taskDueDays),
          Priority: 'High',
          What_Id: { id: lead.id },
          $se_module: 'Leads',
        },
      ],
    });

    return { status: 'synced', leadId: lead.id, error: null };
  } catch (err) {
    const message = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    console.error(`[crm] sync failed for ${submission.reference}: ${message}`);
    return { status: 'failed', leadId: null, error: message.slice(0, 2000) };
  }
}
