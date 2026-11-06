import { createElement } from "react";
import {
  Slot,
  defineMessages,
  getAppConfig,
  getLoginRedirectUrl,
  getSiteConfig,
  sendTrackEvent,
  useAuthenticatedUser,
  useIntl,
  useWidgets,
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

// cobaltApp replaces the shell's whole desktop layout, and with it the
// desktopLeft/desktopRight slots where other apps add widgets (e.g. the
// notifications app puts its bell before the shell's secondary links). The
// Cobalt header renders those two slots without the shell's own widgets, which
// Cobalt draws itself, so whatever other apps add still shows, in the same
// order. The shell's widgets stay in the slot, so INSERT_BEFORE/INSERT_AFTER
// operations relative to them keep working.
const SHELL_HEADER_WIDGETS = {
  left: [
    "org.openedx.frontend.widget.header.desktopLogo.v1",
    "org.openedx.frontend.widget.header.desktopPrimaryLinks.v1",
  ],
  right: [
    "org.openedx.frontend.widget.header.desktopSecondaryLinks.v1",
    "org.openedx.frontend.widget.header.desktopAuthenticatedMenu.v1",
    "org.openedx.frontend.widget.header.desktopAnonymousMenu.v1",
  ],
};

const HEADER_SLOTS = {
  left: "org.openedx.frontend.slot.header.desktopLeft.v1",
  right: "org.openedx.frontend.slot.header.desktopRight.v1",
};

const extensionsLayout = (side) =>
  function CobaltHeaderExtensionsLayout() {
    const widgets = useWidgets();
    return widgets.identified
      .filter((widget) => !SHELL_HEADER_WIDGETS[side].includes(widget.id))
      .map((widget) => widget.node);
  };

const LAYOUTS = {
  left: extensionsLayout("left"),
  right: extensionsLayout("right"),
};

/**
 * @param {{ side: "left" | "right" }} props
 * @returns {import("react").ReactElement}
 */
export const HeaderExtensions = ({ side }) =>
  createElement(Slot, { id: HEADER_SLOTS[side], layout: LAYOUTS[side] });

export {
  defineMessages,
  getLoginRedirectUrl,
  sendTrackEvent,
  useAuthenticatedUser,
  useIntl,
};
