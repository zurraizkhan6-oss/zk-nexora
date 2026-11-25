export interface ContactValues {
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

export const budgetOptions = [
  "Prefer to discuss",
  "Small / starter scope",
  "Mid-size scope",
  "Large / ongoing scope",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(v: ContactValues): ContactErrors {
  const e: ContactErrors = {};
  const name = v.name.trim();
  const email = v.email.trim();
  const message = v.message.trim();

  if (name.length < 2) e.name = "Please enter your full name.";
  else if (name.length > 100) e.name = "Name is too long (max 100 characters).";

  if (!email) e.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(email) || email.length > 254) e.email = "Please enter a valid email address.";

  if (v.company.trim().length > 120) e.company = "Company name is too long (max 120 characters).";

  if (!v.service) e.service = "Please choose a service.";

  if (message.length < 20) e.message = "Please share a few more details (at least 20 characters).";
  else if (message.length > 3000) e.message = "Message is too long (max 3000 characters).";

  return e;
}
