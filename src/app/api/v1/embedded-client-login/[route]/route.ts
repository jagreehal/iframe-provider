'server only';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import invariant from 'tiny-invariant';

import { getHostUrlFromRequest } from '@/lib/get-host-url-from-request';
import {
  createOneTimeToken,
  createSessionUsingToken,
} from '@/lib/one-time-token';
import { logger } from '@/logger';

export const dynamic = 'force-dynamic';

const validRoutes = new Set(['on-boarding', 'balances', 'payees', 'debug']);

export async function POST(
  request: NextRequest,
  { params }: { params: { route: string } }
) {
  invariant(params.route, 'Expected params.route');
  const { route } = params;
  const requestHeaders = new Headers(request.headers);
  const key = requestHeaders.get('x-api-key');

  logger.debug({ key }, request.url);

  if (!key) {
    logger.warn({ key }, 'Unauthorized request without x-api-key header');
    return NextResponse.json(
      { message: 'Unauthorized request without x-api-key header' },
      {
        status: 401,
      }
    );
  }

  if (!validRoutes.has(route)) {
    logger.warn({ key, route }, 'Unauthorized request to embedded route');
    return NextResponse.json(
      { message: 'Unauthorized request to embedded route' },
      {
        status: 401,
      }
    );
  }

  const token = await createOneTimeToken({
    key,
  });

  if (!token) {
    return NextResponse.json(
      { message: 'Unauthorized key used to generate token' },
      {
        status: 401,
      }
    );
  }

  const url = `${getHostUrlFromRequest(request)}${
    request.nextUrl.pathname
  }?token=${token}`;
  return NextResponse.json({ url });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { route: string } }
) {
  const searchParameters = request.nextUrl.searchParams;
  const token = searchParameters.get('token');
  invariant(params.route, 'Expected params.route');
  invariant(token, 'Expected token');
  const result = await createSessionUsingToken({ token });
  if (result.success) {
    redirect(`/embedded/${params.route}`);
  } else
    return NextResponse.json(
      { message: 'Unauthorized. Invalid token' },
      {
        status: 401,
      }
    );
}
