import { NextRequest, NextResponse } from 'next/server';
import URLS from '@/urls'
import { Match, ProxyToBackend } from '@/lib/ProxyToBackend';
import { CHATS } from '@/apiPaths';

async function handler(request: NextRequest, { params }: { params: Promise<{ params: string[] }> }) {
    const response = ProxyToBackend(request, match)
    return response !== null ? response : new Response(null, {
        status: 500
    });
}

const match: Match = { path: CHATS.CHATS_PATH, redirectUrl: URLS.BACKEND_URL };

export { handler as GET, handler as POST }