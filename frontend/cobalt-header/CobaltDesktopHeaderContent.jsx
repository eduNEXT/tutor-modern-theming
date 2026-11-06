import React from "react";
import PropTypes from "prop-types";
import { Nav } from "@openedx/paragon";

import { getCobaltConfig, sendTrackEvent, useIntl } from "../cobalt-platform";
import CobaltHeaderBase from "./CobaltHeaderBase";
import messages from "./messages";

// Cobalt desktop header: the shared chrome with the main menu in the middle.
// Platform-agnostic, with no kill-switch: CobaltDesktopHeader wraps it for the
// legacy MFEs (fallback to the Open edX header) and the frontend-base app
// renders it from a slot operation whose condition is ENABLE_COBALT_HEADER.
const CobaltDesktopHeaderContent = ({
  logo,
  logoAltText,
  logoDestination,
  avatar,
  actions,
}) => {
  const { formatMessage } = useIntl();
  const cfg = getCobaltConfig();

  // Main menu: only MFE_CONFIG.COBALT_HEADER_MAIN_MENU, so the legacy (Mako)
  // header can render exactly the same links. The menu the host MFE passes to
  // the slot (props.mainMenu) is MFE-specific and uses another item shape.
  const mainLinks = cfg.COBALT_HEADER_MAIN_MENU || [];

  const handleLinkClick = (event) => {
    sendTrackEvent("edx.bi.header.link", {
      category: "outbound_link",
      label: event.currentTarget.getAttribute("href"),
    });
  };

  return (
    <CobaltHeaderBase
      logo={logo}
      logoAltText={logoAltText}
      logoDestination={logoDestination}
      avatar={avatar}
      actions={actions}
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

CobaltDesktopHeaderContent.propTypes = {
  logo: PropTypes.string,
  logoAltText: PropTypes.string,
  logoDestination: PropTypes.string,
  avatar: PropTypes.string,
  // Rendered before Help (e.g. the MFE notifications bell).
  actions: PropTypes.node,
};

CobaltDesktopHeaderContent.defaultProps = {
  logo: null,
  logoAltText: null,
  logoDestination: null,
  avatar: null,
  actions: null,
};

export default CobaltDesktopHeaderContent;
