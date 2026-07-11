import { Injectable } from '@nestjs/common';
import { RegistrationRepository } from '../infrastructure/registration.repository';
import {
  incompleteAnswers,
  registrationTokenExpired,
} from '../presentation/registration-error.exception';
import { signRegistrationToken, verifyRegistrationToken } from '../domain/registration-token';

export interface AnswerValidationResult {
  passed: boolean;
  registrationToken?: string;
}

export interface PublicAnswer {
  answerId: number;
  answer: string;
}

export interface PublicQuestion {
  questionId: number;
  order: number;
  question: string;
  answers: PublicAnswer[];
}

@Injectable()
export class RegistrationService {
  constructor(private readonly repository: RegistrationRepository) {}

  async getActiveQuestions(): Promise<PublicQuestion[]> {
    const rows = await this.repository.findActiveQuestionsWithAnswers();

    return rows.map((row) => ({
      questionId: row.question.questionid,
      order: row.question.order,
      question: row.question.questionstring,
      answers: row.answers.map((answer) => ({
        answerId: answer.answerid,
        answer: answer.answerstring,
      })),
    }));
  }

  async validateAnswers(answerIds: number[], ipTried: string): Promise<AnswerValidationResult> {
    if (answerIds.length < 3) {
      throw incompleteAnswers();
    }

    const correctIds = await this.repository.findActiveCorrectAnswerIds();
    const allCorrect = answerIds.every((id) => correctIds.includes(id));
    const now = new Date();

    await this.repository.createLogTriedQuestion({
      iscorrect: allCorrect,
      iptried: ipTried,
      datetimetried: now,
      datetimecreate: now,
    });

    if (!allCorrect) {
      return { passed: false };
    }

    const registrationToken = await signRegistrationToken();
    return { passed: true, registrationToken };
  }

  async verifyRegistrationToken(token: string): Promise<void> {
    try {
      await verifyRegistrationToken(token);
    } catch {
      throw registrationTokenExpired();
    }
  }
}
