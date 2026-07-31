import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type ProgressStatus = 'not-started' | 'in-progress' | 'completed';

@Entity('course_progress')
@Index(['userId', 'courseId', 'dayId'], { unique: true })
export class CourseProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, comment: '用户标识（可以是 IP、session ID 或用户 ID）' })
  userId: string;

  @Column({ type: 'varchar', length: 255, comment: '课程 ID' })
  courseId: string;

  @Column({ type: 'varchar', length: 255, comment: '课程某天的 ID' })
  dayId: string;

  @Column({
    type: 'enum',
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started',
    comment: '进度状态'
  })
  status: ProgressStatus;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
