import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  // Ensure unhandled rejections are logged and process exits with failure
  // This satisfies lint rules about handling promise rejections
  // and keeps behavior explicit for bootstrap errors.
  console.error(err);
  process.exit(1);
});
