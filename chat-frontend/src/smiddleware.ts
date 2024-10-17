// app/middleware.js

import { NextRequest, NextResponse } from 'next/server';

// Middleware function
export function middleware(request: NextRequest) {
    console.log('Middleware called');
    return NextResponse.next();
}

// Configuring the middleware to apply to all SignalR requests
export const config = {
    matcher: '/api/hubs/:path*',
};
