import { AuthService } from "./AuthService/AuthService";

export class ApiService {

  static JsonHeader = new Headers({ 'Content-type': 'application/json' });

  public static async DELETE<T>(url: string, includeBearer: boolean = false) {
    return await this.SendRequest<T>(url, 'DELETE', includeBearer);
  }

  public static async PATCH<T>(url: string, payload: any, includeBearer: boolean = false) {
    return await this.SendRequest<T>(url, 'PATCH', includeBearer, this.JsonHeader, payload);
  }

  public static async POST<T>(url: string, payload: any, includeBearer: boolean = false) {
    return await this.SendRequest<T>(url, 'POST', includeBearer, this.JsonHeader, payload);
  }

  public static async GET<T>(url: string, includeBearer: boolean = false) {
    return await this.SendRequest<T>(url, 'GET', includeBearer);
  }

  private static async SendRequest<T>(url: string, method: Method, includeBearer: boolean, headers?: Headers, body?: any,): Promise<T | null> {
    const credentialsMode: CredentialsMode = IncludeCookieMatch.some(x => url.includes(x)) ? 'include' : 'omit';
    if (includeBearer) {
      headers = new Headers(headers);
      const authHeader = AuthService.getAuthHeader();
      headers.append(authHeader.header, authHeader.bearer);
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(body),
        credentials: credentialsMode
      });

      if (!response.ok) {
        console.error('Error:', `HTTP error! Status: ${response.status}, to URL ${url}`);
        return null;
      }

      const contentType = response.headers.get("content-type")

      const result = await ((contentType && contentType.indexOf("application/json") !== -1)
        ? response.json()
        : response.text());

      console.log('Success');
      return result as T;
    }
    catch (error) {
      console.error('Error:', error);
    }

    return null;
  }
}

const IncludeCookieMatch = ['/api/auth/private', 'api/auth/login'];

type CredentialsMode = 'omit' | 'include' | 'same-origin';
type Method = 'GET' | 'POST' | 'DELETE' | 'PATCH';