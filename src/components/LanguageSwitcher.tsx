import { useEffect, useSyncExternalStore } from "react";
import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_LANGUAGES, languageStore, type LanguageCode } from "@/lib/language-store";
import { applyGoogleTranslate, loadGoogleTranslate } from "@/lib/google-translate";

export function LanguageSwitcher({ className }: { className?: string }) {
  const language = useSyncExternalStore(languageStore.subscribe, languageStore.getState, () => "en" as const);

  useEffect(() => {
    loadGoogleTranslate();
  }, []);

  const handleChange = (value: string) => {
    const code = value as LanguageCode;
    languageStore.setLanguage(code);
    applyGoogleTranslate(code);
  };

  return (
    <Select value={language} onValueChange={handleChange}>
      <SelectTrigger aria-label="Select language" className={className}>
        <Globe className="size-3.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
