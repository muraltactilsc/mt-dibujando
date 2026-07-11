import { z } from 'zod';

export const AnswerSchema = z.object({
  answerId: z.number(),
  answer: z.string(),
});

export type Answer = z.infer<typeof AnswerSchema>;

export const QuestionSchema = z.object({
  questionId: z.number(),
  order: z.number(),
  question: z.string(),
  answers: z.array(AnswerSchema),
});

export type Question = z.infer<typeof QuestionSchema>;

export const ValidateAnswersBodySchema = z.object({
  answerIds: z.array(z.number()),
});

export type ValidateAnswersBody = z.infer<typeof ValidateAnswersBodySchema>;

export const ValidateAnswersPassedSchema = z.object({
  passed: z.literal(true),
  registrationToken: z.string(),
});

export const ValidateAnswersFailedSchema = z.object({
  passed: z.literal(false),
});

export const ValidateAnswersResponseSchema = z.union([
  ValidateAnswersPassedSchema,
  ValidateAnswersFailedSchema,
]);

export type ValidateAnswersResponse = z.infer<typeof ValidateAnswersResponseSchema>;

export const RegisterBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  confirmPassword: z.string().min(1),
  institutionName: z.string().min(1),
  nationalRegistryNumber: z.string().min(1).max(25),
  countryId: z.number(),
  registrationToken: z.string().min(1),
});

export type RegisterBody = z.infer<typeof RegisterBodySchema>;

export const CountrySchema = z.object({
  countryId: z.number(),
  name: z.string(),
});

export type Country = z.infer<typeof CountrySchema>;
