import { NextRequest } from 'next/server';
import Urls from '@/urls'
import { Match, ProxyToBackend } from '@/lib/ProxyToBackend';


async function handler(request: NextRequest) {
   const response = await ProxyToBackend(request, match);
   return response != null ? response : new Response(null, {
    status: 500
   });
}

const match: Match = { path: '/api/auth', redirectUrl: Urls.AUTH_URL };

export { handler as GET, handler as POST }