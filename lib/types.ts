/** Det publikum får se — kontaktinfo er aldri med her. */
export type PublicSubmission = {
  id: string;
  created_at: string;
  industry_key: string;
  subarea_key: string;
  subarea_other: string | null;
  title: string;
  challenge: string;
  levels: string[];
};

/** Det skjemaet sender inn. */
export type SubmissionInput = {
  industry_key: string;
  subarea_key: string;
  subarea_other?: string | null;
  title: string;
  challenge: string;
  levels: string[];
  company_name: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
};

export type ContactRequestInput = {
  submission_id: string;
  requester_name: string;
  requester_email: string;
  requester_role?: string | null;
  message?: string | null;
};
