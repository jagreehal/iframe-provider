import { NextRequest } from 'next/server';

export function getHostUrlFromRequest(request: NextRequest) {
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    'localhost:5005';
  const proto =
    request.headers.get('x-forwarded-proto') ||
    (host.includes('localhost') ? 'http' : 'https');

  let port =
    request.headers.get('x-forwarded-port') ||
    (proto === 'https' ? '' : host.split(':')[1] || '80');

  port = port === '80' || port === '443' ? '' : `:${port}`;

  return `${proto}://${host.split(':')[0]}${port}`;
}
