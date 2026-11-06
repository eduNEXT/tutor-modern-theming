Changelog
=========

All notable changes to ``tutor-modern-theming``. Versions follow `Semantic
Versioning <https://semver.org/>`_; while the major version is 0, a breaking
change bumps the minor version.

Every release works on Tutor 21 (Ulmo) and Tutor 22 (Verawood) unless its
entry says otherwise. Pin it with ``pip install
"git+https://github.com/eduNEXT/tutor-modern-theming.git@vX.Y.Z"`` and
``MODERN_THEMING_GIT_REF: vX.Y.Z``.

0.4.0 (unreleased)
------------------

Added
~~~~~

- Cobalt desktop header and footer on the frontend-base site (Verawood
  ``instructor-dashboard`` and any other frontend-base app enabled in
  tutor-mfe), as a frontend-base app, ``cobaltApp``, that replaces the shell's
  desktop header and footer layouts. Same components, keys and fallbacks as
  the MFEs. With ``ENABLE_COBALT_HEADER`` / ``ENABLE_COBALT_FOOTER`` off, the
  shell's own header or footer renders. Built by the same ``tutor images build
  mfe``; no configuration changes. See "frontend-base site" in the README.
  Widgets that other apps add to the shell's desktop header (e.g. the
  notifications bell) still show next to the Cobalt menu.
- ``make dev-site-sync SITE=<path>`` to work on the app against a local
  frontend-base checkout.

Changed
~~~~~~~

- The components take every platform API (config, user, analytics, i18n) from
  ``frontend/cobalt-platform/``. The MFE builds now also copy
  ``cobalt-platform/index.js``. No change for tenants or for what the MFEs
  render.
- The view of the desktop header and of the footer moved to
  ``CobaltDesktopHeaderContent.jsx`` and ``CobaltFooterContent.jsx``.
  ``CobaltDesktopHeader.jsx`` and ``CobaltFooter.jsx`` keep the MFE fallback to
  the Open edX header and footer.

Notes
~~~~~

- On Tutor 21, or on Tutor 22 with every frontend-base app off, the new patches
  have no consumer: the images are built exactly as with 0.3.2.
- Not on the frontend-base site yet: the mobile header (the shell's one shows
  below 768px) and the catalog home banner.

0.3.3 (2026-11-06)
------------------

Fixed
~~~~~

- With ``ENABLE_COBALT_HEADER`` off, the MFEs showed an empty Open edX desktop
  header: the slot now wraps the default header instead of hiding it, so it
  keeps the props the MFE gives it.
- The notifications bell of ``frontend-component-header`` 8.2 (most Verawood
  MFEs) shows in the Cobalt desktop and learning headers, before Help.

0.3.2 (2026-10-30)
------------------

Fixed
~~~~~

- ``__about__.py`` reports the right version (0.3.1 shipped with 0.3.0).
  `#20 <https://github.com/eduNEXT/tutor-modern-theming/pull/20>`_

0.3.1 (2026-10-30)
------------------

Fixed
~~~~~

- The legacy header and footer use the same fallbacks as the MFE ones.
  `#19 <https://github.com/eduNEXT/tutor-modern-theming/pull/19>`_
- README: how to keep the MFE and legacy headers consistent.
  `#18 <https://github.com/eduNEXT/tutor-modern-theming/pull/18>`_

0.3.0 (2026-10-30)
------------------

Added
~~~~~

- Cobalt learning header (``frontend-app-learning``) and legacy (Mako) header.
  `#17 <https://github.com/eduNEXT/tutor-modern-theming/pull/17>`_
- README: comparison with Tutor Indigo v22.1.0.
  `#16 <https://github.com/eduNEXT/tutor-modern-theming/pull/16>`_

0.2.0 (2026-10-27)
------------------

Changed
~~~~~~~

- **Breaking**: the theme is namespaced as Cobalt. ``ENABLE_EDUNEXT_*``,
  ``FOOTER_*``, ``HEADER_*`` and ``HOME_BANNER_*`` are now ``ENABLE_COBALT_*``
  and ``COBALT_*``; rename them in the Tutor settings and in every tenant (see
  "Upgrading from the eduNEXT-named keys" in the README).
  `#15 <https://github.com/eduNEXT/tutor-modern-theming/pull/15>`_

Fixed
~~~~~

- The legacy footer uses the same font as the MFE footer.
  `#11 <https://github.com/eduNEXT/tutor-modern-theming/pull/11>`_

0.1.0 (2026-10-15)
------------------

First release.

Added
~~~~~

- MFE footer via plugin slots, delivered by copying the component into each
  MFE at build time ("Option B").
  `#7 <https://github.com/eduNEXT/tutor-modern-theming/pull/7>`_
- Config-driven catalog home banner.
  `#8 <https://github.com/eduNEXT/tutor-modern-theming/pull/8>`_
- Standard desktop header.
  `#10 <https://github.com/eduNEXT/tutor-modern-theming/pull/10>`_
- Legacy (Mako) footer that reads the same ``MFE_CONFIG`` keys.
  `#9 <https://github.com/eduNEXT/tutor-modern-theming/pull/9>`_
- ``MODERN_THEMING_GIT_REF`` defaults to the installed commit.
  `#12 <https://github.com/eduNEXT/tutor-modern-theming/pull/12>`_
