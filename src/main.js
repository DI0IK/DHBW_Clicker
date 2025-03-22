import { dom, $ } from "./dom";
import { generators } from "./gameData";
import { t } from "./translate";

/**
 * Initialisiert das Grundgerüst unseres Spiels:
 * - Label
 * - Button zum sammeln
 * 
 * Diese Funktion führen wir auch sofort aus, könnte in der Theorie eine IIFE sein.
 * 
 * Zum bau verwende ich nun auch helfer-Funktionen (siehe "dom.js") 
 */
function initializeUi () {
  const root = document.getElementById('info');

  const label = dom('p', { id: 'items-counter' }, t('label.items', { count: 0 }));

  const button = dom('button', { id: 'buy-item' }, t('button.buy-item'));

  root.appendChild(label);
  root.appendChild(button);
};

// Basis-UI aufbauen
initializeUi();

/**
 * Diese Funktion generiert einen "Helper" (z.B. Professor in diesem Fall), der ein "Autocklicker" darstellen soll.
 * Er kümmert sich um seinen eigenen Inhalt (UI) und setzt Events ab, die einen Kauf darstellen soll.
 * Für mehr Informationen, siehe die einzelnen Kommentare der Funktionen!
 * 
 * @param {string} key Eindeutiger String zum identifizieren eines generators
 * @param {number} basePrice Basis-Preis für den ersten Kauf
 * @param {number} priceMultiplicator Multiplikator der auf den "aktuellen" Preis aufgeschlagen wird. Sorgt für einen Zinses-Zins-Effekt
 * @param {number} resourcesPerSecond Beschreibt wie viele "Einheiten" pro Sekunde gesammelt werden
 */
const generateProf = (key, basePrice, priceMultiplicator, resourcesPerSecond) => {
  // Stellt die aktuelle Menge dar
  let amount = 0;
  // Stellt den aktuellen Preis dar
  let currentPrice = basePrice;

  // Verknüpfung zu relevanten UI-Elementen
  const uiElements = {
    currentPriceLabel: null,
    currentAmountLabel: null,
  };

  /**
   * Ein "Kauf" eines Professors wird folgendermaßen realisiert:
   * 1. User klickt auf den Button zum kauf und diese Funktion wird ausgeführt (buy)
   * 2. "buy" erzeugt im Browser-Tab ein CustomEvent "check-buy" und sendet diesen ab
   * 3. Unsere Spiele-Engine prüft bei jedem "check-buy" ob genug ECTS/Stifte vorhanden sind
   * 4. Falls genügend "Ressourcen" vorhanden sind, werden diese abgezogen, und die Engine ruft "confirmBuy" des jeweiligen Professors auf.
   * 5. "confirmBuy", erhöht die Menge um 1, aktualisiert den Preis und die eigene UI
   */
  const buy = () => {
    /**
     * We want to ask the game, if this professor can be bought,
     * we send information: key and priceToBuy (price)
     */
    const event = new CustomEvent('check-buy', {
      detail: {
        key, // Damit die Engine weiß, welcher Professor gekauft werden soll
        price: currentPrice, // Zum Test, ob genügen Ressourcen zum kauf vorhanden sind
      }
    });

    document.dispatchEvent(event);
  };

  /**
   * Diese Funktion wird von der Spiele-Engine aufgerufen um einen "erfolgreichen" Kauf zu bestätigen.
   * Die Menge des Professors wird um 1 erhöht und der Preis angepasst.
   */
  const confirmBuy = () => {
    amount++;
    currentPrice = Math.ceil(priceMultiplicator * currentPrice);
    updateUi();
  };

  /**
   * Generiert die eigentliche UI für einen Professor...
   */
  const generateUi = () => {
    const profContainer = $('#professoren')[0];
    const root = dom('div', { className: 'prof' });

    const label = dom('p', {}, t(key));

    const currentAmountLabel = dom('p');
    uiElements.currentAmountLabel = currentAmountLabel;

    const currentPriceLabel = dom('p');
    uiElements.currentPriceLabel = currentPriceLabel;

    const buyButton = dom('button', {}, t('button.buy-helper', { name: t(key)}));
    buyButton.addEventListener('click', buy);

    updateUi();

    root.appendChild(label);
    root.appendChild(currentAmountLabel);
    root.appendChild(currentPriceLabel);
    root.appendChild(buyButton);

    profContainer.appendChild(root);
  };

  /**
   * Aktualisiert die notwendigen UI-Elemente des Professors
   */
  const updateUi = () => {
    uiElements.currentPriceLabel.innerHTML = t('label.price', { count: currentPrice });
    uiElements.currentAmountLabel.innerText = t('label.amount', { count: amount });
  }

  /**
   * Kalkuliert die Menge der "erwirtschafteten" Resource
   * 
   * @returns Die Menge der gesammelten Resource nach einer Sekunde
   */
  const getEctsSinceLastUpdate = () => {
    return amount * resourcesPerSecond;
  };

  /**
   * Diese Funktion wird beim Laden des Spiels mit einem gespeicherten Spielstand aufgerufen.
   * Sie setzt die gespeicherte Menge des jeweiligen Professors
   * @param {number} savedAmount Die gespeicherte Menge aus dem localStorage
   */
  const load = (savedAmount) => {
    // Wir erstellen uns ein Array der Länge "savedAmount" und rufen damit genauso-oft
    // die Kauf-Funktion auf, dies erhöht automatisch Menge und Kaufpreis des Professors
    new Array(savedAmount).fill(0).forEach(confirmBuy);

    // Die obige Herangehensweise, kann auch folgendermaßen gelöst werden:
    // (Für Fans von Loops)
    // for (let i = 0; i < savedAmount; i++) {
    //   confirmBuy();
    // }
  };

  /**
   * Eine Funktion zum Abfragen von Daten eines Professors die zum speichern benötigt wird.
   * @returns Ein Speicherbares Objekt mit allen notwendigen Informationen
   */
  const save = () => {
    return {
      key,
      amount,
    }
  };

  // Bevor die Funktion endet, initialisieren wir die UI
  generateUi();

  return {
    getEctsSinceLastUpdate,
    confirmBuy,
    save,
    load,
  }
};

