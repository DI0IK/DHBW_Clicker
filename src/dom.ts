type TagMap = {
  "p": HTMLParagraphElement;
  "button": HTMLButtonElement;
  "div": HTMLDivElement;
}

/**
 * Ein Helper um ein Dom-Element zur erstellen und optional mit Attributen zu versehen sowie einen Text.
 * class ist ein spezielles keyword, bitte verwende "className" als Ersatz!
 * 
 * @param {string} tagName Ein string wie "div", "p", oder "button"; Muss ein valides HTML-Element-Tag-Name sein
 * @param {Object} options HTML-Valide Attribute die dem erzeugten Element angehaftet werden soll
 * @param {string} innerText Text der im Element angezeigt werden soll
 * @returns Ein HTML-Element
 */
export const dom = <T extends keyof TagMap>(tagName: T, options?: {[key: string]: unknown} & {className?: string | string[]} & {[key in keyof TagMap[T]]?: TagMap[T][key]}, innerText: string = ""): TagMap[T] => {
  const tag = document.createElement(tagName) as TagMap[T];

  for (const prop in options) {
    switch (prop) {
      // class (classNames) sind etwas speziell wegen der classList, deswegen hier ein special handling
      case 'className':
        if(!options[prop]) continue;
        if (Array.isArray(options[prop])) {
          options[prop].forEach((c) => tag.classList.add(c));
        } else {
          tag.classList.add(options[prop]);
        }
        break;
      default:
        // @ts-ignore
        tag[prop] = options[prop];
        break;
    }
  }
  
  if (innerText) {
    tag.innerText = innerText;
  }

  return tag;
};

/**
 * Ein Wrapper für `document.querySelectorAll`, konvertiert das Ergebnis in ein Array
 * @param {string} query Ein HTML-Query-String
 * @returns Ein Array aus gefundenen HTML-Objekten
 */
export const $ = (query: string): Element[] => {
  const results = document.querySelectorAll(query);

  return Array.from(results);
};