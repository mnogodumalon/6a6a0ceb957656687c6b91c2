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
    ausstattung: [{ key: "klavier", label: "Klavier" }, { key: "fluegel", label: "Flügel" }, { key: "schlagzeug", label: "Schlagzeug" }, { key: "gitarrenverstaerker", label: "Gitarrenverstärker" }, { key: "pa_anlage", label: "PA-Anlage" }, { key: "whiteboard", label: "Whiteboard" }, { key: "spiegel", label: "Spiegel" }, { key: "tonstudio", label: "Tonstudio-Ausstattung" }],
  },
  'dozenten': {
    fachbereiche: [{ key: "klavier", label: "Klavier" }, { key: "gitarre", label: "Gitarre" }, { key: "schlagzeug", label: "Schlagzeug" }, { key: "violine", label: "Violine" }, { key: "cello", label: "Cello" }, { key: "querfloete", label: "Querflöte" }, { key: "saxophon", label: "Saxophon" }, { key: "trompete", label: "Trompete" }, { key: "gesang", label: "Gesang" }, { key: "musiktheorie", label: "Musiktheorie" }, { key: "komposition", label: "Komposition" }, { key: "sonstiges", label: "Sonstiges" }],
    beschaeftigungsart: [{ key: "festangestellt", label: "Festangestellt" }, { key: "honorar", label: "Honorarbasis" }, { key: "ehrenamtlich", label: "Ehrenamtlich" }],
  },
  'kurse_&_workshops': {
    kurstyp: [{ key: "kurs", label: "Kurs" }, { key: "workshop", label: "Workshop" }],
    niveau: [{ key: "anfaenger", label: "Anfänger" }, { key: "fortgeschrittene", label: "Fortgeschrittene" }, { key: "experten", label: "Experten" }, { key: "alle_niveaus", label: "Alle Niveaus" }],
    status_kurs: [{ key: "aktiv", label: "Aktiv" }, { key: "inaktiv", label: "Inaktiv" }, { key: "abgeschlossen", label: "Abgeschlossen" }, { key: "geplant", label: "Geplant" }],
  },
  'anmeldungen': {
    status_anmeldung: [{ key: "angemeldet", label: "Angemeldet" }, { key: "warteliste", label: "Warteliste" }, { key: "storniert", label: "Storniert" }, { key: "abgeschlossen", label: "Abgeschlossen" }],
  },
  'zahlungen': {
    zahlungsart: [{ key: "bar", label: "Barzahlung" }, { key: "ueberweisung", label: "Überweisung" }, { key: "sepa", label: "SEPA-Lastschrift" }, { key: "online", label: "Online-Zahlung" }, { key: "sonstiges", label: "Sonstiges" }],
    zahlungsstatus: [{ key: "offen", label: "Offen" }, { key: "bezahlt", label: "Bezahlt" }, { key: "teilbezahlt", label: "Teilbezahlt" }, { key: "erstattet", label: "Erstattet" }],
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
  'kurse_&_workshops': {
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