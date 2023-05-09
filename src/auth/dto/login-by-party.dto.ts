import { IsString, MaxLength } from "class-validator";

export class LoginByPartyDto {
    @IsString()
    @MaxLength(50)
    readonly party: string

    @IsString()
    @MaxLength(50)
    readonly accessToken: string
}