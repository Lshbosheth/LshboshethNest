import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseProgress, ProgressStatus } from './course-progress.entity';

@Injectable()
export class CourseProgressService {
  constructor(
    @InjectRepository(CourseProgress)
    private readonly progressRepo: Repository<CourseProgress>,
  ) {}

  // 获取用户某课程某天的进度
  async getProgress(userId: string, courseId: string, dayId: string): Promise<ProgressStatus> {
    const progress = await this.progressRepo.findOne({
      where: { userId, courseId, dayId },
    });
    return progress ? progress.status : 'not-started';
  }

  // 获取用户某课程的所有进度
  async getCourseProgress(userId: string, courseId: string) {
    const progressList = await this.progressRepo.find({
      where: { userId, courseId },
    });

    const result: Record<string, ProgressStatus> = {};
    progressList.forEach(p => {
      result[p.dayId] = p.status;
    });

    return result;
  }

  // 设置进度
  async setProgress(userId: string, courseId: string, dayId: string, status: ProgressStatus) {
    const existing = await this.progressRepo.findOne({
      where: { userId, courseId, dayId },
    });

    if (existing) {
      existing.status = status;
      await this.progressRepo.save(existing);
      return existing;
    } else {
      const newProgress = this.progressRepo.create({
        userId,
        courseId,
        dayId,
        status,
      });
      return await this.progressRepo.save(newProgress);
    }
  }

  // 获取课程统计
  async getCourseStats(userId: string, courseId: string, totalDays: number) {
    const progressList = await this.progressRepo.find({
      where: { userId, courseId },
    });

    const completed = progressList.filter(p => p.status === 'completed').length;
    const inProgress = progressList.filter(p => p.status === 'in-progress').length;
    const notStarted = totalDays - completed - inProgress;

    return {
      completed,
      inProgress,
      notStarted,
      total: totalDays,
      percentage: totalDays > 0 ? Math.round((completed / totalDays) * 100) : 0,
    };
  }

  // 重置某课程的所有进度
  async resetCourse(userId: string, courseId: string) {
    await this.progressRepo.delete({ userId, courseId });
    return { success: true };
  }

  // 导出用户所有进度
  async exportProgress(userId: string) {
    const allProgress = await this.progressRepo.find({
      where: { userId },
    });

    const result: Record<string, Record<string, ProgressStatus>> = {};
    allProgress.forEach(p => {
      if (!result[p.courseId]) {
        result[p.courseId] = {};
      }
      result[p.courseId][p.dayId] = p.status;
    });

    return result;
  }

  // 导入进度数据
  async importProgress(userId: string, data: Record<string, Record<string, ProgressStatus>>) {
    const operations = [];

    for (const [courseId, days] of Object.entries(data)) {
      for (const [dayId, status] of Object.entries(days)) {
        operations.push(this.setProgress(userId, courseId, dayId, status));
      }
    }

    await Promise.all(operations);
    return { success: true, imported: operations.length };
  }
}
