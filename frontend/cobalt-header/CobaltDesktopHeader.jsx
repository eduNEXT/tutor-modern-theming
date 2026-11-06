import React from "react";

import { getCobaltConfig } from "../cobalt-platform";
import CobaltDesktopHeaderContent from "./CobaltDesktopHeaderContent";
import HeaderNotificationsSlot from "./HeaderNotifications";

// Cobalt header for the legacy MFEs' org.openedx.frontend.layout.header_desktop.v1
// slot. It wraps the slot's default content (PLUGIN_OPERATIONS.Wrap):
// `component` is the Open edX desktop header element with the props the host
// MFE gave it. The frontend-base app does not use this file (the site has no
// frontend-component-header): it renders CobaltDesktopHeaderContent directly.
const CobaltDesktopHeader = ({ component }) => {
  // Runtime kill-switch: when ENABLE_COBALT_HEADER is falsy, render the
  // default Open edX desktop header untouched.
  if (!getCobaltConfig()?.ENABLE_COBALT_HEADER) {
    return component;
  }

  const props = component?.props || {};
  return (
    <CobaltDesktopHeaderContent
      logo={props.logo}
      logoAltText={props.logoAltText}
      logoDestination={props.logoDestination}
      avatar={props.avatar}
      actions={HeaderNotificationsSlot && <HeaderNotificationsSlot />}
    />
  );
};

export default CobaltDesktopHeader;
