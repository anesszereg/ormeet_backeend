import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNewsletterSubscribers1751644800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(255) NOT NULL UNIQUE,
        locale varchar(10) DEFAULT 'en',
        confirmed boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email
      ON newsletter_subscribers(email);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS newsletter_subscribers;`);
  }
}
