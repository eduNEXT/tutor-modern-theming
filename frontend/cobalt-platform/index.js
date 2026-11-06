import { useContext } from "react";
import { getConfig } from "@edx/frontend-platform";
import { getLoginRedirectUrl } from "@edx/frontend-platform/auth";
import { defineMessages, useIntl } from "@edx/frontend-platform/i18n";
import { AppContext } from "@edx/frontend-platform/react";
import { sendTrackEvent } from "@edx/frontend-platform/analytics";

// Platform layer for the legacy MFEs (frontend-platform). The Cobalt
// components import everything platform-specific from here, so the same JSX
// runs on the frontend-base site, where the build replaces this file with
// ./frontend-base.js. Both files must export the same names.

// MFE_CONFIG as the MFE sees it (getConfig() merges the runtime config).
export const getCobaltConfig = () => getConfig();

// The MFE has no header landmark around the slot: Cobalt renders its own
// <header> and skip link.
export const HEADER_IN_SHELL = false;

export const useAuthenticatedUser = () =>
  useContext(AppContext).authenticatedUser;

export { defineMessages, getLoginRedirectUrl, sendTrackEvent, useIntl };
