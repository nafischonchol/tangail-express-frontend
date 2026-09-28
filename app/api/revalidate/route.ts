import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Local IP list & helpers
const LOCAL_IPS = new Set([
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1',
  'localhost',
]);

function isLocalRequest(request: NextRequest): boolean {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const host = request.headers.get('host') || '';

  const clientIp = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : realIp || '';

  // Allow localhost IPs or loopback
  if (clientIp && (LOCAL_IPS.has(clientIp) || clientIp.startsWith('127.'))) {
    return true;
  }

  // Check host header if request comes directly to localhost
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  // Check if request is from local server / localhost
  const isLocal = isLocalRequest(request);

  // Check optional internal secret token if configured
  const authHeader =
    request.headers.get('x-internal-secret') ||
    request.headers.get('authorization');
  const secretKey = process.env.INTERNAL_REVALIDATE_SECRET;

  if (secretKey) {
    const isValidToken =
      authHeader === `Bearer ${secretKey}` || authHeader === secretKey;
    if (!isValidToken) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Invalid secret token' },
        { status: 403 }
      );
    }
  } else if (!isLocal) {
    return NextResponse.json(
      {
        success: false,
        message: 'Forbidden: Access restricted to local server only',
      },
      { status: 403 }
    );
  }

  try {
    let path = '/';
    let type: 'layout' | 'page' = 'layout';

    // Parse body if present
    if (request.headers.get('content-type')?.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      if (body?.path) path = body.path;
      if (body?.type === 'page' || body?.type === 'layout') type = body.type;
    } else {
      // Parse query params if GET or no JSON body
      const { searchParams } = new URL(request.url);
      if (searchParams.get('path')) path = searchParams.get('path')!;
      if (searchParams.get('type') === 'page') type = 'page';
    }

    // Invalidates all cache under root layout or specific path
    revalidatePath(path, type);

    return NextResponse.json({
      success: true,
      message: `Cache revalidated successfully for '${path}' (${type})`,
      path,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to revalidate cache', error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
