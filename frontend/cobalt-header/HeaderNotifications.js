// The notifications bell (org.openedx.frontend.layout.header_notifications_tray.v1)
// exists from frontend-component-header 8.2 (the Verawood MFEs). Older headers
// (Ulmo; catalog, communications and gradebook in Verawood) do not have it.
// The require is optional: webpack only warns "Module not found" for a module
// required inside try/catch, and the bell is then left out, as in the Open edX
// header of those versions.
let HeaderNotificationsSlot = null;
try {
  // eslint-disable-next-line global-require
  HeaderNotificationsSlot = require("@edx/frontend-component-header/dist/plugin-slots/HeaderNotificationsSlot").default;
} catch (e) {
  HeaderNotificationsSlot = null;
}

export default HeaderNotificationsSlot;
