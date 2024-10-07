import { NextRequest, NextResponse } from 'next/server';
import { RedirectToBackend as RedirectToBackendMiddleware } from './middleware/RedirectToBackend';

type Middleware = (req: NextRequest) => NextRequest | NextResponse;

const middlewares: Middleware[] = [
    //AuthMiddleware,    
    //RedirectToBackendMiddleware
];

function chainMiddlewares(middlewares: Middleware[]) {
    return async (req: NextRequest) => {
        let result: NextRequest | NextResponse = req;
        for (const middleware of middlewares) {
            console.log(JSON.stringify(result))
            result = middleware(result as NextRequest);

            if(result instanceof NextResponse){
                return result;
            }
        }        

        return NextResponse.next();
    };
}

//export const middleware = chainMiddlewares(middlewares);

// export const config = {
//     matcher: ['/api/:path*'],
// };

// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
// import URLConsts from './URLConsts'
 
// // This function can be marked `async` if using `await` inside
// export function middleware(request: NextRequest) {
//     const backendUrl = URLConsts.BACKEND_URL + request.nextUrl.pathname;
//   return NextResponse.redirect(backendUrl);
// }
 
// // See "Matching Paths" below to learn more
// export const config = {
//   matcher: '/api/:path*',
// }