import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('config')
export class Config {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  configName: string;

  @Column({ nullable: true, type: 'varchar' })
  configType: string;

  @Column({ nullable: true, type: 'varchar' })
  configSort: string | number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdTime: Date;
}
