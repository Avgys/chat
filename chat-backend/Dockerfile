# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 34325
EXPOSE 44325

# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Docker
WORKDIR /src
COPY ["chat-backend/chat-backend.csproj", "chat-backend/"]
COPY ["AuthService/AuthService.csproj", "AuthService/"]
COPY ["Persistence/Persistence.csproj", "Persistence/"]
COPY ["Shared/Shared.csproj", "Shared/"]
RUN dotnet restore "./chat-backend/chat-backend.csproj"
COPY . .
WORKDIR "/src/chat-backend"
RUN dotnet build "./chat-backend.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Docker
RUN dotnet publish "./chat-backend.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
ENV ASPNETCORE_ENVIRONMENT=Docker
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "chat-backend.dll"]