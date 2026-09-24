import React, { useContext, useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import DefaultFooter from '@edx/frontend-component-footer';
import {
  Hyperlink,
  Icon,
  IconButton,
} from '@openedx/paragon';
import {
  Facebook,
  BsTwitterX,
  BsLinkedin,
  BsInstagram,
  BsYoutube,
  BsGithub,
} from '@openedx/paragon/icons';

import messages from './messages';
import './EdunextFooter.scss';

const ICON_MAP = {
  facebook: Facebook,
  twitter: BsTwitterX,
  linkedin: BsLinkedin,
  instagram: BsInstagram,
  youtube: BsYoutube,
  github: BsGithub,
};

const DEFAULT_SOCIAL_LINKS = [
  { key: 'facebook', url: 'https://www.facebook.com/EdXOnline', label: 'Facebook' },
  { key: 'twitter', url: 'https://twitter.com/edXOnline', label: 'X (Twitter)' },
  { key: 'linkedin', url: 'https://www.linkedin.com/school/edx', label: 'LinkedIn' },
  { key: 'instagram', url: 'https://www.instagram.com/edxonline', label: 'Instagram' },
  { key: 'youtube', url: 'https://www.youtube.com/edx', label: 'YouTube' },
  { key: 'github', url: 'https://github.com/openedx', label: 'GitHub' },
];

const EdunextFooter = () => {
  const { formatMessage } = useIntl();
  const { config } = useContext(AppContext);
  const cfg = getConfig();

  // Read all configurable values from MFE_CONFIG via getConfig().
  // Hooks must run unconditionally, so this is computed before the
  // feature-flag early return below.
  const footerConfig = useMemo(() => ({
    logoSrc: cfg.FOOTER_LOGO_SRC || config.LOGO_TRADEMARK_URL,
    logoUrl: cfg.FOOTER_LOGO_URL || config.LMS_BASE_URL,
    logoAlt: cfg.FOOTER_LOGO_ALT || formatMessage(messages.logoAlt),
    logoTarget: cfg.FOOTER_LOGO_TARGET || '_self',

    description: cfg.FOOTER_DESCRIPTION || formatMessage(messages.tagline),

    // Navigation links: array of { title, links: [{ txt, url, target }] }
    navColumns: cfg.FOOTER_NAV_COLUMNS || [
      {
        title: formatMessage(messages.aboutTitle),
        links: [
          { txt: formatMessage(messages.aboutUs), url: `${config.LMS_BASE_URL}/about` },
          { txt: formatMessage(messages.blog), url: `${config.LMS_BASE_URL}/blog` },
          { txt: formatMessage(messages.careers), url: `${config.LMS_BASE_URL}/careers` },
          { txt: formatMessage(messages.news), url: `${config.LMS_BASE_URL}/news` },
        ],
      },
      {
        title: formatMessage(messages.legalTitle),
        links: [
          { txt: formatMessage(messages.termsOfService), url: `${config.LMS_BASE_URL}/tos` },
          { txt: formatMessage(messages.privacyPolicy), url: `${config.LMS_BASE_URL}/privacy` },
          { txt: formatMessage(messages.accessibility), url: `${config.LMS_BASE_URL}/accessibility` },
        ],
      },
      {
        title: formatMessage(messages.connectTitle),
        links: [
          { txt: formatMessage(messages.contact), url: `${config.LMS_BASE_URL}/contact` },
          { txt: formatMessage(messages.help), url: `${config.LMS_BASE_URL}/support` },
        ],
      },
    ],

    // Social links: array of { key, url, label }
    socialLinks: cfg.FOOTER_SOCIAL_LINKS || DEFAULT_SOCIAL_LINKS,

    // Extra links row (like the legacy footer_extralinks)
    extraLinks: cfg.FOOTER_EXTRA_LINKS || [],

    // Copyright text
    copyright: cfg.FOOTER_COPYRIGHT || null,

    // "Powered by" logos
    openedxLogoSrc: cfg.FOOTER_OPENEDX_LOGO_SRC || 'https://logos.openedx.org/edx-openedx-logo-tag.png',
    openedxLogoUrl: cfg.FOOTER_OPENEDX_LOGO_URL || 'https://open.edx.org/',
    openedxLogoAlt: cfg.FOOTER_OPENEDX_LOGO_ALT || formatMessage(messages.poweredByOpenEdx),

    edunextLogoSrc: cfg.FOOTER_EDUNEXT_LOGO_SRC || 'https://d1uwn6yupg8lfo.cloudfront.net/edxsites/bragi-images/logo-small21.png',
    edunextLogoUrl: cfg.FOOTER_EDUNEXT_LOGO_URL || 'https://www.edunext.co',
    edunextLogoAlt: cfg.FOOTER_EDUNEXT_LOGO_ALT || 'eduNEXT',
  }), [config, cfg, formatMessage]);

  // Runtime kill-switch: when ENABLE_EDUNEXT_FOOTER is falsy, fall back to
  // the default Open edX footer. Placed after all hooks so the rules of
  // hooks are respected.
  if (!cfg?.ENABLE_EDUNEXT_FOOTER) {
    return <DefaultFooter />;
  }

  const handleLinkClick = (event) => {
    sendTrackEvent('edx.bi.footer.link', {
      category: 'outbound_link',
      label: event.currentTarget.getAttribute('href'),
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="custom-footer">
      <div className="footer-content container-fluid">
        {/* Top section: Logo + Navigation */}
        <div className="footer-top">
          <div className="footer-brand">
            <a
              href={footerConfig.logoUrl}
              className="footer-logo-link"
              target={footerConfig.logoTarget}
              aria-label={footerConfig.logoAlt}
              onClick={handleLinkClick}
            >
              <img
                src={footerConfig.logoSrc}
                alt={footerConfig.logoAlt}
                className="footer-logo"
              />
            </a>
            {footerConfig.description && (
              <p className="footer-tagline">
                {footerConfig.description}
              </p>
            )}

            <div className="footer-nav-column" key="FollowUs">
              <h3 className="footer-nav-title">{formatMessage(messages.followUs)}</h3>
              <nav aria-label={formatMessage(messages.followUs)}>
                <ul className="footer-nav-list">
                  <div className="footer-social">
                    {footerConfig.socialLinks.map(({ key, url, label }) => {
                      const iconSrc = ICON_MAP[key];
                      if (!iconSrc) { return null; }
                      return (
                        <IconButton
                          key={key}
                          src={iconSrc}
                          iconAs={Icon}
                          alt={label}
                          onClick={(e) => {
                            handleLinkClick(e);
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                          variant="light"
                          className="footer-social-btn"
                          size="sm"
                        />
                      );
                    })}
                  </div>
                </ul>
              </nav>
            </div>
          </div>

          <div className="footer-nav-columns">
            {footerConfig.navColumns.map((column) => (
              <div className="footer-nav-column" key={column.title}>
                <h3 className="footer-nav-title">{column.title}</h3>
                <nav aria-label={column.title}>
                  <ul className="footer-nav-list">
                    {column.links.map((link) => (
                      <li key={link.url}>
                        <Hyperlink
                          destination={link.url}
                          target={link.target || '_self'}
                          onClick={handleLinkClick}
                          className="footer-link"
                        >
                          {link.txt}
                        </Hyperlink>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <hr className="footer-divider" />

        {/* Bottom section: Social + Copyright */}
        <div className="footer-bottom">
          {/* Powered-by logos */}
          {(footerConfig.openedxLogoSrc || footerConfig.edunextLogoSrc) && (
            <div className="footer-powered-by">
              <span className="footer-copyright">{formatMessage(messages.poweredBy)}</span>
              {footerConfig.openedxLogoSrc && (
                <a
                  href={footerConfig.openedxLogoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-powered-logo"
                  onClick={handleLinkClick}
                >
                  <img src={footerConfig.openedxLogoSrc} alt={footerConfig.openedxLogoAlt} />
                </a>
              )}
              {footerConfig.edunextLogoSrc && (
                <a
                  href={footerConfig.edunextLogoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-powered-logo"
                  onClick={handleLinkClick}
                >
                  <img src={footerConfig.edunextLogoSrc} alt={footerConfig.edunextLogoAlt} />
                </a>
              )}
            </div>
          )}

          <p className="footer-copyright">
            {footerConfig.copyright || formatMessage(messages.copyright, { year: currentYear })}
          </p>
        </div>

        {/* Extra links row */}
        {footerConfig.extraLinks.length > 0 && (
          <div className="footer-extra">
            <nav className="footer-extra-nav">
              {footerConfig.extraLinks.map((link) => (
                <Hyperlink
                  key={link.url}
                  destination={link.url}
                  target={link.target || '_self'}
                  onClick={handleLinkClick}
                  className="footer-link"
                >
                  {link.txt}
                </Hyperlink>
              ))}
            </nav>
          </div>
        )}
      </div>
    </footer>
  );
};

export default EdunextFooter;
