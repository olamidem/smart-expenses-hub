import { IsString, IsUUID, ValidateIf } from 'class-validator';

export class AddMemberDto {
  @ValidateIf((o: AddMemberDto) => !o.displayName)
  @IsUUID()
  userId?: string;

  @ValidateIf((o: AddMemberDto) => !o.userId)
  @IsString()
  displayName?: string;
}
