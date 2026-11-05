export const ROUTES = {
  guide: { path: '/discovery/guide', label: 'Guide Me', short: 'Guide Me' },
  describe: { path: '/discovery/describe', label: 'I’ll Tell You What I Need', short: 'Tell Us' },
  talk: { path: '/discovery/talk', label: 'Let’s Talk', short: 'Let’s Talk' },
};

export const FLEET_SIZES = ['1-4', '5-24', '25-99', '100-499', '500+'];
export const TIMINGS = ['Immediately', 'Within 30 days', '1-3 months', '3+ months', 'Just exploring'];
export const INSTALLATION = [
  'Mentioned in my notes',
  'Please coordinate installation',
  'We have our own installer',
  'No installation needed',
];

const isVisible = (question, answers) => {
  if (!question.showIf) return true;
  const value = answers[question.showIf.question]?.value;
  return [].concat(value ?? []).some((v) => question.showIf.anyOf.includes(v));
};

// Core + adaptive questions (capped at maxQuestions), an optional "tell us more" offer,
// the extended questions when accepted, then contact and review.
export function buildGuideSteps(library, answers, extended) {
  const base = library.questions
    .filter((q) => q.tier !== 'extended' && isVisible(q, answers))
    .slice(0, library.maxQuestions)
    .map((question) => ({ type: 'question', question }));

  const more = extended
    ? library.questions.filter((q) => q.tier === 'extended').map((question) => ({ type: 'question', question }))
    : [{ type: 'offer' }];

  return [...base, ...more, { type: 'contact' }, { type: 'review' }];
}

export function visibleAnswers(library, answers, extended) {
  const ids = new Set(
    buildGuideSteps(library, answers, extended)
      .filter((s) => s.type === 'question')
      .map((s) => s.question.id)
  );
  return Object.fromEntries(Object.entries(answers).filter(([id]) => ids.has(id)));
}

export function formatAnswer(answer) {
  if (!answer) return null;
  if (answer.status === 'unsure') return 'Not sure yet';
  if (answer.status === 'skipped') return 'Skipped';
  return Array.isArray(answer.value) ? answer.value.join(', ') : answer.value;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[0-9+().\-\s]{7,25}$/;

export function validateContact(contact) {
  const errors = {};
  if (!contact.name?.trim()) errors.name = 'Please tell us your name.';
  if (contact.email && !EMAIL.test(contact.email.trim())) errors.email = 'Enter a valid email address.';
  if (contact.phone && !PHONE.test(contact.phone.trim())) errors.phone = 'Enter a valid phone number.';
  if (!contact.email?.trim() && !contact.phone?.trim()) {
    errors.email = errors.email || 'Add an email or phone number so we can reach you.';
  }
  return errors;
}
