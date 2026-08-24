declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: {
          new (options: Record<string, unknown>, elementId: string): unknown;
          InlineLayout: { SIMPLE: unknown };
        };
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

let scriptLoaded = false;

/** Loads Google's website-translator widget once, into a hidden host element. */
export function loadGoogleTranslate() {
  if (typeof window === "undefined" || scriptLoaded) return;
  scriptLoaded = true;

  window.googleTranslateElementInit = () => {
    if (!window.google?.translate) return;
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: "en,hi,mr",
        autoDisplay: false,
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      "google_translate_element",
    );
  };

  const script = document.createElement("script");
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

/** Dashboards never translate (React's own re-renders fight the widget's DOM
 * rewrites there) — clear the cookie on entry so it can't carry over from a
 * translated public page and doesn't re-apply on a later reload. */
export function resetGoogleTranslate() {
  if (typeof window === "undefined") return;
  document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function setGoogTransCookie(targetLang: string) {
  const value = targetLang === "en" ? "" : `/en/${targetLang}`;
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;
}

/** Drives the (hidden) Google Translate widget to switch language in place, without a reload. */
export function applyGoogleTranslate(targetLang: string) {
  if (typeof window === "undefined") return;
  setGoogTransCookie(targetLang);

  const tryDrive = (attemptsLeft: number) => {
    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (combo) {
      combo.value = targetLang;
      combo.dispatchEvent(new Event("change"));
      return;
    }
    if (attemptsLeft <= 0) {
      window.location.reload();
      return;
    }
    setTimeout(() => tryDrive(attemptsLeft - 1), 300);
  };

  tryDrive(15);
}
