/**
 * Enthält alle Generatoren (Helper).
 * Jeder Wert entspricht einem eigenen Helfer, der dahinter liegende Wert ist ein Array aus 3 Elementen:
 * [BasisPreis, PreisMultiplikator, ResourcenProSekunde].
 * 
 * Wenn neue helper angelegt werden, muss der key auch in der translate.js (im jeweiligen Übersetzungs-Objekt) gepflegt werden!
 * Beispiel:
 * Ein neuer Eintrag "ergin: [500, 1.5, 2]" -> der key "ergin" muss im Übersetzungs-Objekt gepflegt werden!
 */
export const generators = {
  freudenmann: [15, 2, 0.2],
  roethig: [100, 3, 0.1],
};