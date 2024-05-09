'server only';
import Redis from 'ioredis';

const client = new Redis(
  'rediss://default:776ba12783ab42ebbba63f9914c6368c@eu1-ethical-starfish-40449.upstash.io:40449'
);

import { v4 as randomUUID } from 'uuid';

import { expirationAddOneHour, generateJWT, setSessionCookie } from './auth';

export interface CreateOneTimeTokenParameters {
  key: string;
}

const clientIdKeyMap = new Map<string, string>();
clientIdKeyMap.set('123', 'bob');
clientIdKeyMap.set('456', 'alice');

export interface CreateSessionUsingTokenParameters {
  token: string;
}
export async function createSessionUsingToken({
  token,
}: CreateSessionUsingTokenParameters) {
  const record = await client.get(token);
  if (!record) {
    return { success: false };
  }

  const parsedRecord = JSON.parse(record);

  await client.del(token);
  setSessionCookie(parsedRecord.jwt);
  return { success: true };
}

export async function createOneTimeToken({
  key,
}: CreateOneTimeTokenParameters) {
  const clientId = clientIdKeyMap.get(key);

  if (clientId) {
    const expires = expirationAddOneHour();
    const jwt = await generateJWT({ clientId, expires });
    const tokenId = randomUUID();
    await client.set(tokenId, JSON.stringify({ jwt }));
    return tokenId;
  }
}
