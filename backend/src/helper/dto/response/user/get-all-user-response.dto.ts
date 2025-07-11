import { UserStatus } from '@enum/status/user-status.enum';

export class GetAllUsersResponseDTO {
  id: number;
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  phone: string;
  adresss: string;
  image: string;
}
