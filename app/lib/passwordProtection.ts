import {redirect} from 'react-router';

// Simple cookie parser function that doesn't rely on external packages
function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(';').reduce(
    (cookies, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name) cookies[name] = value || '';
      return cookies;
    },
    {} as Record<string, string>,
  );
}

/**
 * Middleware to check if the user has access to the store
 */
export async function checkPasswordProtection(request: Request) {
  // Skip password protection for certain paths
  const url = new URL(request.url);
  const pathname = url.pathname;

  // List of paths that don't require password protection
  const publicPaths = [
    '/password',
    // '/account/login',
    // '/account/logout',
    // '/account/authorize',
  ];

  // Check if the current path is in the public paths list
  const isPublicPath = publicPaths.some((publicPath) =>
    pathname.includes(publicPath),
  );

  // If it's a public path, allow access
  if (isPublicPath) {
    return;
  }

  // Check if the user has access from a cookie
  const cookieHeader = request.headers.get('Cookie');
  const cookies = parseCookies(cookieHeader);

  // If the user doesn't have the access cookie, redirect to password page
  if (cookies['storeAccess'] !== 'granted') {
    // console.log('terere');
    throw redirect('/password');
  }
}
