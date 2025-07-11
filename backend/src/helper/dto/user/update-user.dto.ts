import { IsInt, IsNotEmpty, IsString, Min, Validate } from 'class-validator';
import { NotUrlValidator } from '@validator';
import { ErrorMessage } from '@message/error-message';
import { ApiProperty } from '@nestjs/swagger';

export class UserUpdateDTO {
  @IsInt({ message: ErrorMessage.USER_ID_MUST_BE_INTEGER })
  @ApiProperty()
  id: number;

  @IsString({ message: ErrorMessage.USER_FULL_NAME_MUST_BE_STRING })
  @Validate(NotUrlValidator)
  @ApiProperty()
  name: string;

  @IsString({ message: ErrorMessage.USER_FULL_NAME_MUST_BE_STRING })
  @Validate(NotUrlValidator)
  @ApiProperty()
  email: string;

  @IsString({ message: ErrorMessage.USER_FULL_NAME_MUST_BE_STRING })
  @Validate(NotUrlValidator)
  @ApiProperty()
  phone: string;

  @IsString({ message: ErrorMessage.USER_FULL_NAME_MUST_BE_STRING })
  @Validate(NotUrlValidator)
  @ApiProperty()
  address: string;

  @IsInt({ message: ErrorMessage.ID_MUST_BE_INTEGER })
  @ApiProperty()
  @IsNotEmpty()
  @Min(1)
  imageId: number;
}
