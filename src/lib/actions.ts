export interface ContactPrefill {
  service?: string;
  plan?: string;
}

const EVENT = "nexora:prefill-contact";

/** Scroll to the contact section and (optionally) pre-fill the form. */
export function goToContact(prefill?: ContactPrefill) {
  if (prefill) window.dispatchEvent(new CustomEvent<ContactPrefill>(EVENT, { detail: prefill }));
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
}

export function onContactPrefill(cb: (p: ContactPrefill) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<ContactPrefill>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
