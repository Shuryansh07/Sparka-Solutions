import { HttpError } from './http-error.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[0-9+().\-\s]{7,25}$/;

export const CONTACT_METHODS = ['phone', 'email', 'video'];

export const cleanText = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

export function cleanContact(input = {}, { required = true } = {}) {
  const contact = {
    name: cleanText(input.name, 120),
    company: cleanText(input.company, 160),
    email: cleanText(input.email, 254).toLowerCase(),
    phone: cleanText(input.phone, 25),
    location: cleanText(input.location, 160),
    preferredContact: CONTACT_METHODS.includes(input.preferredContact) ? input.preferredContact : '',
    bestTime: cleanText(input.bestTime, 120),
  };

  const errors = {};
  if (contact.email && !EMAIL.test(contact.email)) errors.email = 'Enter a valid email address.';
  if (contact.phone && !PHONE.test(contact.phone)) errors.phone = 'Enter a valid phone number.';
  if (required) {
    if (!contact.name) errors.name = 'Please tell us your name.';
    if (!contact.email && !contact.phone) errors.email = 'Add an email or phone number so we can reach you.';
  }
  if (Object.keys(errors).length) throw new HttpError(422, 'Please check your contact details.', errors);
  return contact;
}
