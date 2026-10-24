import { useAuth } from '@/hooks/useAuth';
import { TRANSLATIONS, TranslationKey } from '@/localization/translations';

export function useTranslation() {
  const { user } = useAuth();
  const language = user?.preferredLanguage || 'English';
  const selectedTranslation = language === 'Hindi' ? TRANSLATIONS.Hindi : TRANSLATIONS.English;

  return {
    language,
    isFullyTranslated: language === 'English' || language === 'Hindi',
    t: (key: TranslationKey) => selectedTranslation[key]
  };
}
