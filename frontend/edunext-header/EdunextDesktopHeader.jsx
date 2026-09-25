import React, { useContext } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  Nav,
  Dropdown,
  Avatar,
  Button,
  Hyperlink,
} from '@openedx/paragon';

import messages from './messages';
import './EdunextHeader.scss';

// Build the authenticated user dropdown items: the standard Open edX items
// (Dashboard / Profile / Account / Sign Out) plus any extras configured via
// MFE_CONFIG.HEADER_USER_MENU_EXTRA_LINKS. Sign Out always stays last.
const buildUserMenu = (cfg, username, formatMessage) => {
  const lms = cfg.LMS_BASE_URL || '';
  const profileBase = cfg.ACCOUNT_PROFILE_URL || cfg.PROFILE_MICROFRONTEND_URL || lms;
  const accountBase = cfg.ACCOUNT_SETTINGS_URL || `${lms}/account/settings`;

  const items = [
    { txt: formatMessage(messages.dashboard), url: `${lms}/dashboard` },
    { txt: formatMessage(messages.profile), url: `${profileBase}/u/${username}` },
    { txt: formatMessage(messages.account), url: accountBase },
  ];

  (cfg.HEADER_USER_MENU_EXTRA_LINKS || []).forEach((link) => {
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

const EdunextDesktopHeader = (props) => {
  const { formatMessage } = useIntl();
  const { authenticatedUser } = useContext(AppContext);
  const cfg = getConfig();

  const loggedIn = !!authenticatedUser;
  const username = authenticatedUser?.username;
  const avatarSrc = authenticatedUser?.avatar || props.avatar;

  const logoSrc = cfg.LOGO_URL || props.logo;
  const logoAlt = cfg.SITE_NAME || props.logoAltText || 'Home';
  const logoDestination = props.logoDestination || cfg.LMS_BASE_URL || '/';

  // Main menu: MFE_CONFIG.HEADER_MAIN_MENU wins; otherwise reuse the menu the
  // host MFE already passed to the header slot (props.mainMenu).
  const mainLinks = cfg.HEADER_MAIN_MENU || props.mainMenu || [];

  const handleLinkClick = (event) => {
    sendTrackEvent('edx.bi.header.link', {
      category: 'outbound_link',
      label: event.currentTarget.getAttribute('href'),
    });
  };

  // Runtime kill-switch: when disabled, render the base elements plainly (no
  // eduNEXT skin, no configured extras). This is the closest to the default
  // header we can produce from inside the header slot.
  const enabled = cfg.ENABLE_EDUNEXT_HEADER !== false;

  const renderMainMenu = () => (
    <Nav className="ehd-main-nav" aria-label={formatMessage(messages.mainMenu)}>
      {mainLinks.map((link) => (
        <Nav.Item key={link.url}>
          <Nav.Link
            href={link.url}
            target={link.target || '_self'}
            onClick={handleLinkClick}
            className="ehd-nav-link"
          >
            {link.txt}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );

  const renderUserMenu = () => {
    const items = buildUserMenu(cfg, username, formatMessage);
    return (
      <Dropdown className="ehd-user-menu">
        <Dropdown.Toggle
          id="edunext-header-user-menu"
          variant="outline-primary"
          className="ehd-user-toggle d-inline-flex align-items-center"
        >
          <Avatar size="sm" src={avatarSrc} alt={username} className="mr-2" />
          <span className="d-none d-md-inline">{username}</span>
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight className="ehd-user-menu-content">
          {items.map((item) => (
            <Dropdown.Item key={item.url} href={item.url} onClick={handleLinkClick}>
              {item.txt}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const renderLoggedOut = () => {
    const loginUrl = cfg.LOGIN_URL || `${cfg.LMS_BASE_URL}/login`;
    const registerUrl = `${cfg.LMS_BASE_URL}/register`;
    return (
      <div className="ehd-auth-actions d-flex align-items-center">
        <Hyperlink
          destination={loginUrl}
          onClick={handleLinkClick}
          className="ehd-nav-link mr-3"
        >
          {formatMessage(messages.signIn)}
        </Hyperlink>
        <Button as="a" href={registerUrl} variant="primary" size="sm" onClick={handleLinkClick}>
          {formatMessage(messages.register)}
        </Button>
      </div>
    );
  };

  return (
    <header className={enabled ? 'edunext-header' : 'edunext-header edunext-header--plain'}>
      <a className="sr-only sr-only-focusable" href="#main">
        {formatMessage(messages.skipNav)}
      </a>
      <div className="ehd-container d-flex align-items-center">
        <a
          href={logoDestination}
          className="ehd-logo-link"
          aria-label={logoAlt}
          onClick={handleLinkClick}
        >
          <img className="ehd-logo" src={logoSrc} alt={logoAlt} />
        </a>

        {enabled && renderMainMenu()}

        <div className="ehd-right ml-auto d-flex align-items-center">
          {loggedIn ? renderUserMenu() : renderLoggedOut()}
        </div>
      </div>
    </header>
  );
};

export default EdunextDesktopHeader;
