import { createElement, useEffect, useState } from "react";
import { WidgetOperationTypes } from "@openedx/frontend-base";

import { COBALT_APP_ID, getCobaltConfig } from "../cobalt-platform";
import CobaltDesktopHeaderContent from "../cobalt-header/CobaltDesktopHeaderContent";
import CobaltFooterContent from "../cobalt-footer/CobaltFooterContent";

// Cobalt app for the frontend-base site (Verawood+). The build copies the
// components here with cobalt-platform/frontend-base.js as the platform layer
// and registers this app with addApp(siteConfig, cobaltApp).
//
// Each operation REPLACEs the shell's desktop layout widget (relatedId) with
// ours (id). frontend-base drops an operation whose condition is not met
// before applying any, so with ENABLE_COBALT_* off (tenant MFE_CONFIG, read on
// every render) the shell's own APPEND stays and its default header/footer
// renders. Nothing from Open edX has to be imported as a fallback.
const isEnabled = (key) => !!getCobaltConfig()[key];

// Same breakpoint as the shell's DesktopLayout/MobileLayout (and
// CobaltHeader.scss). The widget we replace hides itself below it so the
// shell's mobile header shows, exactly like the legacy MFEs, where Cobalt only
// fills header_desktop.v1.
const MOBILE_QUERY = "(max-width: 768px)";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_QUERY).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (event) => setIsMobile(event.matches);
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isMobile;
};

const CobaltSiteDesktopHeader = () =>
  useIsMobile() ? null : createElement(CobaltDesktopHeaderContent);

/** @type {import("@openedx/frontend-base").App} */
export const cobaltApp = {
  appId: COBALT_APP_ID,
  // An app config, even empty, so getAppConfig(COBALT_APP_ID) returns
  // commonAppConfig (the tenant MFE_CONFIG) merged in.
  config: {},
  slots: [
    {
      slotId: "org.openedx.frontend.slot.header.desktop.v1",
      id: "io.edunext.frontend.widget.cobalt.headerDesktop.v1",
      relatedId: "org.openedx.frontend.widget.header.desktopLayout.v1",
      op: WidgetOperationTypes.REPLACE,
      component: CobaltSiteDesktopHeader,
      condition: {
        callback: () => isEnabled("ENABLE_COBALT_HEADER"),
      },
    },
    {
      slotId: "org.openedx.frontend.slot.footer.desktop.v1",
      id: "io.edunext.frontend.widget.cobalt.footerDesktop.v1",
      relatedId: "org.openedx.frontend.widget.footer.desktopLayout.v1",
      op: WidgetOperationTypes.REPLACE,
      component: CobaltFooterContent,
      condition: {
        callback: () => isEnabled("ENABLE_COBALT_FOOTER"),
      },
    },
  ],
};

export default cobaltApp;
