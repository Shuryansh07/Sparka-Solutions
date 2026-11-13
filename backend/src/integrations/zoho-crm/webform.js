// Zoho CRM Web-to-Lead form ("Inquiry", webform 7673577000000834005).
// Zoho saves only the fields that were added to the webform in the CRM webform builder.
// When fields are added there, regenerate the form code and add each input's `name`
// attribute below, keyed by the Lead field API name produced in crm.service.js.
// Discovery_Submitted_At is not on the form (webform datetimes need Zoho's own format);
// the Lead's Created Time records when it arrived.
export const WEBFORM_FIELDS = {
  Company: 'Company',
  Last_Name: 'Last Name',
  First_Name: 'First Name',
  Email: 'Email',
  Phone: 'Phone',
  Lead_Source: 'Lead Source',
  Description: 'Description',
  Discovery_Reference: 'LEADCF1',
  Discovery_Path: 'LEADCF2',
  Fleet_Size: 'LEADCF3',
  Discovery_Status: 'LEADCF5',
  Vehicle_Types: 'LEADCF6',
  Areas_of_Interest: 'LEADCF7',
  Timing: 'LEADCF8',
  Installation_Preference: 'LEADCF9',
  Current_Solution: 'LEADCF10',
  Objective: 'LEADCF11',
  Customer_Narrative: 'LEADCF12',
  Heard_Summary: 'LEADCF13',
  Discovery_Answers_JSON: 'LEADCF14',
  Must_Haves_and_Constraints: 'LEADCF15',
  Budget_Range: 'LEADCF16',
  Vehicle_Location: 'LEADCF17',
  Preferred_Contact_Method: 'LEADCF18',
  Best_Time_To_Reach: 'LEADCF19',
  Research_Ready: 'LEADCF53',
  Contact_Consent: 'LEADCF56',
};

// Fixed inputs every Zoho webform post needs. actionType is base64 for "Leads";
// aG9uZXlwb3Q is Zoho's honeypot and must stay empty.
const FIXED = { actionType: 'TGVhZHM=', zc_gad: '', aG9uZXlwb3Q: '' };

// Turns a Lead record into the urlencoded body of the webform post.
export function toWebformBody(record, { xnQsjsdp, xmIwtLD, returnUrl }) {
  const body = new URLSearchParams({ xnQsjsdp, xmIwtLD, returnURL: returnUrl, ...FIXED });
  for (const [field, inputName] of Object.entries(WEBFORM_FIELDS)) {
    const value = record[field];
    if (value === undefined || value === null || value === '' || value === false) continue;
    if (Array.isArray(value)) value.forEach((v) => body.append(inputName, v)); // multi-select
    else body.append(inputName, value === true ? 'on' : String(value)); // checkbox / text
  }
  return body;
}

// On success Zoho answers 200 with a page that redirects to returnURL (or a 3xx redirect).
// Anything else (error page, captcha, 4xx/5xx) means the Lead was not created.
export function isWebformSuccess(status, html) {
  if (status >= 300 && status < 400) return true;
  return status === 200 && typeof html === 'string' && html.includes('window.location.assign');
}
