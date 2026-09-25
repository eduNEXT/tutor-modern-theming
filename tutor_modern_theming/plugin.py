"""
tutor-modern-theming: eduNEXT modern theming plugin for Open edX.

Base skeleton. This module wires only the standard Tutor plugin surface —
config defaults, template rendering and patch loading — so the plugin
installs and `tutor config save` runs clean. Frontend theming components
(footer/header MFE slots) are added in a follow-up change.

Compatible with Tutor 21 (Ulmo) and Tutor 22 (Verawood): only stable
plugin APIs are used here.
"""
from __future__ import annotations

import os
from glob import glob

import importlib_resources
from tutor import hooks
from tutormfe.hooks import PLUGIN_SLOTS

from .__about__ import __version__

########################################
# CONFIGURATION
########################################

hooks.Filters.CONFIG_DEFAULTS.add_items(
    [
        ("TUTOR_MODERN_THEMING_VERSION", __version__),
    ]
)

########################################
# TEMPLATE RENDERING
########################################

hooks.Filters.ENV_TEMPLATE_ROOTS.add_items(
    [str(importlib_resources.files("tutor_modern_theming") / "templates")]
)

# Rendered to $(tutor config printroot)/env/plugins/tutor-modern-theming/<target>
hooks.Filters.ENV_TEMPLATE_TARGETS.add_items(
    [
        ("tutor-modern-theming/build", "plugins"),
        ("tutor-modern-theming/apps", "plugins"),
    ],
)

########################################
# PATCH LOADING
########################################

# Each file in tutor_modern_theming/patches/ is applied as a Tutor patch
# named after the file. The directory is intentionally empty in this base
# skeleton; theming patches are added in the follow-up.
for path in glob(
    str(importlib_resources.files("tutor_modern_theming") / "patches" / "*")
):
    if os.path.basename(path) in (".gitkeep", ".gitignore"):
        continue
    with open(path, encoding="utf-8") as patch_file:
        hooks.Filters.ENV_PATCHES.add_item(
            (os.path.basename(path), patch_file.read())
        )


########################################
# MFE FOOTER
########################################
#
# Delivery follows "Option B" (see docs/decisions/0002): the React component
# lives in this repo under frontend/edunext-footer/ and is copied into each
# MFE source tree at build time, so it compiles through the MFE's own webpack
# (SCSS and i18n stay intact) using the MFE's own react/paragon versions.
#
# No separate widget repo, no npm publish. The component is fetched from this
# same repo by git ref at build time.

# Git ref of THIS repo used to fetch the footer component during the MFE build.
# Defaults to "master"; operators SHOULD pin a tag or commit SHA in production
# for reproducible builds.
hooks.Filters.CONFIG_DEFAULTS.add_items(
    [
        ("MODERN_THEMING_GIT_REF", "master"),
    ]
)

MODERN_THEMING_REPO = "https://github.com/eduNEXT/tutor-modern-theming.git"

# MFEs whose compiled bundle exposes org.openedx.frontend.layout.footer.v1.
# authoring/Studio uses a different slot (studio_footer.v1) and is left to a
# follow-up.
MODERN_THEMING_FOOTER_MFES = [
    "account",
    "communications",
    "discussions",
    "gradebook",
    "learner-dashboard",
    "learning",
    "ora-grading",
    "profile",
]

FOOTER_SLOT_ID = "org.openedx.frontend.layout.footer.v1"

# Plugins injected into the footer slot: hide the default footer, insert
# EdunextFooter. EdunextFooter is brought into scope by the per-app
# runtime-definitions patch below, which tutor-mfe emits right before the
# addPlugins() call this config feeds — so there is no temporal-dead-zone.
FOOTER_SLOT_CONFIG = """
{
    op: PLUGIN_OPERATIONS.Hide,
    widgetId: 'default_contents',
},
{
    op: PLUGIN_OPERATIONS.Insert,
    widget: {
        id: 'modern_theming_footer',
        type: DIRECT_PLUGIN,
        RenderWidget: EdunextFooter,
    },
},
"""

for mfe in MODERN_THEMING_FOOTER_MFES:
    # 1. Delivery: fetch this repo at build time and copy the component into
    #    the MFE source tree.
    hooks.Filters.ENV_PATCHES.add_item(
        (
            f"mfe-dockerfile-pre-npm-build-{mfe}",
            "ADD --keep-git-dir=true "
            + MODERN_THEMING_REPO
            + "#{{ MODERN_THEMING_GIT_REF }} /tmp/tutor-modern-theming\n"
            + "RUN cp -r /tmp/tutor-modern-theming/frontend/edunext-footer "
            + "src/edunext-footer",
        )
    )
    # 2. Definition: bring EdunextFooter into env.config.jsx scope for this MFE.
    #    require() (not a top-level import) because env.config.jsx is shared by
    #    every MFE and only these have the copied files.
    hooks.Filters.ENV_PATCHES.add_item(
        (
            f"mfe-env-config-runtime-definitions-{mfe}",
            "const EdunextFooter = require('./src/edunext-footer').default;",
        )
    )
    # 3. Wiring: register the footer slot for this MFE.
    PLUGIN_SLOTS.add_item((mfe, FOOTER_SLOT_ID, FOOTER_SLOT_CONFIG))

