import { ID_TYPES } from '../types';

/**
 * primary ID Types - Also a required document. Serves as customer's first identification document type.
 * mandatory ID Types - Required for onboarding but not initially.
 * optional ID Types - Others/additional documents that customer may present before account opening.
 */

export type REQ = {
  [k: string]: {
    RE: { primary: ID_TYPES[]; mandatory: ID_TYPES[]; optional: ID_TYPES[] };
    NRE: { primary: ID_TYPES[]; mandatory: ID_TYPES[]; optional: ID_TYPES[] };
    FOREIGNER: {
      primary: ID_TYPES[];
      mandatory: ID_TYPES[];
      optional: ID_TYPES[];
    };
    REFUGEE: {
      primary: ID_TYPES[];
      mandatory: ID_TYPES[];
      optional: ID_TYPES[];
    };
    MINOR: {
      primary: ID_TYPES[];
      mandatory: ID_TYPES[];
      optional: ID_TYPES[];
    };
    FOR_REF_ID?: ID_TYPES;
  };
};

export const DOC_REQUIREMENTS: REQ = {
  KE: {
    RE: {
      primary: [ID_TYPES.NationalId, ID_TYPES.MaishaCard],
      mandatory: [],
      optional: [
        ID_TYPES.KenyanPassport,
        ID_TYPES.MilitaryServiceCard,
        ID_TYPES.DriversLicense,
      ],
    },
    NRE: {
      primary: [
        ID_TYPES.NationalId,
        ID_TYPES.MaishaCard,
        ID_TYPES.KenyanPassport,
      ],
      mandatory: [ID_TYPES.KenyanPassport],
      optional: [ID_TYPES.NationalId, ID_TYPES.KenyanPassport],
    },
    FOREIGNER: {
      primary: [ID_TYPES.ForeignPassport],
      mandatory: [ID_TYPES.ForeignPassport],
      optional: [ID_TYPES.ForeignId, ID_TYPES.WorkPermit],
    },
    REFUGEE: {
      primary: [ID_TYPES.RefugeeId],
      mandatory: [ID_TYPES.RefugeeId, ID_TYPES.UNHCRPROOF],
      optional: [],
    },
    MINOR: {
      primary: [],
      mandatory: [],
      optional: [ID_TYPES.BirthCertificate, ID_TYPES.MaishaCard],
    },
    FOR_REF_ID: ID_TYPES.RefugeeId,
  },
  UG: {
    RE: {
      primary: [ID_TYPES.NationalId],
      mandatory: [ID_TYPES.NationalId],
      optional: [ID_TYPES.Passport, ID_TYPES.DriversLicense, ID_TYPES.NSSFCard],
    },
    NRE: {
      primary: [ID_TYPES.NationalId],
      mandatory: [ID_TYPES.Passport, ID_TYPES.NationalId],
      optional: [
        ID_TYPES.DriversLicense,
        ID_TYPES.NSSFCard,
        ID_TYPES.WorkPermit,
      ],
    },
    FOREIGNER: {
      primary: [ID_TYPES.ForeignPassport],
      mandatory: [ID_TYPES.ForeignPassport],
      optional: [ID_TYPES.WorkPermit],
    },
    REFUGEE: {
      primary: [ID_TYPES.RefugeeId],
      mandatory: [ID_TYPES.RefugeeId],
      optional: [],
    },
    MINOR: {
      primary: [
        ID_TYPES.BirthCertificate,
        ID_TYPES.Passport,
        ID_TYPES.NotificationOfBirth,
      ],
      mandatory: [
        ID_TYPES.BirthCertificate,
        ID_TYPES.Passport,
        ID_TYPES.NotificationOfBirth,
      ],
      optional: [
        ID_TYPES.BirthCertificate,
        ID_TYPES.Passport,
        ID_TYPES.NotificationOfBirth,
      ],
    },
    FOR_REF_ID: ID_TYPES.RefugeeId,
  },
  TZ: {
    RE: {
      primary: [
        ID_TYPES.NationalId,
        ID_TYPES.ResidentId,
        ID_TYPES.DriversLicense,
        ID_TYPES.VotersCard,
        ID_TYPES.EmployeeId,
      ],
      mandatory: [],
      optional: [],
    },
    NRE: {
      primary: [
        ID_TYPES.NationalId,
        ID_TYPES.ResidentId,
        ID_TYPES.DriversLicense,
        ID_TYPES.VotersCard,
      ],
      mandatory: [ID_TYPES.Passport],
      optional: [ID_TYPES.DriversLicense, ID_TYPES.WorkPermit],
    },
    FOREIGNER: {
      primary: [ID_TYPES.ForeignPassport],
      mandatory: [],
      optional: [ID_TYPES.WorkPermit],
    },
    REFUGEE: {
      primary: [],
      mandatory: [],
      optional: [],
    },
    MINOR: {
      primary: [],
      mandatory: [],
      optional: [],
    },
  },
  RW: {
    RE: {
      primary: [ID_TYPES.NationalId],
      mandatory: [ID_TYPES.NationalId],
      optional: [ID_TYPES.DriversLicense, ID_TYPES.Passport],
    },
    NRE: {
      primary: [ID_TYPES.NationalId],
      mandatory: [ID_TYPES.NationalId, ID_TYPES.Passport],
      optional: [ID_TYPES.DriversLicense, ID_TYPES.WorkPermit],
    },
    FOREIGNER: {
      primary: [ID_TYPES.ForeignId, ID_TYPES.ForeignPassport],
      mandatory: [],
      optional: [
        ID_TYPES.ForeignId,
        ID_TYPES.ForeignPassport,
        ID_TYPES.WorkPermit,
      ],
    },
    REFUGEE: {
      primary: [ID_TYPES.RefugeeId],
      mandatory: [ID_TYPES.RefugeeId],
      optional: [],
    },
    MINOR: {
      primary: [],
      mandatory: [],
      optional: [],
    },
    FOR_REF_ID: ID_TYPES.RefugeeId,
  },
  CD: {
    RE: {
      primary: [
        ID_TYPES.NationalIdentification,
        ID_TYPES.DRCDriversLicense,
        ID_TYPES.DRCVotersCard,
        ID_TYPES.DRCPassport,
        ID_TYPES.MilitaryID,
        ID_TYPES.PoliceID,
        ID_TYPES.StudentID,
      ],
      mandatory: [],
      optional: [
        ID_TYPES.NationalIdentification,
        ID_TYPES.DRCDriversLicense,
        ID_TYPES.DRCVotersCard,
        ID_TYPES.DRCPassport,
        ID_TYPES.MilitaryID,
        ID_TYPES.PoliceID,
        ID_TYPES.StudentID,
      ],
    },
    NRE: {
      primary: [ID_TYPES.DRCForeignPassport, ID_TYPES.DRCRefugeeId],
      mandatory: [],
      optional: [],
    },
    FOREIGNER: {
      primary: [ID_TYPES.DRCForeignPassport, ID_TYPES.DRCRefugeeId],
      mandatory: [],
      optional: [],
    },
    REFUGEE: {
      primary: [],
      mandatory: [],
      optional: [],
    },
    MINOR: {
      primary: [],
      mandatory: [],
      optional: [],
    },
  },
  SS: {
    RE: {
      primary: [ID_TYPES.NationalId],
      mandatory: [ID_TYPES.NationalId],
      optional: [ID_TYPES.Passport],
    },
    NRE: {
      primary: [ID_TYPES.NationalId],
      mandatory: [ID_TYPES.NationalId, ID_TYPES.Passport],
      optional: [],
    },
    FOREIGNER: {
      primary: [ID_TYPES.ForeignPassport, ID_TYPES.RefugeeId],
      mandatory: [ID_TYPES.ForeignPassport, ID_TYPES.RefugeeId],
      optional: [ID_TYPES.ForeignId, ID_TYPES.WorkPermit],
    },
    REFUGEE: {
      primary: [],
      mandatory: [],
      optional: [],
    },
    MINOR: {
      primary: [
        ID_TYPES.BirthCertificate,
        ID_TYPES.Passport,
        ID_TYPES.NotificationOfBirth,
      ],
      mandatory: [
        ID_TYPES.BirthCertificate,
        ID_TYPES.Passport,
        ID_TYPES.NotificationOfBirth,
      ],
      optional: [
        ID_TYPES.BirthCertificate,
        ID_TYPES.Passport,
        ID_TYPES.NotificationOfBirth,
      ],
    },
  },
};
