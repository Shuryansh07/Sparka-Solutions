import { cleanContact, cleanText, CONTACT_METHODS } from '../../core/validation.js';
import { createSubmission } from '../submissions/submission.service.js';
import { library } from '../discovery/discovery.service.js';

// "Let's Talk" deliberately has no mandatory intake beyond a way to reach the customer.
export async function requestConsultation(repo, body = {}) {
  const contact = cleanContact(body.contact);
  const method = CONTACT_METHODS.includes(body.method) ? body.method : contact.preferredContact || 'phone';

  return createSubmission(
    repo,
    {
      route: 'talk',
      contact,
      talk: { method, topic: cleanText(body.topic, 2000) },
    },
    library
  );
}
