import React, { useContext } from "react";
import PropTypes from "prop-types";
import { getConfig } from "@edx/frontend-platform";
import { getLoginRedirectUrl } from "@edx/frontend-platform/auth";
import { useIntl } from "@edx/frontend-platform/i18n";
import { AppContext } from "@edx/frontend-platform/react";
import { sendTrackEvent } from "@edx/frontend-platform/analytics";
import { Dropdown, Avatar, Button, Hyperlink } from "@openedx/paragon";

import messages from "./messages";
import "./CobaltHeader.scss";

// Shared Cobalt header chrome (logo, user menu, logged-out actions) used by
// every Cobalt header variant (desktop, learning): logo, Help link, user menu
// and logged-out actions. Each variant only decides what goes in the middle
// of the bar, so all of them (and legacy/header/header.html) look the same.

// Build the authenticated user dropdown items: the standard Open edX items
// (Dashboard / Profile / Account / Order History / Sign Out) plus any extras
// configured via MFE_CONFIG.COBALT_HEADER_USER_MENU_EXTRA_LINKS. Sign Out
// always stays last.
const buildUserMenu = (cfg, username, formatMessage) => {
  const lms = cfg.LMS_BASE_URL || "";
  const profileBase =
    cfg.ACCOUNT_PROFILE_URL || cfg.PROFILE_MICROFRONTEND_URL || lms;
  const accountBase = cfg.ACCOUNT_SETTINGS_URL || `${lms}/account/settings`;

  const items = [
    { txt: formatMessage(messages.dashboard), url: `${lms}/dashboard` },
    {
      txt: formatMessage(messages.profile),
      url: `${profileBase}/u/${username}`,
    },
    { txt: formatMessage(messages.account), url: accountBase },
  ];

  if (cfg.ORDER_HISTORY_URL) {
    items.push({
      txt: formatMessage(messages.orderHistory),
      url: cfg.ORDER_HISTORY_URL,
    });
  }

  (cfg.COBALT_HEADER_USER_MENU_EXTRA_LINKS || []).forEach((link) => {
    if (link && link.url && link.txt) {
      items.push({ txt: link.txt, url: link.url });
    }
  });

  items.push({
    txt: formatMessage(messages.signOut),
    url: cfg.LOGOUT_URL || `${lms}/logout`,
  });
  return items;
};

const CobaltHeaderBase = ({
  skipTo,
  logo,
  logoAltText,
  logoDestination,
  avatar,
  showUserArea,
  children,
  help,
}) => {
  const { formatMessage } = useIntl();
  const { authenticatedUser } = useContext(AppContext);
  const cfg = getConfig();

  const loggedIn = !!authenticatedUser;
  const username = authenticatedUser?.username;
  const avatarSrc = authenticatedUser?.avatar || avatar;

  const logoSrc = cfg.LOGO_URL || logo;
  const logoAlt = cfg.SITE_NAME || logoAltText || "Home";
  const logoHref = logoDestination || cfg.LMS_BASE_URL || "/";

  const handleLinkClick = (event) => {
    sendTrackEvent("edx.bi.header.link", {
      category: "outbound_link",
      label: event.currentTarget.getAttribute("href"),
    });
  };

  // Help link before the user menu, in every Cobalt header (and the legacy
  // one) when SUPPORT_URL is set. A variant can pass its own `help` element
  // (the learning header passes its plugin slot).
  const renderHelp = () => {
    if (!cfg.SUPPORT_URL) {
      return null;
    }
    return (
      <div className="chd-help">
        {help || (
          <a href={cfg.SUPPORT_URL} onClick={handleLinkClick}>
            {formatMessage(messages.help)}
          </a>
        )}
      </div>
    );
  };

  const renderUserMenu = () => {
    const items = buildUserMenu(cfg, username, formatMessage);
    return (
      <Dropdown className="chd-user-menu">
        <Dropdown.Toggle
          id="cobalt-header-user-menu"
          variant="outline-primary"
          className="chd-user-toggle d-inline-flex align-items-center"
        >
          <Avatar size="sm" src={avatarSrc} alt={username} className="mr-2" />
          <span className="d-none d-md-inline">{username}</span>
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight className="chd-user-menu-content">
          {items.map((item) => (
            <Dropdown.Item
              key={item.url}
              href={item.url}
              onClick={handleLinkClick}
            >
              {item.txt}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  // Both links bring the learner back to the current page afterwards, as the
  // default learning header does.
  const renderLoggedOut = () => {
    const here = global.location.href;
    const loginUrl = getLoginRedirectUrl(here);
    const registerUrl = `${cfg.LMS_BASE_URL}/register?next=${encodeURIComponent(here)}`;
    return (
      <div className="chd-auth-actions d-flex align-items-center">
        <Hyperlink
          destination={loginUrl}
          onClick={handleLinkClick}
          className="chd-nav-link"
        >
          {formatMessage(messages.signIn)}
        </Hyperlink>
        <Button
          as="a"
          href={registerUrl}
          variant="outline-primary"
          onClick={handleLinkClick}
        >
          {formatMessage(messages.register)}
        </Button>
      </div>
    );
  };

  return (
    <header className="cobalt-header">
      <a className="sr-only sr-only-focusable" href={skipTo}>
        {formatMessage(messages.skipNav)}
      </a>
      <div className="chd-container d-flex align-items-center">
        <a
          href={logoHref}
          className="chd-logo-link"
          aria-label={logoAlt}
          onClick={handleLinkClick}
        >
          <img className="chd-logo" src={logoSrc} alt={logoAlt} />
        </a>

        {children}

        {showUserArea && (
          <div className="chd-right ml-auto d-flex align-items-center">
            {loggedIn && renderHelp()}
            {loggedIn ? renderUserMenu() : renderLoggedOut()}
          </div>
        )}
      </div>
    </header>
  );
};

CobaltHeaderBase.propTypes = {
  skipTo: PropTypes.string,
  logo: PropTypes.string,
  logoAltText: PropTypes.string,
  logoDestination: PropTypes.string,
  avatar: PropTypes.string,
  showUserArea: PropTypes.bool,
  children: PropTypes.node,
  help: PropTypes.node,
};

CobaltHeaderBase.defaultProps = {
  skipTo: "#main",
  logo: null,
  logoAltText: null,
  logoDestination: null,
  avatar: null,
  showUserArea: true,
  children: null,
  help: null,
};

export default CobaltHeaderBase;
