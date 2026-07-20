import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  currency?: string;
}
