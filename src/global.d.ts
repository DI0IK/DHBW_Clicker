import { GeneratorNames } from "./gameData";

interface CustomEventMap {
  "check-buy": CustomEvent<{
    price: number;
    key: GeneratorNames;
  }>;
}

declare global {
  interface Document {
    addEventListener<K extends keyof CustomEventMap>(type: K,
       listener: (this: Document, ev: CustomEventMap[K]) => void): void;
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): void;
  }
}

export { };