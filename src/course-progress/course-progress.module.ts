import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseProgress } from './course-progress.entity';
import { CourseProgressController } from './course-progress.controller';
import { CourseProgressService } from './course-progress.service';

@Module({
  imports: [TypeOrmModule.forFeature([CourseProgress])],
  controllers: [CourseProgressController],
  providers: [CourseProgressService],
  exports: [CourseProgressService],
})
export class CourseProgressModule {}
