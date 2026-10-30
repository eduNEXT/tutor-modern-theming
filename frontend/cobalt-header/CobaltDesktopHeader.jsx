import React from "react";
import { getConfig } from "@edx/frontend-platform";
import { useIntl } from "@edx/frontend-platform/i18n";
import { sendTrackEvent } from "@edx/frontend-platform/analytics";
// DesktopHeader is the slot's default content. It is not re-exported by the
// package index, so it is imported from dist (present in 6.x and 8.x).
// Rendering it directly (not DesktopHeaderSlot) does not recurse into the slot.
import DefaultDesktopHeader from "@edx/frontend-component-header/dist/desktop-header/DesktopHeader";
import { Nav } from "@openedx/paragon";

import CobaltHeaderBase from "./CobaltHeaderBase";
import messages from "./messages";

// Cobalt header for org.openedx.frontend.layout.header_desktop.v1: the shared
// chrome with the main menu in the middle.
const CobaltDesktopHeader = (props) => {
  const { formatMessage } = useIntl();
  const cfg = getConfig();

  // Main menu: only MFE_CONFIG.COBALT_HEADER_MAIN_MENU, so the legacy (Mako)
  // header can render exactly the same links. The menu the host MFE passes to
  // the slot (props.mainMenu) is MFE-specific and uses another item shape.
  const mainLinks = cfg.COBALT_HEADER_MAIN_MENU || [];

  // Runtime kill-switch: when ENABLE_COBALT_HEADER is falsy, fall back to
  // the default Open edX desktop header with the props the slot received.
  // Placed after all hooks so the rules of hooks are respected.
  if (!cfg?.ENABLE_COBALT_HEADER) {
    return <DefaultDesktopHeader {...props} />;
  }

  const handleLinkClick = (event) => {
    sendTrackEvent("edx.bi.header.link", {
      category: "outbound_link",
      label: event.currentTarget.getAttribute("href"),
    });
  };

  return (
    <CobaltHeaderBase
      logo={props.logo}
      logoAltText={props.logoAltText}
      logoDestination={props.logoDestination}
      avatar={props.avatar}
    >
      {mainLinks.length > 0 && (
        <Nav
          className="chd-main-nav"
          aria-label={formatMessage(messages.mainMenu)}
        >
          {mainLinks.map((link) => (
            <Nav.Item key={link.url}>
              <Nav.Link
                href={link.url}
                target={link.target || "_self"}
                onClick={handleLinkClick}
                className="chd-nav-link"
              >
                {link.txt}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      )}
    </CobaltHeaderBase>
  );
};

export default CobaltDesktopHeader;
