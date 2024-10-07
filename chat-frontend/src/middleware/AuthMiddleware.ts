import { AuthService } from '@/ApiServices/AuthService/AuthService';
import { NextResponse, NextRequest } from 'next/server'
 
export function AuthMiddleware(request: NextRequest) {

  // const token = AuthService.getToken();
  // if (token == null)
  //   return NextResponse.next();

  const headers = new Headers(request.headers);
  headers.set('Authorization', 'Bearer ');

  const modifiedRequest = new NextRequest(request.url, {
    ...request,
    headers
  });

  return modifiedRequest;
}