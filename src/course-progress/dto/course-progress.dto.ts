import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type ProgressStatus = 'not-started' | 'in-progress' | 'completed';

export class SetProgressDto {
  @ApiProperty({ description: '课程 ID', example: 'react-lowcode-course' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ description: '课程某天的 ID', example: 'day-01' })
  @IsNotEmpty()
  @IsString()
  dayId: string;

  @ApiProperty({ description: '进度状态', enum: ['not-started', 'in-progress', 'completed'] })
  @IsEnum(['not-started', 'in-progress', 'completed'])
  status: ProgressStatus;
}

export class GetProgressDto {
  @ApiProperty({ description: '课程 ID', example: 'react-lowcode-course' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ description: '课程某天的 ID', example: 'day-01', required: false })
  @IsString()
  dayId?: string;
}

export class CourseStatsDto {
  @ApiProperty({ description: '课程 ID', example: 'react-lowcode-course' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ description: '课程总天数', example: 12 })
  @IsNotEmpty()
  totalDays: number;
}
