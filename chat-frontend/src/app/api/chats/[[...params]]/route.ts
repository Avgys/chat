import { NextRequest, NextResponse } from 'next/server';
import Urls from '@/urls'
import { Match, ProxyToBackend } from '@/lib/ProxyToBackend';

async function handler(request: NextRequest) {
    const response = ProxyToBackend(request, match)
    return response !== null ? response : new Response(null, {
        status: 500
    });
}

const match: Match = { path: '/api/chats', redirectUrl: Urls.BACKEND_URL };

export { handler as GET, handler as POST }