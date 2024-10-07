import URLConsts from '@/URLConsts';
import { NextResponse, NextRequest } from 'next/server'
 
export function RedirectToBackend(request: NextRequest) {
  // const backendUrl = URLConsts.BACKEND_URL + request.nextUrl.pathname;  
  let url = new URL(request.nextUrl.pathname, URLConsts.AUTH_URL);
  console.log('Redirected to ' + url)
  return NextResponse.redirect(url);
}