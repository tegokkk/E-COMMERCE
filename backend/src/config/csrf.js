import { csrfSync } from 'csrf-sync';

export const {
  csrfSynchronisedProtection,
  generateToken,
  revokeToken,
} = csrfSync({
  getTokenFromRequest: (req) => {
    return (
      req.headers['x-csrf-token'] ||
      req.headers['x-xsrf-token'] ||
      (req.body && req.body._csrf)
    );
  },
  getTokenFromState: (req) => {
    return req.session?.csrfToken;
  },
  storeTokenInState: (req, token) => {
    if (req.session) {
      req.session.csrfToken = token;
    }
  },
  size: 32,
});

