import { RiskAssessment, LanguageCode } from './types.ts';
import { I18N_DATA, LocalizedStrings } from '../config/languages.ts';

/**
 * Builds a fallback risk response using deterministic static localized data.
 * Guarantees zero downtime and consistent translations in case of Gemini failures.
 * @param assessment The pre-calculated RiskAssessment.
 * @param language The user's target language.
 * @returns Fully formatted response matching the Gemini schema.
 */
export function buildDeterministicPlan(
  assessment: RiskAssessment,
  language: LanguageCode
): {
  summary: string;
  urgencyLine: string;
  actions: { title: string; why: string; howLong: string }[];
  kit: { item: string; quantity: string; note: string }[];
  doNots: string[];
  localisedRiskLabel: string;
} {
  // Gracefully fallback to English if the language is unsupported
  const i18n: LocalizedStrings = I18N_DATA[language] || I18N_DATA['en'];

  // Map the prioritized action list to the localized descriptions
  const actionsList = assessment.actions.map(action => {
    const localizedAction = i18n.actions[action.id] || I18N_DATA['en'].actions[action.id];
    return {
      title: localizedAction?.title || action.titleKey,
      why: localizedAction?.why || action.bodyKey,
      howLong: localizedAction?.howLong || `${action.timeToComplete_min} mins`
    };
  });

  return {
    summary: `${i18n.summary} (Deterministic Safety Mode. Level: ${assessment.level.toUpperCase()}, Score: ${assessment.score}/100)`,
    urgencyLine: i18n.urgencyLine,
    actions: actionsList,
    kit: i18n.kit,
    doNots: i18n.doNots,
    localisedRiskLabel: `${i18n.localisedRiskLabel}: ${assessment.level.toUpperCase()}`
  };
}
export default buildDeterministicPlan;
