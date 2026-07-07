import { z } from 'zod';

export const HealthStatusSchema = z.object({
  status: z.string(),
});

export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export const HealthResponseSchema = z.object({
  success: z.boolean(),
  data: HealthStatusSchema,
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
