import type {
  AuthSessionData,
  Question,
  RegisterBody,
  ValidateAnswersBody,
  ValidateAnswersResponse,
} from '@dibujando/shared';
import { apiGet, apiPost } from './client';

interface SuccessEnvelope<T> {
  success: true;
  data: T;
}

export const registrationApi = {
  getQuestions: async (): Promise<Question[]> => {
    const response = await apiGet<SuccessEnvelope<Question[]>>('/api/registration/questions');
    return response.data;
  },

  validateAnswers: async (answerIds: number[]): Promise<ValidateAnswersResponse> => {
    const response = await apiPost<SuccessEnvelope<ValidateAnswersResponse>>(
      '/api/registration/validate-answers',
      { answerIds } satisfies ValidateAnswersBody,
    );
    return response.data;
  },

  register: async (body: RegisterBody): Promise<AuthSessionData> => {
    const response = await apiPost<SuccessEnvelope<AuthSessionData>>('/api/auth/register', body);
    return response.data;
  },
};
