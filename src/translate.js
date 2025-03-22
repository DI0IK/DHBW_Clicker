// Speichert alle Strings die in der UI angezeigt werden, verwendet in TINF24B1
const translationsB1 = {
  'label.items': 'Gesammelte ECTS: {count}',
  'button.buy-item': 'Studieren (ECTS Sammeln)',
  'label.price': 'Preis: {count}',
  'label.amount': 'Im Besitz: {count} ECTS',
  'button.buy-helper': 'Kaufen: {name}',

  /**
   * Folgende properties müssen 1:1 dem key der generatoren aus der gameData.js entsprechen!
   */
  'freudenmann': 'Prof. Dr. Freudenmann',
  'roethig': 'Prof. Dr. Röthig',
};

// Speichert alle Strings die in der UI angezeigt werden, verwendet in TINF24B6
const translationsB6 = {
  'label.items': 'Gesammelte Stifte: {count}',
  'button.buy-item': 'Stifte sammeln',
  'label.price': 'Preis: {count} Stifte',
  'label.amount': 'Im Besitz: {count}',
  'button.buy-helper': 'Kaufen: {name}',

  /**
   * Folgende properties müssen 1:1 dem key der generatoren aus der gameData.js entsprechen!
   */
  'freudenmann': 'Prof. Dr. Freudenmann',
  'roethig': 'Prof. Dr. Röthig',
}

const translations = translationsB6;

/**
 * 
 * @param {string} key Der Übersetzungs-Schlüssel, muss dem Namen eines keys aus translations entsprechen
 * @param {Object} options Wenn im zu übersetztenden String ein Wert in geschweiften Klammern steht, kann dieser mit Optionen zum eigentlichen Wert konvertiert werden
 * @returns 
 */
export const t = (key, options) => {
  let translated = translations[key];

  // Ein Fallback, wenn die Überseztung nicht existiert
  if (key === undefined || translated === undefined) {
    return `<<${key}>>`;
  }

  /**
   * Wenn es eine Übersetzung mit geschweiften klammern gibt (z.B. "{count}")
   * kann dieser Wert mit dem gleichen Wert aus dem options-Objekt ersetzt werden 
   * ```
   * {
   *  count: 5
   * }
   * ```
   */
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      translated = translated.replaceAll(`{${key}}`, value);
    });
  }

  return translated;
};