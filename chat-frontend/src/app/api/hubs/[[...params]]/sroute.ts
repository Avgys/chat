import { NextRequest, NextResponse } from 'next/server';
import ENV from '@/env.urls'
import { Match, ProxyToBackend } from '@/lib/ProxyToBackend';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { NextApiRequest, NextApiResponse } from 'next';

const apiProxy = createProxyMiddleware({
    target: 'https://localhost:44325',
    changeOrigin: true,
    //ws: true,
    // router: {
    //     'socket.io/*': 'http://localhost:4000',
    // },
    // pathRewrite: {
    //     '^/api/chats/socket.io': '/socket.io/', // that end slash is magical
    // },
});

export function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise((resolve, reject) => {
        apiProxy(req, res, (result) => {
            if (result instanceof Error)
                return reject(result);

            return resolve(result);
        });
    });
}

const match: Match = { path: '', redirectUrl: ENV.BACKEND_URL };


export const config = {
    api: {
        // Proxy middleware will handle requests itself, so Next.js should 
        // ignore that our handler doesn't directly return a response
        externalResolver: true,
        // Pass request bodies through unmodified so that the origin API server
        // receives them in the intended format
        bodyParser: false,
    },
}

export { handler as GET, handler as POST }