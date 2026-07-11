import { useMutation, useQuery } from '@tanstack/react-query';
import type { AuthSessionData, RegisterBody, ValidateAnswersResponse } from '@dibujando/shared';
import { ApiError } from './client';
import { registrationApi } from './registration.api';

export const registrationQueryKeys = {
  questions: ['registration', 'questions'] as const,
};

export function useQuestionsQuery() {
  return useQuery({
    queryKey: registrationQueryKeys.questions,
    queryFn: () => registrationApi.getQuestions(),
  });
}

export function useValidateAnswersMutation() {
  return useMutation<ValidateAnswersResponse, ApiError, number[]>({
    mutationFn: (answerIds) => registrationApi.validateAnswers(answerIds),
  });
}

export function useRegisterMutation() {
  return useMutation<AuthSessionData, ApiError, RegisterBody>({
    mutationFn: (body) => registrationApi.register(body),
  });
}
