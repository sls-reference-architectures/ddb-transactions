export interface User extends UserCommon {
  id: string;
}

export interface UserDb extends UserCommon {
  pk: string;
}

interface UserCommon {
  userName: string;
  email: string;
  fullName: string;
  phoneNumber: string;
}