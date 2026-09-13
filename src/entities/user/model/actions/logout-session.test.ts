import { describe, expect, it, vi } from 'vitest';

import type { SanctumSession } from '@shared/api';
import { SanctumSessionError } from '@shared/api';

import { logoutSanctumSessionAction } from './logout-session';

const resolveSanctumSessionFromHeadersMock = vi.hoisted(() => vi.fn());
const logoutSanctumSessionMock = vi.hoisted(() => vi.fn());

vi.mock('@shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/api')>();
  return {
    ...actual,
    resolveSanctumSessionFromHeaders: resolveSanctumSessionFromHeadersMock,
    logoutSanctumSession: logoutSanctumSessionMock,
  };
});

const sanctumSession: SanctumSession = { cookieHeader: 'session=abc', xsrfToken: 'token' };

describe('logoutSanctumSessionAction', () => {
  it('идемпотентен при отсутствующей сессии — не обращается к backend и не бросает ошибку', async () => {
    resolveSanctumSessionFromHeadersMock.mockResolvedValueOnce(null);

    await expect(logoutSanctumSessionAction()).resolves.toBeUndefined();
    expect(logoutSanctumSessionMock).not.toHaveBeenCalled();
  });

  it('инвалидирует сессию на backend, если она есть', async () => {
    resolveSanctumSessionFromHeadersMock.mockResolvedValueOnce(sanctumSession);
    logoutSanctumSessionMock.mockResolvedValueOnce(undefined);

    await expect(logoutSanctumSessionAction()).resolves.toBeUndefined();
    expect(logoutSanctumSessionMock).toHaveBeenCalledWith(sanctumSession);
  });

  it('глотает SanctumSessionError — backend уже разлогинил или сессия истекла', async () => {
    resolveSanctumSessionFromHeadersMock.mockResolvedValueOnce(sanctumSession);
    logoutSanctumSessionMock.mockRejectedValueOnce(new SanctumSessionError('Сессия истекла', 401));

    await expect(logoutSanctumSessionAction()).resolves.toBeUndefined();
  });

  it('пробрасывает ошибки, отличные от SanctumSessionError, без изменений', async () => {
    resolveSanctumSessionFromHeadersMock.mockResolvedValueOnce(sanctumSession);
    const unexpectedError = new Error('network down');
    logoutSanctumSessionMock.mockRejectedValueOnce(unexpectedError);

    await expect(logoutSanctumSessionAction()).rejects.toThrow(unexpectedError);
  });
});
