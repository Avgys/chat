import { NextRequest, NextResponse } from "next/server";

export type Match = { path: string, redirectUrl: string };

export async function ProxyToBackend(request: NextRequest, ...matches: Match[]): Promise<Response | null> {

    const match = matches.find(x => request.nextUrl.pathname.startsWith(x.path))
    if (!match)
        return null;

    const url = new URL(request.nextUrl.pathname + '?' + request.nextUrl.searchParams, match.redirectUrl);
    console.log(url.toString(), request.method, request.mode, JSON.stringify(request.body), request.credentials);

    try {
        const req: any = {
            method: request.method,
            headers: request.headers,
            mode: request.mode,
            
        };

        if (request.body) {
            req.body = request.body;
            req.duplex = 'half';
        }

        const fetchResponse = await fetch(url, req);
        
        console.log('Fetch response: ', fetchResponse);

        // const nextResponse = new NextResponse(await fetchResponse.text(), {
        //     status: fetchResponse.status,
        //     headers: fetchResponse.headers
        // });

        return fetchResponse;
    }
    catch (error) {
        console.log("ERROR: " + (error))
    }

    return null;
}