import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTicketTypeEnum1733472000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the old enum type and create a new one with updated values
    await queryRunner.query(`
      ALTER TABLE ticket_types 
      ALTER COLUMN type TYPE VARCHAR(50);
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS ticket_types_type_enum;
    `);

    await queryRunner.query(`
      CREATE TYPE ticket_types_type_enum AS ENUM (
        'General Admission',
        'VIP',
        'Early Bird',
        'Student',
        'Group',
        'Premium',
        'Standard',
        'Other'
      );
    `);

    await queryRunner.query(`
      ALTER TABLE ticket_types 
      ALTER COLUMN type TYPE ticket_types_type_enum 
      USING (
        CASE 
          WHEN type = 'general' THEN 'General Admission'::ticket_types_type_enum
          WHEN type = 'vip' THEN 'VIP'::ticket_types_type_enum
          WHEN type = 'early-bird' THEN 'Early Bird'::ticket_types_type_enum
          ELSE 'General Admission'::ticket_types_type_enum
        END
      );
    `);

    await queryRunner.query(`
      ALTER TABLE ticket_types 
      ALTER COLUMN type SET DEFAULT 'General Admission'::ticket_types_type_enum;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to old enum values
    await queryRunner.query(`
      ALTER TABLE ticket_types 
      ALTER COLUMN type TYPE VARCHAR(50);
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS ticket_types_type_enum;
    `);

    await queryRunner.query(`
      CREATE TYPE ticket_types_type_enum AS ENUM (
        'general',
        'vip',
        'early-bird'
      );
    `);

    await queryRunner.query(`
      ALTER TABLE ticket_types 
      ALTER COLUMN type TYPE ticket_types_type_enum 
      USING (
        CASE 
          WHEN type = 'General Admission' THEN 'general'::ticket_types_type_enum
          WHEN type = 'VIP' THEN 'vip'::ticket_types_type_enum
          WHEN type = 'Early Bird' THEN 'early-bird'::ticket_types_type_enum
          WHEN type = 'Student' THEN 'general'::ticket_types_type_enum
          WHEN type = 'Group' THEN 'general'::ticket_types_type_enum
          WHEN type = 'Premium' THEN 'vip'::ticket_types_type_enum
          WHEN type = 'Standard' THEN 'general'::ticket_types_type_enum
          WHEN type = 'Other' THEN 'general'::ticket_types_type_enum
          ELSE 'general'::ticket_types_type_enum
        END
      );
    `);

    await queryRunner.query(`
      ALTER TABLE ticket_types 
      ALTER COLUMN type SET DEFAULT 'general'::ticket_types_type_enum;
    `);
  }
}
