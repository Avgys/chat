import { NextRequest, NextResponse } from 'next/server';
import URLS from '@/urls'
import { Match, ProxyToBackend } from '@/lib/ProxyToBackend';
import { AUTH, CHATS, SEND } from '@/apiPaths';

async function handler(request: NextRequest, { params }: { params: Promise<{ params: string[] }> }) {
    const response = ProxyToBackend(request, matches)
    return response !== null ? response : new Response(null, {
        status: 500
    });
}

const matches: Match[] = [
    { path: CHATS.CHATS_PATH, redirectUrl: URLS.BACKEND_URL },
    { path: AUTH.AUTH_PATH, redirectUrl: URLS.AUTH_URL },
    { path: SEND.SEND_MESSAGE, redirectUrl: URLS.BACKEND_URL }];

export { handler as GET, handler as POST }