# Enable the footer by default. Tenants can set
# MFE_CONFIG["ENABLE_EDUNEXT_FOOTER"] = False (via settings or eox-tenant) to
# fall back to the default Open edX footer without rebuilding.
hooks.Filters.ENV_PATCHES.add_items(
    [
        (
            "openedx-lms-development-settings",
            'MFE_CONFIG["ENABLE_EDUNEXT_FOOTER"] = True',
        ),
        (
            "openedx-lms-production-settings",
            'MFE_CONFIG["ENABLE_EDUNEXT_FOOTER"] = True',
        ),
    ]
)


########################################
# MFE HEADER (standard desktop header)
########################################
#
# Same Option B delivery as the footer. Only the STANDARD header
# (frontend-component-header's DesktopHeader) exposes a whole-header slot
# (header_desktop.v1), so this covers the MFEs that use it. The EdunextHeader
# reuses the auth data from AppContext / the slot props (login state, avatar,
# user menu) instead of rebuilding it, and reads MFE_CONFIG for the eduNEXT
# extras (HEADER_MAIN_MENU, HEADER_USER_MENU_EXTRA_LINKS).
#
# Not covered here (no whole-header slot): the learning header (LearningHeader)
# and Studio header (StudioHeader), plus the mobile header (header_mobile.v1).
# Those are follow-ups; see docs/decisions/0005.

# MFEs that render frontend-component-header's standard Header (i.e. expose
# org.openedx.frontend.layout.header_desktop.v1). Excludes learning
# (LearningHeader) and authoring (StudioHeader).
MODERN_THEMING_HEADER_MFES = [
    "account",
    "communications",
    "discussions",
    "gradebook",
    "learner-dashboard",
    "ora-grading",
    "profile",
]

HEADER_DESKTOP_SLOT_ID = "org.openedx.frontend.layout.header_desktop.v1"

HEADER_DESKTOP_SLOT_CONFIG = """
{
    op: PLUGIN_OPERATIONS.Hide,
    widgetId: 'default_contents',
},
{
    op: PLUGIN_OPERATIONS.Insert,
    widget: {
        id: 'modern_theming_desktop_header',
        type: DIRECT_PLUGIN,
        RenderWidget: EdunextDesktopHeader,
    },
},
"""

for mfe in MODERN_THEMING_HEADER_MFES:
    # 1. Delivery: copy the header component into the MFE source tree. Uses a
    #    distinct /tmp path so it does not collide with the footer's ADD.
    hooks.Filters.ENV_PATCHES.add_item(
        (
            f"mfe-dockerfile-pre-npm-build-{mfe}",
            "ADD --keep-git-dir=true "
            + MODERN_THEMING_REPO
            + "#{{ MODERN_THEMING_GIT_REF }} /tmp/tutor-modern-theming-header\n"
            + "RUN cp -r /tmp/tutor-modern-theming-header/frontend/edunext-header "
            + "src/edunext-header",
        )
    )
    # 2. Definition: bring EdunextDesktopHeader into env.config.jsx scope.
    hooks.Filters.ENV_PATCHES.add_item(
        (
            f"mfe-env-config-runtime-definitions-{mfe}",
            "const EdunextDesktopHeader = "
            "require('./src/edunext-header').default;",
        )
    )
    # 3. Wiring: register the desktop header slot for this MFE.
    PLUGIN_SLOTS.add_item((mfe, HEADER_DESKTOP_SLOT_ID, HEADER_DESKTOP_SLOT_CONFIG))

# Enable the header by default. Tenants can set
# MFE_CONFIG["ENABLE_EDUNEXT_HEADER"] = False to render the header plainly
# (base elements, no eduNEXT chrome/extras) without rebuilding.
hooks.Filters.ENV_PATCHES.add_items(
    [
        (
            "openedx-lms-development-settings",
            'MFE_CONFIG["ENABLE_EDUNEXT_HEADER"] = True',
        ),
        (
            "openedx-lms-production-settings",
            'MFE_CONFIG["ENABLE_EDUNEXT_HEADER"] = True',
        ),
    ]
)
