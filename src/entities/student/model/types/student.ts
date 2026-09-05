export interface StudentAvatar {
  id: number;
  original_name: string;
  mime: string;
  extension: string;
  size: number;
  alt: string | null;
  relativeUrl: string;
}

export interface Student {
  user_id: number;
  name: string;
  login: string;
  surname: string | null;
  patronymic: string | null;
  birthdate: string | null;
  avatar: StudentAvatar | null;
  gender: string | null;
  budget: number | null;
}

export interface StudentsResponse {
  data: Student[];
}
