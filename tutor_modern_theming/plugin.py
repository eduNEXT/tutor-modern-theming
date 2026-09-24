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
