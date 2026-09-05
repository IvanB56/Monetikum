import {UserRole} from '@shared/config/auth';
import {RegionShape} from '@shared/types/region';

export interface User {
  user_id: string,
  name: string,
  surname: string,
  patronymic: string,
  email: string,
  phone: string,
  birthdate: string,
  region: RegionShape,
  type: UserRole
}

export interface UserResponse {
  data: User;
}