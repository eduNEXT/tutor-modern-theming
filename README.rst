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

Styled MFEs: ``account``, ``catalog``, ``communications``, ``discussions``,
``gradebook``, ``learner-dashboard``, ``learning``, ``ora-grading``,
``profile``. ``catalog`` must be built from its Open edX release branch
(e.g. ``release/ulmo.3``), not ``master``, which uses frontend-base.
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

The footer reads everything from ``MFE_CONFIG`` via ``getConfig()``. Set the keys
through Tutor settings or per tenant (eox-tenant). The eduNEXT footer only
renders when ``ENABLE_EDUNEXT_FOOTER`` is ``true``; every other key is optional,
and when it is missing or empty the footer uses the fallback below.

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Key
     - If not set
   * - ``ENABLE_EDUNEXT_FOOTER``
     - The default Open edX footer is shown instead of the eduNEXT footer.
   * - ``FOOTER_LOGO_SRC``
     - ``LOGO_TRADEMARK_URL`` (the platform logo).
   * - ``FOOTER_LOGO_URL``
     - ``LMS_BASE_URL``.
   * - ``FOOTER_LOGO_ALT``
     - Translated text "Platform logo".
   * - ``FOOTER_LOGO_TARGET``
     - ``_self``.
   * - ``FOOTER_DESCRIPTION``
     - Translated text "Empowering learners everywhere with world-class
       online education."
   * - ``FOOTER_NAV_COLUMNS``
     - Three columns (About, Legal, Connect) linking to ``LMS_BASE_URL`` +
       ``/about``, ``/blog``, ``/careers``, ``/news``, ``/tos``, ``/privacy``,
       ``/accessibility``, ``/contact`` and ``/support``. Some of these pages
       may not exist on a given site; set this key in production.
   * - ``FOOTER_SOCIAL_LINKS``
     - edX/Open edX accounts on Facebook, X, LinkedIn, Instagram, YouTube
       and GitHub. Set this key in production.
   * - ``FOOTER_EXTRA_LINKS``
     - No extra links.
   * - ``FOOTER_COPYRIGHT``
     - Translated text "© {current year} eduNEXT. All rights reserved."
   * - ``FOOTER_OPENEDX_LOGO_SRC`` / ``_URL`` / ``_ALT``
     - Official "Powered by Open edX" logo, linking to https://open.edx.org/.
   * - ``FOOTER_EDUNEXT_LOGO_SRC`` / ``_URL`` / ``_ALT``
     - eduNEXT logo, linking to https://www.edunext.co.

Value formats:

- ``FOOTER_NAV_COLUMNS``: ``[{ title, links: [{ txt, url, target }] }]``
- ``FOOTER_SOCIAL_LINKS``: ``[{ key, url, label }]`` (key ∈ facebook, twitter,
  linkedin, instagram, youtube, github)
- ``FOOTER_EXTRA_LINKS``: ``[{ txt, url, target }]``

Colors come from Paragon design tokens (``--pgn-color-*``), so per-tenant
varsify variants restyle the footer without touching this plugin.

Roadmap
-------

- MFE header slot widgets.
- ``authoring``/Studio footer (``studio_footer.v1``).
- Optional ``@edx/brand`` package for global token defaults.

Contributing
------------

- Fork the repository.
- Create a feature branch.
- Submit a pull request.

License
-------

See ``pyproject.toml`` for the current license declaration.
