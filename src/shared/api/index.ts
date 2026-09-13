export { authenticatedServerFetch } from './authenticated-server-fetch';
export type {
  SanctumSession,
  SponsorLoginCredentials,
  SponsorRegisterCredentials,
  SponsorVerifyPhoneCredentials,
  StudentLoginCredentials,
} from './sanctum-session';
export {
  frontendOriginHeaders,
  getBackendApiUrl,
  getBackendOrigin,
  loginSponsor,
  loginStudent,
  logoutSanctumSession,
  registerSponsor,
  resolveSanctumSession,
  resolveSanctumSessionFromHeaders,
  SanctumRequestError,
  SanctumSessionError,
  verifySponsorPhone,
} from './sanctum-session';
export { ApiError, serverFetch } from './server-fetch';
