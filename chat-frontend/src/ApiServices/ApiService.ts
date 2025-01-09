import { injectable } from "inversify";
import { cookieInclude } from "./AuthService/AuthCookieMiddleware";

type Method = 'GET' | 'POST' | 'DELETE' | 'PATCH';

@injectable()
export class ApiService {

  middlewares: ((url: string, request: RequestInit) => Promise<void>)[] = [cookieInclude];

  JsonHeader = new Headers({ 'Content-type': 'application/json' });

  public async DELETE<T>(url: string) {
    return await this.SendRequest<T>(url, 'DELETE');
  }

  public async PATCH<T>(url: string, payload: any) {
    return await this.SendRequest<T>(url, 'PATCH', this.JsonHeader, payload);
  }

  public async POST<T>(url: string, payload: any) {
    return await this.SendRequest<T>(url, 'POST', this.JsonHeader, payload);
  }

  public async GET<T>(url: string) {
    return await this.SendRequest<T>(url, 'GET');
  }

  private async SendRequest<T>(url: string, method: Method, headers?: Headers, body?: any): Promise<T | null> {
    try {

      const request = {
        method: method,
        headers: headers,
        body: JSON.stringify(body),
      }

      for (let index in this.middlewares) {
        await this.middlewares[index](url, request);
      }

      const response = await fetch(url, request);

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