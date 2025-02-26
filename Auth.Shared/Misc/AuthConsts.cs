﻿namespace Auth.Shared.Misc;

public static class AuthConsts
{
    public const string AuthScheme = "AuthScheme";
    public const string RefreshToken = "RefreshToken";

    public static readonly TimeSpan AccessExpire = TimeSpan.FromDays(2);
    public static readonly TimeSpan RefreshExpire = TimeSpan.FromDays(2);

    public static class Claims
    {
        public const string UserId = "UserId";
        public const string Role = "Role";
        public const string Name = "Name";
    }
}