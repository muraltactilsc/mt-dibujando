import { z } from 'zod';

export const HealthResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    status: z.literal('ok'),
  }),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
