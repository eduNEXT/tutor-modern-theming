import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form, useToggle, SearchField, Container,
} from '@openedx/paragon';

// Reuse the host catalog MFE's own building blocks. These resolve through the
// MFE's `@src` webpack alias because this component is copied into the catalog
// source tree at build time (Option B).
import { ROUTES } from '@src/routes';
import { HomePromoVideoButtonSlot, HomePromoVideoModalSlot } from '@src/plugin-slots/HomePromoVideoSlots';
import DefaultHomeBanner from '@src/home/components/home-banner/HomeBanner';
import '@src/home/components/home-banner/index.scss';

import messages from './messages';

const EdunextHomeBanner = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const config = getConfig();
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, open, close] = useToggle(false);

  // Runtime kill-switch: fall back to the default catalog banner when disabled.
  if (!config.ENABLE_EDUNEXT_HOME_BANNER) {
    return <DefaultHomeBanner />;
  }

  const handleSearch = () => navigate(`${ROUTES.COURSES}?search_query=${searchValue}`);

  const searchField = config.ENABLE_COURSE_DISCOVERY && (
    <Form.Group className="mt-4.5">
      <SearchField
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
        value={searchValue}
        submitButtonLocation="external"
        onChange={(value) => setSearchValue(value)}
        onSubmit={handleSearch}
      />
    </Form.Group>
  );

  // Everything customizable comes from MFE_CONFIG (getConfig()), with i18n
  // fallbacks — no varsify, no JSX override needed per tenant.
  const title = config.HOME_BANNER_TITLE
    || intl.formatMessage(messages.title, { siteName: config.SITE_NAME });
  const subtitle = config.HOME_BANNER_SUBTITLE
    || intl.formatMessage(messages.subtitle);

  // Background image/color: varsify cannot emit these catalog-specific CSS
  // vars, so they come from MFE_CONFIG and are injected as inline CSS custom
  // properties that the catalog banner SCSS already consumes.
  const bannerStyle = {};
  if (config.HOME_BANNER_BACKGROUND_IMAGE) {
    bannerStyle['--catalog-home-page-banner-background-image'] = `url(${config.HOME_BANNER_BACKGROUND_IMAGE})`;
  }
  if (config.HOME_BANNER_BACKGROUND_COLOR) {
    bannerStyle['--catalog-home-page-banner-background-color'] = config.HOME_BANNER_BACKGROUND_COLOR;
  }

  return (
    <section
      className="home-banner d-flex justify-content-center align-items-center position-relative overflow-hidden"
      data-testid="home-banner"
      style={bannerStyle}
    >
      <div className="animation-wrapper d-flex justify-content-center align-items-center flex-column p-4 my-5">
        <h1 className="display-1 text-white text-center">{title}</h1>
        <p className="lead text-white text-center mb-3">{subtitle}</p>
        <HomePromoVideoButtonSlot onClick={open} />
        <Container size="sm">
          {searchField}
        </Container>
      </div>
      <HomePromoVideoModalSlot
        isOpen={isOpen}
        close={close}
        videoId={config.HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID || ''}
      />
    </section>
  );
};

export default EdunextHomeBanner;
