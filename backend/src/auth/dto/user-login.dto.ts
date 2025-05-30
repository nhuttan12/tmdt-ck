import { IsString, MinLength } from 'class-validator';
import { ErrorMessage } from 'src/helper/message/error-message';

export class UserLoginDto {
  @IsString({ message: ErrorMessage.USERNAME_IS_NOT_EMPTY })
  @MinLength(3, { message: ErrorMessage.USER_NAME_HAVE_AT_LEAST_3_CHARACTERS })
  username: string;

  @IsString({ message: ErrorMessage.PASSWORD_IS_NOT_EMPTY })
  @MinLength(6, { message: ErrorMessage.PASSWORD_HAVE_AT_LEAST_3_CHARACTERS })
  password: string;
}

export class UserLoginResponseDto {
  access_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
  };
}
