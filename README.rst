Tutor Modern Theming
====================

⚠️ Warning
----------

This is an ``alpha`` / ``pilot`` version of the plugin. Expect changes and instability.

Overview
--------

``tutor-modern-theming`` is a Tutor plugin by eduNEXT that brings modern,
token-based theming to Open edX Micro-Frontends (MFEs) through the Frontend
Plugin Framework (plugin slots).

This is the base skeleton: it installs cleanly and exposes the standard Tutor
plugin surface (config defaults, template rendering, patch loading). The
theming components (footer/header MFE slot widgets) are added in follow-up
changes.

Compatibility
-------------

Supported and tested with:

- Tutor 21 (Ulmo)
- Tutor 22 (Verawood)

Installation
------------

.. code-block:: bash

    pip install git+https://github.com/eduNEXT/tutor-modern-theming.git@<branch-or-tag>

Enable the plugin and save the configuration:

.. code-block:: bash

    tutor plugins enable tutor-modern-theming
    tutor config save

MFE Footer
----------

The plugin ships a React footer (``frontend/edunext-footer/``) and injects it
into the ``org.openedx.frontend.layout.footer.v1`` slot of every styled MFE,
hiding the default footer. Delivery uses "Option B" (see
``docs/decisions/0002``): the component is fetched from this repo by git ref at
build time and copied into each MFE source tree, so it compiles through the
MFE's own webpack — SCSS and i18n stay intact — using the MFE's own
react/paragon versions. No separate widget repo, no npm publishing.

Styled MFEs: ``account``, ``communications``, ``discussions``, ``gradebook``,
``learner-dashboard``, ``learning``, ``ora-grading``, ``profile``.
(``authoring``/Studio uses a different slot and is a follow-up.)

Pin the source ref for reproducible builds
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``MODERN_THEMING_GIT_REF`` selects which ref of this repo the MFE build pulls
the component from. It defaults to ``master``; pin a tag or commit SHA in
production:

.. code-block:: bash

    tutor config save --set MODERN_THEMING_GIT_REF=<tag-or-sha>
    tutor images build mfe

Configuration
-------------

The footer reads everything from ``MFE_CONFIG`` via ``getConfig()``. All keys
are optional and fall back to sensible defaults; set them through Tutor
settings or per-tenant (eox-tenant).

- ``ENABLE_EDUNEXT_FOOTER`` (bool, default ``True``): when false, the MFE
  renders the default Open edX footer instead — a runtime kill-switch that
  needs no rebuild.
- ``FOOTER_LOGO_SRC`` / ``FOOTER_LOGO_URL`` / ``FOOTER_LOGO_ALT`` /
  ``FOOTER_LOGO_TARGET``
- ``FOOTER_DESCRIPTION``
- ``FOOTER_NAV_COLUMNS``: ``[{ title, links: [{ txt, url, target }] }]``
- ``FOOTER_SOCIAL_LINKS``: ``[{ key, url, label }]`` (key ∈ facebook, twitter,
  linkedin, instagram, youtube, github)
- ``FOOTER_EXTRA_LINKS``: ``[{ txt, url, target }]``
- ``FOOTER_COPYRIGHT``
- ``FOOTER_OPENEDX_LOGO_*`` / ``FOOTER_EDUNEXT_LOGO_*``

Colors come from Paragon design tokens (``--pgn-color-*``), so per-tenant
varsify variants restyle the footer without touching this plugin.

MFE Home Banner (catalog)
-------------------------

The plugin also ships a custom home banner (``frontend/edunext-home-banner/``)
and injects it into the catalog MFE's ``org.openedx.frontend.catalog.home_page.banner``
slot, hiding the default banner. Same delivery as the footer (Option B); the
component reuses the catalog MFE's own building blocks via its ``@src`` alias.

Everything customizable comes from ``MFE_CONFIG`` (not varsify — varsify cannot
emit the catalog-specific CSS vars):

- ``ENABLE_EDUNEXT_HOME_BANNER`` (bool, default ``True``): runtime kill-switch;
  when false the default catalog banner renders instead.
- ``HOME_BANNER_BACKGROUND_IMAGE``: absolute image URL, injected as the
  ``--catalog-home-page-banner-background-image`` CSS var the banner SCSS reads.
- ``HOME_BANNER_BACKGROUND_COLOR``: optional background color CSS var.
- ``HOME_BANNER_TITLE`` / ``HOME_BANNER_SUBTITLE``: banner heading and subtitle
  (fall back to i18n defaults when unset).

Use varsify only for Paragon colors; the banner image/title/subtitle are
MFE_CONFIG, per-tenant, no rebuild.
Legacy (Django/Mako) footer
---------------------------

The plugin also ships a legacy footer (``legacy/footer.html``, Mako) that reads
the **same** ``FOOTER_*`` ``MFE_CONFIG`` keys as the React MFE footer. This keeps
legacy Django pages and the MFEs consistent from a single config source — two
thin renderers, one config — without compiling React into Django (see
``docs/decisions/0004``).

It is delivered by overriding edx-platform's core ``lms/templates/footer.html``
at openedx image build time (same git-ref delivery as the MFE side). Legacy
pages don't reliably expose Paragon tokens, so the legacy footer palette is
self-contained with an optional ``FOOTER_BACKGROUND_COLOR`` override.

.. warning::

   This overrides the **core** footer template. A comprehensive theme that ships
   its own ``lms/templates/footer.html`` (e.g. ``bragi``) takes precedence over
   the core one; on such sites, drop the theme's footer override for this to take
   effect. Content parity is config-driven; **structure** changes must be kept in
   sync across both renderers (``frontend/edunext-footer/`` and
   ``legacy/footer.html``).
MFE Header (standard desktop)
-----------------------------

The plugin ships an eduNEXT desktop header (``frontend/edunext-header/``) and
injects it into ``org.openedx.frontend.layout.header_desktop.v1`` (Hide default
+ Insert) for the MFEs that use ``frontend-component-header``'s standard header.
Only that header exposes a whole-header slot; the ``learning`` and ``authoring``
headers, and the mobile header, are follow-ups (see ``docs/decisions/0005``).

Styled MFEs: ``account``, ``communications``, ``discussions``, ``gradebook``,
``learner-dashboard``, ``ora-grading``, ``profile``.

The header reuses the session data from ``AppContext`` (login state, avatar,
username) instead of rebuilding it, keeps the base logged-in / logged-out
buttons, and reads ``MFE_CONFIG``:

- ``ENABLE_EDUNEXT_HEADER`` (bool, default ``True``): when false, renders the
  base elements plainly (no eduNEXT chrome/extras).
- ``HEADER_MAIN_MENU``: ``[{ txt, url, target }]`` — main navigation links
  (falls back to the menu the host MFE passes to the slot).
- ``HEADER_USER_MENU_EXTRA_LINKS``: ``[{ txt, url }]`` — appended to the user
  dropdown, before "Sign Out".

Colors come from Paragon design tokens (``--pgn-color-*``), varsify per tenant,
same as the footer.

Roadmap
-------

- Mobile header (``header_mobile.v1``), learning header and Studio header.
- ``authoring``/Studio footer (``studio_footer.v1``).
- Legacy (Mako) header sharing the same ``HEADER_*`` config.
- Optional ``@edx/brand`` package for global token defaults.

Contributing
------------

- Fork the repository.
- Create a feature branch.
- Submit a pull request.

License
-------

See ``pyproject.toml`` for the current license declaration.
