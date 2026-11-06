import React from 'react';
import DefaultFooter from '@edx/frontend-component-footer';

import { getCobaltConfig } from '../cobalt-platform';
import CobaltFooterContent from './CobaltFooterContent';

// Cobalt footer for the legacy MFEs' org.openedx.frontend.layout.footer.v1
// slot. The frontend-base app does not use this file (the site has no
// frontend-component-footer): it renders CobaltFooterContent directly.
const CobaltFooter = () => {
  // Runtime kill-switch: when ENABLE_COBALT_FOOTER is falsy, fall back to
  // the default Open edX footer.
  if (!getCobaltConfig()?.ENABLE_COBALT_FOOTER) {
    return <DefaultFooter />;
  }

  return <CobaltFooterContent />;
};

export default CobaltFooter;
