import { useContext } from "react";
import { getConfig } from "@edx/frontend-platform";
import { getLoginRedirectUrl } from "@edx/frontend-platform/auth";
import { defineMessages, useIntl } from "@edx/frontend-platform/i18n";
import { AppContext } from "@edx/frontend-platform/react";
import { sendTrackEvent } from "@edx/frontend-platform/analytics";

// Platform layer of the Cobalt components. They import everything
// platform-specific (config, user, analytics, i18n) from here instead of from
// frontend-platform directly, so the same JSX can run on another platform by
// swapping this one file.

// MFE_CONFIG as the MFE sees it (getConfig() merges the runtime config).
export const getCobaltConfig = () => getConfig();

export const useAuthenticatedUser = () =>
  useContext(AppContext).authenticatedUser;

export { defineMessages, getLoginRedirectUrl, sendTrackEvent, useIntl };
