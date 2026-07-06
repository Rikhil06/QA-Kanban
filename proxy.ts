import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // Forward the incoming cookies to the backend so httpOnly auth cookie is sent
  const cookieHeader = req.headers.get('cookie') ?? '';

  if (!cookieHeader) {
    return NextResponse.next();
  }

  let role: string | null = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
      {
        headers: {
          cookie: cookieHeader,
        },
        // Prevent edge caching
        cache: 'no-store',
      },
    );

    if (res.ok) {
      const data = await res.json();
      role = data.user?.role ?? null;
    }
  } catch (e) {
    console.error('Middleware user fetch failed', e);
  }

  // Pages only owners may access
  if (path === '/team' && role !== 'owner') {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/team', '/settings'],
};
