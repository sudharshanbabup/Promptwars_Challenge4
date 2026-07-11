import { test } from 'node:test';
import assert from 'node:assert';
import { I18N_DATA } from '../../src/config/languages.ts';

/**
 * i18n key-parity check.
 * This test acts as a STRICT safety gate to prevent partial translation rollouts
 * for life-critical guidelines.
 */
test('i18n parity safety gate check', () => {
  const englishActionIds = Object.keys(I18N_DATA.en.actions).sort();
  const englishKitSize = I18N_DATA.en.kit.length;

  for (const lang of Object.keys(I18N_DATA)) {
    const langData = I18N_DATA[lang as keyof typeof I18N_DATA];

    // 1. Assert root structural keys match English exactly
    assert.deepStrictEqual(
      Object.keys(langData).sort(),
      Object.keys(I18N_DATA.en).sort(),
      `Language [${lang}] structural keys do not match English`
    );

    // 2. Assert every pre-translated Action ID exists in the language
    const langActionIds = Object.keys(langData.actions).sort();
    assert.deepStrictEqual(
      langActionIds,
      englishActionIds,
      `Language [${lang}] action keys do not match English actions`
    );

    // 3. Assert the localized actions are fully filled
    for (const actId of englishActionIds) {
      const act = langData.actions[actId];
      assert.ok(act.title, `Missing action title for [${actId}] in [${lang}]`);
      assert.ok(act.why, `Missing action explanation for [${actId}] in [${lang}]`);
      assert.ok(act.howLong, `Missing action duration for [${actId}] in [${lang}]`);
    }

    // 4. Assert the kit count matches
    assert.strictEqual(
      langData.kit.length,
      englishKitSize,
      `Language [${lang}] emergency kit list size does not match English`
    );

    // 5. Assert kit fields are fully filled
    for (let i = 0; i < englishKitSize; i++) {
      const item = langData.kit[i];
      assert.ok(item.item, `Missing kit item name at index [${i}] in [${lang}]`);
      assert.ok(item.quantity, `Missing kit quantity at index [${i}] in [${lang}]`);
      assert.ok(item.note, `Missing kit note at index [${i}] in [${lang}]`);
    }

    // 6. Assert doNot recommendations exist
    assert.ok(langData.doNots.length > 0, `Missing doNot list in [${lang}]`);
  }
});
