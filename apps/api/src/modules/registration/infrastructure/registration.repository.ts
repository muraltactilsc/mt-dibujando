import { Injectable } from '@nestjs/common';
import type { Selectable } from 'kysely';
import { db } from '../../../../db/database';
import type { Answer, Question } from '../../../../db/types';

export interface QuestionWithAnswers {
  question: Selectable<Question>;
  answers: Array<Pick<Selectable<Answer>, 'answerid' | 'answerstring'>>;
}

@Injectable()
export class RegistrationRepository {
  async findActiveQuestionsWithAnswers(): Promise<QuestionWithAnswers[]> {
    const questions = await db
      .selectFrom('question')
      .selectAll()
      .where('statusid', '=', 1)
      .orderBy('order', 'asc')
      .execute();

    const result: QuestionWithAnswers[] = [];

    for (const question of questions) {
      const answers = await db
        .selectFrom('answer')
        .select(['answerid', 'answerstring'])
        .where('statusid', '=', 1)
        .where('questionid', '=', question.questionid)
        .orderBy('order', 'asc')
        .execute();

      result.push({ question, answers });
    }

    return result;
  }

  async findActiveCorrectAnswerIds(): Promise<number[]> {
    const rows = await db
      .selectFrom('answer')
      .select('answerid')
      .where('statusid', '=', 1)
      .where('iscorrect', '=', true)
      .execute();

    return rows.map((row) => row.answerid);
  }

  async createLogTriedQuestion(values: {
    iscorrect: boolean;
    iptried: string;
    datetimetried: Date;
    datetimecreate: Date;
  }): Promise<void> {
    await db.insertInto('logtriedquestions').values(values).execute();
  }
}
