export class LoginRequest {
  readonly email: string;
  readonly password: string;
}

export class LoginResponse {
  readonly message: string;
  readonly access_token?: string;
}

export class AuthUser {
  readonly userId: string;
  readonly username: string;
}
