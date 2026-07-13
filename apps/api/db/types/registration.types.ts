import type { Generated, Timestamp } from './common.types';

export interface Answer {
  answerid: Generated<number>;
  answerstring: string;
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  iscorrect: boolean;
  order: number;
  questionid: number;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}

export interface Logtriedquestions {
  datetimecreate: Timestamp;
  datetimeedit: Timestamp | null;
  datetimetried: Timestamp;
  iptried: string;
  iscorrect: boolean;
  logtriedquestionsid: Generated<number>;
}

export interface Question {
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  order: number;
  questionid: Generated<number>;
  questionstring: string;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}
