export interface Credentials{
    login: string,
    password: string,
}

export interface CredentialsModel{
    Name: string,
    ClientPasswordHash: string,
    ClientSalt: string
}