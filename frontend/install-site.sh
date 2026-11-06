#!/bin/sh
# Copy the Cobalt app into a frontend-base site source tree.
#
#   install-site.sh <dest>    e.g. install-site.sh /openedx/site/src/cobalt
#
# Used by the mfe-dockerfile-pre-npm-build-site patch (build) and by
# `make dev-site-sync` (local dev), so both get the same files. Only what the
# site supports is copied: the FPF wrappers (CobaltFooter.jsx,
# CobaltDesktopHeader.jsx, CobaltLearningHeader.jsx and the index.js files)
# import frontend-component-header/footer, which the site does not have.
# cobalt-platform/index.js is the frontend-base platform layer.
set -e

src=$(cd "$(dirname "$0")" && pwd)
dest=$1
if [ -z "$dest" ]; then
  echo "usage: $0 <dest>" >&2
  exit 1
fi

mkdir -p "$dest/cobalt-app" "$dest/cobalt-platform" "$dest/cobalt-header" "$dest/cobalt-footer"

cp "$src/cobalt-app/index.js" "$dest/cobalt-app/index.js"
cp "$src/cobalt-platform/frontend-base.js" "$dest/cobalt-platform/index.js"
for f in CobaltHeaderBase.jsx CobaltDesktopHeaderContent.jsx CobaltHeader.scss messages.js; do
  cp "$src/cobalt-header/$f" "$dest/cobalt-header/$f"
done
for f in CobaltFooterContent.jsx CobaltFooter.scss messages.js; do
  cp "$src/cobalt-footer/$f" "$dest/cobalt-footer/$f"
done
