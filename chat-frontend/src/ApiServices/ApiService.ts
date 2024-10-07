export class ApiService {

  static JsonHeader = new Headers({ 'Content-type': 'application/json' });

  public static async DELETE(url: string, headers?: any) {
    return await this.SendRequest(url, 'DELETE');
  }

  public static async PATCH(url: string, payload: any, headers?: Headers) {
    return await this.SendRequest(url, 'PATCH', this.JsonHeader, payload);
  }

  public static async POST(url: string, payload: any, headers?: Headers) {
    return await this.SendRequest(url, 'POST', this.JsonHeader,  payload);
  }

  public static async GET(url: string, headers?: Headers) {
    return await this.SendRequest(url, 'GET', headers);
  }

  public static async SendRequest(url: string, method: Method, headers?: Headers, body?: any): Promise<any | null> {
    const credentialsMode: CredentialsMode = IncludeCookieMatch.some(x => url.includes(x)) ?  'include' : 'omit';
        
    try {
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(body), 
        credentials: credentialsMode
      });

      if (!response.ok) {
        console.error('Error:', `HTTP error! Status: ${response.status}, to URL ${url}`);
        return;
      }

      const contentType = response.headers.get("content-type")

      const result = await ((contentType && contentType.indexOf("application/json") !== -1)
        ? response.json()
        : response.text());

      console.log('Success');
      return result;
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