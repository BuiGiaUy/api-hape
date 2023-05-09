export interface IUsers {
  readonly id: number;
  readonly name: string;
  readonly username: string;
  readonly email: string;
  readonly phone: string;
  password: string;
  readonly google_id: string;
  readonly facebook_id: string;
  readonly avatar: string;
  readonly email_verify: boolean;
  readonly createdAt: string;
  readonly updatedAt: number;
}
