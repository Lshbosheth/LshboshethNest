import { Controller, Get, Post, Body, Query, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CourseProgressService } from './course-progress.service';
import { SetProgressDto, GetProgressDto, CourseStatsDto } from './dto/course-progress.dto';

@ApiTags('课程进度')
@Controller('course-progress')
export class CourseProgressController {
  constructor(private readonly progressService: CourseProgressService) {}

  // 获取用户标识（暂时用 IP，后续可以改成真实用户 ID）
  private getUserId(ip: string): string {
    return `user_${ip.replace(/\.|:/g, '_')}`;
  }

  @Get('status')
  @ApiOperation({ summary: '获取某课程某天的进度状态' })
  async getStatus(@Query() query: GetProgressDto, @Ip() ip: string) {
    const userId = this.getUserId(ip);
    const status = await this.progressService.getProgress(userId, query.courseId, query.dayId);
    return { status };
  }

  @Get('course')
  @ApiOperation({ summary: '获取某课程的所有进度' })
  async getCourseProgress(@Query('courseId') courseId: string, @Ip() ip: string) {
    const userId = this.getUserId(ip);
    const progress = await this.progressService.getCourseProgress(userId, courseId);
    return progress;
  }

  @Post('set')
  @ApiOperation({ summary: '设置进度' })
  async setProgress(@Body() dto: SetProgressDto, @Ip() ip: string) {
    const userId = this.getUserId(ip);
    const result = await this.progressService.setProgress(
      userId,
      dto.courseId,
      dto.dayId,
      dto.status,
    );
    return result; // 直接返回，让拦截器包装
  }

  @Get('stats')
  @ApiOperation({ summary: '获取课程统计' })
  async getCourseStats(@Query() query: CourseStatsDto, @Ip() ip: string) {
    const userId = this.getUserId(ip);
    return await this.progressService.getCourseStats(
      userId,
      query.courseId,
      Number(query.totalDays),
    );
  }

  @Post('reset')
  @ApiOperation({ summary: '重置某课程的所有进度' })
  async resetCourse(@Body('courseId') courseId: string, @Ip() ip: string) {
    const userId = this.getUserId(ip);
    return await this.progressService.resetCourse(userId, courseId);
  }

  @Get('export')
  @ApiOperation({ summary: '导出所有进度' })
  async exportProgress(@Ip() ip: string) {
    const userId = this.getUserId(ip);
    return await this.progressService.exportProgress(userId);
  }

  @Post('import')
  @ApiOperation({ summary: '导入进度数据' })
  async importProgress(@Body('data') data: any, @Ip() ip: string) {
    const userId = this.getUserId(ip);
    return await this.progressService.importProgress(userId, data);
  }
}
