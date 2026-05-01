import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scrollToSection(sectionId: string) {
  const section = document.getElementById(sectionId);

  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  sessionStorage.setItem('scrollToSection', sectionId);
  window.location.assign('/');
}

export function scrollToHash(href: string) {
  if (!href.startsWith('#')) return false;

  const sectionId = href.slice(1);
  if (!sectionId) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  }

  scrollToSection(sectionId);
  return true;
}

export function scrollToContact() {
  scrollToSection('contact');
}