/**
 * Die Kern-Logik unseres Spiels.
 * Sie orchestriert folgende Funktionen:
 * - Speichern & Laden
 * - Unsere Gespeicherte Menge an Resourcen
 * - "Helper" (Professoren)
 * - Die sogenannte "Game-Loop"
 */
const game = (function() {
  // Unsere Resourcen
  let items = 0;

  /* Unsere Helper,
   * wir generieren die Info aus der gameData.js (generators)
   * und bauen daraus ein Objekt mit folgender struktur:
   * {
   *  prof1: {ProfObjekt},
   *  prof2: {ProjObjekt}
   * }
   */
  const professoren = Object
    .entries(generators)
    .reduce((
      previous,
      [key, [basePrice, multiplicator, incomePerSecond]]
    ) => {
      return {
        ...previous,
        [key]: generateProf(key, basePrice, multiplicator, incomePerSecond),
      };
  }, {});

  const uiElements = {
    label: document.getElementById('items-counter'),
    button: document.getElementById('buy-item'),
  };

  function updateEctsLabel () {
    uiElements.label.innerText = t('label.items', { count: Math.floor(items)});
  }
  
  function increaseResource () {
    items += 1;
    updateEctsLabel();
  }

  // Diese Funktion wird beim "check-buy"-CustomEvent aufgerufen
  function buyProf (event) {
    const { detail } = event;
    // Prüfen ob es genügen resourcen gibt
    if (detail.price <= items) {
      // Abzug wenn genügend vorhanden ist
      items -= detail.price;
      // Mithilfe des "key" können wir im professoren-objekt den Kauf bestätigen
      professoren[detail.key].confirmBuy();
      // UI aktualisieren
      updateEctsLabel();
    } 
  }

  function doSomethingProf() {
    // Alle Professoren als Array
    const allProfessors = Object.values(professoren);
    // Wir fragen die Menge der gesammelten ECTS für jeden Prof ab
    const ectsPerProfessor = allProfessors.map((prof) => prof.getEctsSinceLastUpdate());
    // Wir zählen alle von den professoren gesammelten ECTS zusammen
    const tickEcts = ectsPerProfessor.reduce((prev, current) => prev + current, 0);

    items += tickEcts;
    updateEctsLabel();
  }

  function gameLoop () {
    doSomethingProf();
    updateEctsLabel();
  }

  // Funktion zum speichern des Spiels
  function saveGame() {
    // Daten zum speichern sammeln
    // Wir konvertieren das Professoren-Objekt in ein Array,
    // rufen für jeden Professor die .save()-Methode auf
    // und mappen dieses Ergebnis in ein neues Array
    const professorenToSave = Object.values(professoren)
      .map((prof) => prof.save());

    const toSave = {
      // Für die Zukunft: ein Versions-Flag
      // Sollte sich die Struktur des Speicherstandes ändern können wir beim laden darauf reagieren
      v: 1,
      items,
      professoren: professorenToSave,
    };

    // Aus Objekt string generieren für localStorage
    const stringified = JSON.stringify(toSave);

    // Im localStorage unter Eintrag "savedata" speichern
    localStorage.setItem('savedata', stringified);
  }

  /**
   * Lädt die gespeicherten Spieldaten
   */
  function loadGame() {
    // Daten aus Storage abholen
    const rawData = localStorage.getItem('savedata');

    // Rohe (string)-Daten in JSON-Objekt umwandeln
    const parsedData = JSON.parse(rawData);

    items = parsedData.items;
    // Wir laden jeden professor wieder
    parsedData.professoren.forEach((professor) => {
      professoren[professor.key]?.load(professor.amount);
    });

    updateEctsLabel();
  }

  // Verlinkt die UI-Elemente und startet auf das "check-buy"-Event zu hören
  function hookUi () {
    uiElements.button.addEventListener('click', increaseResource);

    document.addEventListener('check-buy', buyProf);
  }


  hookUi();

  try {
    loadGame();
  } catch (err) {
    console.log(err);
    console.log('This is a new game!?');
  }
  
  setInterval(gameLoop, 1000);
  setInterval(saveGame, 10000);
})();