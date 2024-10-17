import { AuthService } from "./AuthService/AuthService";

type Method = 'GET' | 'POST' | 'DELETE' | 'PATCH';

export class ApiService {

  static JsonHeader = new Headers({ 'Content-type': 'application/json' });

  public static async DELETE<T>(url: string) {
    return await this.SendRequest<T>(url, 'DELETE');
  }

  public static async PATCH<T>(url: string, payload: any) {
    return await this.SendRequest<T>(url, 'PATCH', this.JsonHeader, payload);
  }

  public static async POST<T>(url: string, payload: any) {
    return await this.SendRequest<T>(url, 'POST', this.JsonHeader, payload);
  }

  public static async GET<T>(url: string) {
    return await this.SendRequest<T>(url, 'GET');
  }

  private static async SendRequest<T>(url: string, method: Method, headers?: Headers, body?: any): Promise<T | null> {
    try {
      const bearer = await AuthService.TryGetBearerHeader(url);
      if (bearer !== null) {
        headers = new Headers(headers);
        headers.append(bearer.header, bearer.value);
      }

      const CredentialsMode = AuthService.GetCookieMode(url);
      
      console.log('Cookie mode: ' + CredentialsMode)
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(body),
        credentials: CredentialsMode
      });

      if (!response.ok) {
        console.error('Error:', `HTTP error! Status: ${response.status}, to URL ${url}`);
        return null;
      }

      const contentType = response.headers.get("content-type");

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