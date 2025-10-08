export interface User {
  id: string;
  email: string;
  name: string;
  profile: {
    university?: string;
    year?: number;
    anonymous: boolean;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  university?: string;
  year?: number;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  ageConfirmed: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}