export * from './config';
export * from './utils';
export * from './cookies';

// Exports des messages (chargement statique)
import enCommon from './messages/en/common.json';
import enLanding from './messages/en/landing.json';
import enAuth from './messages/en/auth.json';
import enAttendee from './messages/en/attendee.json';
import enOrganizer from './messages/en/organizer.json';

import frCommon from './messages/fr/common.json';
import frLanding from './messages/fr/landing.json';
import frAuth from './messages/fr/auth.json';
import frAttendee from './messages/fr/attendee.json';
import frOrganizer from './messages/fr/organizer.json';

import arCommon from './messages/ar/common.json';
import arLanding from './messages/ar/landing.json';
import arAuth from './messages/ar/auth.json';
import arAttendee from './messages/ar/attendee.json';
import arOrganizer from './messages/ar/organizer.json';

export const messages = {
  en: {
    common: enCommon,
    landing: enLanding,
    auth: enAuth,
    attendee: enAttendee,
    organizer: enOrganizer
  },
  fr: {
    common: frCommon,
    landing: frLanding,
    auth: frAuth,
    attendee: frAttendee,
    organizer: frOrganizer
  },
  ar: {
    common: arCommon,
    landing: arLanding,
    auth: arAuth,
    attendee: arAttendee,
    organizer: arOrganizer
  }
} as const;
