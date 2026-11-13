import axios from 'axios';
import { config } from '../../config/index.js';
import { buildLeadFields } from './lead-fields.js';
import { isWebformSuccess, toWebformBody } from './webform.js';

const { zoho } = config;

function splitName(full) {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { First_Name: '', Last_Name: parts[0] };
  return { First_Name: parts.slice(0, -1).join(' '), Last_Name: parts.at(-1) };
}

const ROUTE_LABEL = { guide: 'Guide Me', describe: "I'll Tell You What I Need", talk: "Let's Talk", chat: 'Chat Assistant' };

// Everything we know about the submission, keyed by Lead field API name.
// Only the fields present on the webform (see webform.js) are actually sent.
export function buildLeadRecord(submission) {
  const { contact } = submission;
  return {
    ...splitName(contact.name),
    Company: contact.company || `${contact.name} (individual)`,
    Email: contact.email || undefined,
    Phone: contact.phone || undefined,
    Lead_Source: zoho.leadSource,
    Description: `Sparka Discovery ${submission.reference} via ${ROUTE_LABEL[submission.route]}`,
    ...buildLeadFields(submission),
  };
}

// Creates the Lead through the Zoho Web-to-Lead form. The form does not return the new
// Lead's ID, so leadId stays null; the Lead can be found by Discovery Reference once that
// field is on the form.
export async function syncSubmissionToCrm(submission) {
  if (!config.crmEnabled) return { status: 'skipped', leadId: null, error: null };

  try {
    const body = toWebformBody(buildLeadRecord(submission), zoho.webform);
    const res = await axios.post(zoho.webform.url, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRedirects: 0,
      timeout: 15000,
      validateStatus: () => true,
    });
    if (!isWebformSuccess(res.status, res.data)) {
      throw new Error(`Zoho webform HTTP ${res.status}: ${String(res.data).slice(0, 500)}`);
    }
    return { status: 'synced', leadId: null, error: null };
  } catch (err) {
    console.error(`[crm] webform post failed for ${submission.reference}: ${err.message}`);
    return { status: 'failed', leadId: null, error: err.message.slice(0, 2000) };
  }
}
