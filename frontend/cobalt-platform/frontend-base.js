import {
  defineMessages,
  getAppConfig,
  getLoginRedirectUrl,
  getSiteConfig,
  sendTrackEvent,
  useAuthenticatedUser,
  useIntl,
} from "@openedx/frontend-base";

// Platform layer for the frontend-base site. The site build copies this file
// over ./index.js (the frontend-platform one), so the Cobalt components need
// no changes. Both files must export the same names.

export const COBALT_APP_ID = "io.edunext.frontend.app.cobalt";

// MFE_CONFIG as the legacy MFEs see it. /api/frontend_site_config/v1/ moves
// some MFE_CONFIG keys to the site config and leaves the rest (COBALT_*,
// ENABLE_COBALT_*, SUPPORT_URL, ...) in commonAppConfig, which getAppConfig()
// merges into our app config. Rebuild the moved keys so the components read
// the same names on both platforms.
export const getCobaltConfig = () => {
  const site = getSiteConfig();
  return {
    BASE_URL: site.baseUrl,
    LMS_BASE_URL: site.lmsBaseUrl,
    STUDIO_BASE_URL: site.cmsBaseUrl,
    LOGIN_URL: site.loginUrl,
    LOGOUT_URL: site.logoutUrl,
    LOGO_URL: site.headerLogoImageUrl,
    SITE_NAME: site.siteName,
    ...getAppConfig(COBALT_APP_ID),
  };
};

// The shell already wraps the header slot in <header><nav> with a skip link to
// #main-content, so Cobalt must not render another landmark or skip link.
export const HEADER_IN_SHELL = true;

export {
  defineMessages,
  getLoginRedirectUrl,
  sendTrackEvent,
  useAuthenticatedUser,
  useIntl,
};
