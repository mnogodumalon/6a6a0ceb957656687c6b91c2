import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Raeume {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    raumname?: string;
    raumnummer?: string;
    etage?: string;
    kapazitaet?: number;
    ausstattung?: LookupValue[];
    bemerkungen_raum?: string;
    verfuegbar?: boolean;
  };
}

export interface Dozenten {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
    fachbereiche?: LookupValue[];
    qualifikationen?: string;
    beschaeftigungsart?: LookupValue;
    eintrittsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    bemerkungen_dozent?: string;
  };
}

export interface KurseWorkshops {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    kurstyp?: LookupValue;
    beschreibung?: string;
    niveau?: LookupValue;
    dozent?: string; // applookup -> URL zu 'Dozenten' Record
    raum?: string; // applookup -> URL zu 'Raeume' Record
    startdatum?: string; // Format: YYYY-MM-DD oder ISO String
    enddatum?: string; // Format: YYYY-MM-DD oder ISO String
    wochentag_uhrzeit?: string;
    max_teilnehmer?: number;
    preis?: number;
    status_kurs?: LookupValue;
  };
}

export interface Teilnehmer {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorname?: string;
    nachname?: string;
    geburtsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    email?: string;
    telefon?: string;
    strasse?: string;
    hausnummer?: string;
    plz?: string;
    ort?: string;
    notfall_name?: string;
    notfall_telefon?: string;
    anmerkungen_tn?: string;
  };
}

export interface Anmeldungen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    teilnehmer?: string; // applookup -> URL zu 'Teilnehmer' Record
    kurs?: string; // applookup -> URL zu 'KurseWorkshops' Record
    anmeldedatum?: string; // Format: YYYY-MM-DD oder ISO String
    status_anmeldung?: LookupValue;
    bemerkungen_anmeldung?: string;
  };
}

export interface Zahlungen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    anmeldung?: string; // applookup -> URL zu 'Anmeldungen' Record
    rechnungsnummer?: string;
    betrag?: number;
    zahlungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    zahlungsart?: LookupValue;
    zahlungsstatus?: LookupValue;
    notizen_zahlung?: string;
  };
}

