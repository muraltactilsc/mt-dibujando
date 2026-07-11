import { NestFactory } from '@nestjs/core';
import { initializeSchema, seedFixtures } from '../db/schema-initializer';
import { AppModule } from './app.module';

try {
  process.loadEnvFile();
} catch {
  // Environment is already configured or no .env file is present.
}

async function bootstrap(): Promise<void> {
  await initializeSchema();
  await seedFixtures();

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
}

void bootstrap();
