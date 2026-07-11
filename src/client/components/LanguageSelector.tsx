import { LANGUAGES } from '../../config/languages.ts';
import { LanguageCode } from '../../domain/types.ts';

interface LanguageSelectorProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (code: LanguageCode) => void;
}

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
      <label htmlFor="lang-select" style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
        Select Language / ভাষা চয়ন করুন
      </label>
      <select
        id="lang-select"
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
        style={{
          width: '100%',
          backgroundColor: '#0f172a',
          borderColor: 'rgba(255,255,255,0.1)',
          color: '#f8fafc',
          cursor: 'pointer'
        }}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