export const APP_IDS = {
  RAEUME: '6a6a0ca8e3736b7a5c581657',
  DOZENTEN: '6a6a0cb013ab9e80942e9817',
  KURSE_WORKSHOPS: '6a6a0cb08d1285a04aa4e88c',
  TEILNEHMER: '6a6a0cb1f1c0b7d0440968a3',
  ANMELDUNGEN: '6a6a0cb2292399dd41d4e869',
  ZAHLUNGEN: '6a6a0cb2f122eb1304c1b8ca',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'raeume': {
    ausstattung: [{ key: "klavier", get label() { return lookupLabel('raeume', 'ausstattung', "klavier") ?? "Klavier"; } }, { key: "fluegel", get label() { return lookupLabel('raeume', 'ausstattung', "fluegel") ?? "Flügel"; } }, { key: "schlagzeug", get label() { return lookupLabel('raeume', 'ausstattung', "schlagzeug") ?? "Schlagzeug"; } }, { key: "gitarrenverstaerker", get label() { return lookupLabel('raeume', 'ausstattung', "gitarrenverstaerker") ?? "Gitarrenverstärker"; } }, { key: "pa_anlage", get label() { return lookupLabel('raeume', 'ausstattung', "pa_anlage") ?? "PA-Anlage"; } }, { key: "whiteboard", get label() { return lookupLabel('raeume', 'ausstattung', "whiteboard") ?? "Whiteboard"; } }, { key: "spiegel", get label() { return lookupLabel('raeume', 'ausstattung', "spiegel") ?? "Spiegel"; } }, { key: "tonstudio", get label() { return lookupLabel('raeume', 'ausstattung', "tonstudio") ?? "Tonstudio-Ausstattung"; } }],
  },
  'dozenten': {
    fachbereiche: [{ key: "klavier", get label() { return lookupLabel('dozenten', 'fachbereiche', "klavier") ?? "Klavier"; } }, { key: "gitarre", get label() { return lookupLabel('dozenten', 'fachbereiche', "gitarre") ?? "Gitarre"; } }, { key: "schlagzeug", get label() { return lookupLabel('dozenten', 'fachbereiche', "schlagzeug") ?? "Schlagzeug"; } }, { key: "violine", get label() { return lookupLabel('dozenten', 'fachbereiche', "violine") ?? "Violine"; } }, { key: "cello", get label() { return lookupLabel('dozenten', 'fachbereiche', "cello") ?? "Cello"; } }, { key: "querfloete", get label() { return lookupLabel('dozenten', 'fachbereiche', "querfloete") ?? "Querflöte"; } }, { key: "saxophon", get label() { return lookupLabel('dozenten', 'fachbereiche', "saxophon") ?? "Saxophon"; } }, { key: "trompete", get label() { return lookupLabel('dozenten', 'fachbereiche', "trompete") ?? "Trompete"; } }, { key: "gesang", get label() { return lookupLabel('dozenten', 'fachbereiche', "gesang") ?? "Gesang"; } }, { key: "musiktheorie", get label() { return lookupLabel('dozenten', 'fachbereiche', "musiktheorie") ?? "Musiktheorie"; } }, { key: "komposition", get label() { return lookupLabel('dozenten', 'fachbereiche', "komposition") ?? "Komposition"; } }, { key: "sonstiges", get label() { return lookupLabel('dozenten', 'fachbereiche', "sonstiges") ?? "Sonstiges"; } }],
    beschaeftigungsart: [{ key: "festangestellt", get label() { return lookupLabel('dozenten', 'beschaeftigungsart', "festangestellt") ?? "Festangestellt"; } }, { key: "honorar", get label() { return lookupLabel('dozenten', 'beschaeftigungsart', "honorar") ?? "Honorarbasis"; } }, { key: "ehrenamtlich", get label() { return lookupLabel('dozenten', 'beschaeftigungsart', "ehrenamtlich") ?? "Ehrenamtlich"; } }],
  },
  'kurse_workshops': {
    kurstyp: [{ key: "kurs", get label() { return lookupLabel('kurse_workshops', 'kurstyp', "kurs") ?? "Kurs"; } }, { key: "workshop", get label() { return lookupLabel('kurse_workshops', 'kurstyp', "workshop") ?? "Workshop"; } }],
    niveau: [{ key: "anfaenger", get label() { return lookupLabel('kurse_workshops', 'niveau', "anfaenger") ?? "Anfänger"; } }, { key: "fortgeschrittene", get label() { return lookupLabel('kurse_workshops', 'niveau', "fortgeschrittene") ?? "Fortgeschrittene"; } }, { key: "experten", get label() { return lookupLabel('kurse_workshops', 'niveau', "experten") ?? "Experten"; } }, { key: "alle_niveaus", get label() { return lookupLabel('kurse_workshops', 'niveau', "alle_niveaus") ?? "Alle Niveaus"; } }],
    status_kurs: [{ key: "aktiv", get label() { return lookupLabel('kurse_workshops', 'status_kurs', "aktiv") ?? "Aktiv"; } }, { key: "inaktiv", get label() { return lookupLabel('kurse_workshops', 'status_kurs', "inaktiv") ?? "Inaktiv"; } }, { key: "abgeschlossen", get label() { return lookupLabel('kurse_workshops', 'status_kurs', "abgeschlossen") ?? "Abgeschlossen"; } }, { key: "geplant", get label() { return lookupLabel('kurse_workshops', 'status_kurs', "geplant") ?? "Geplant"; } }],
  },
  'anmeldungen': {
    status_anmeldung: [{ key: "angemeldet", get label() { return lookupLabel('anmeldungen', 'status_anmeldung', "angemeldet") ?? "Angemeldet"; } }, { key: "warteliste", get label() { return lookupLabel('anmeldungen', 'status_anmeldung', "warteliste") ?? "Warteliste"; } }, { key: "storniert", get label() { return lookupLabel('anmeldungen', 'status_anmeldung', "storniert") ?? "Storniert"; } }, { key: "abgeschlossen", get label() { return lookupLabel('anmeldungen', 'status_anmeldung', "abgeschlossen") ?? "Abgeschlossen"; } }],
  },
  'zahlungen': {
    zahlungsart: [{ key: "bar", get label() { return lookupLabel('zahlungen', 'zahlungsart', "bar") ?? "Barzahlung"; } }, { key: "ueberweisung", get label() { return lookupLabel('zahlungen', 'zahlungsart', "ueberweisung") ?? "Überweisung"; } }, { key: "sepa", get label() { return lookupLabel('zahlungen', 'zahlungsart', "sepa") ?? "SEPA-Lastschrift"; } }, { key: "online", get label() { return lookupLabel('zahlungen', 'zahlungsart', "online") ?? "Online-Zahlung"; } }, { key: "sonstiges", get label() { return lookupLabel('zahlungen', 'zahlungsart', "sonstiges") ?? "Sonstiges"; } }],
    zahlungsstatus: [{ key: "offen", get label() { return lookupLabel('zahlungen', 'zahlungsstatus', "offen") ?? "Offen"; } }, { key: "bezahlt", get label() { return lookupLabel('zahlungen', 'zahlungsstatus', "bezahlt") ?? "Bezahlt"; } }, { key: "teilbezahlt", get label() { return lookupLabel('zahlungen', 'zahlungsstatus', "teilbezahlt") ?? "Teilbezahlt"; } }, { key: "erstattet", get label() { return lookupLabel('zahlungen', 'zahlungsstatus', "erstattet") ?? "Erstattet"; } }],
  },
};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'raeume': {
    'raumname': 'string/text',
    'raumnummer': 'string/text',
    'etage': 'string/text',
    'kapazitaet': 'number',
    'ausstattung': 'multiplelookup/checkbox',
    'bemerkungen_raum': 'string/textarea',
    'verfuegbar': 'bool',
  },
  'dozenten': {
    'vorname': 'string/text',
    'nachname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'fachbereiche': 'multiplelookup/checkbox',
    'qualifikationen': 'string/textarea',
    'beschaeftigungsart': 'lookup/radio',
    'eintrittsdatum': 'date/date',
    'bemerkungen_dozent': 'string/textarea',
  },
  'kurse_workshops': {
    'titel': 'string/text',
    'kurstyp': 'lookup/radio',
    'beschreibung': 'string/textarea',
    'niveau': 'lookup/select',
    'dozent': 'applookup/select',
    'raum': 'applookup/select',
    'startdatum': 'date/datetimeminute',
    'enddatum': 'date/datetimeminute',
    'wochentag_uhrzeit': 'string/text',
    'max_teilnehmer': 'number',
    'preis': 'number',
    'status_kurs': 'lookup/radio',
  },
  'teilnehmer': {
    'vorname': 'string/text',
    'nachname': 'string/text',
    'geburtsdatum': 'date/date',
    'email': 'string/email',
    'telefon': 'string/tel',
    'strasse': 'string/text',
    'hausnummer': 'string/text',
    'plz': 'string/text',
    'ort': 'string/text',
    'notfall_name': 'string/text',
    'notfall_telefon': 'string/tel',
    'anmerkungen_tn': 'string/textarea',
  },
  'anmeldungen': {
    'teilnehmer': 'applookup/select',
    'kurs': 'applookup/select',
    'anmeldedatum': 'date/date',
    'status_anmeldung': 'lookup/radio',
    'bemerkungen_anmeldung': 'string/textarea',
  },
  'zahlungen': {
    'anmeldung': 'applookup/select',
    'rechnungsnummer': 'string/text',
    'betrag': 'number',
    'zahlungsdatum': 'date/date',
    'zahlungsart': 'lookup/select',
    'zahlungsstatus': 'lookup/radio',
    'notizen_zahlung': 'string/textarea',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

// Aliases for the pre-0.0.279 app keys (see 4c).
LOOKUP_OPTIONS['kurse_&_workshops'] = LOOKUP_OPTIONS['kurse_workshops'];
FIELD_TYPES['kurse_&_workshops'] = FIELD_TYPES['kurse_workshops'];

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateRaeume = StripLookup<Raeume['fields']>;
export type CreateDozenten = StripLookup<Dozenten['fields']>;
export type CreateKurseWorkshops = StripLookup<KurseWorkshops['fields']>;
export type CreateTeilnehmer = StripLookup<Teilnehmer['fields']>;
export type CreateAnmeldungen = StripLookup<Anmeldungen['fields']>;
export type CreateZahlungen = StripLookup<Zahlungen['fields']>;