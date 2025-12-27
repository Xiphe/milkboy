#!/bin/bash

set -e

# Parse arguments - default to Debug mode
RE_BUNDLE_ONLY=false
if [[ "$1" == "--re-bundle-only" ]] || [[ "$1" == "-rb" ]]; then
    RE_BUNDLE_ONLY=true
fi

CONFIG="Debug"
NODE_ENV="development"
if [[ "$1" == "--release" ]] || [[ "$1" == "--production" ]]; then
    CONFIG="Release"
    NODE_ENV="production"
fi

APP_DIR=$(dirname "$0")
ROOT_DIR=$(dirname "$APP_DIR")
BUILD_DIR="$APP_DIR/build"
APP_NAME="BudgetBudget.app"
APP_PATH="${BUILD_DIR}/DerivedData/Build/Products/${CONFIG}/${APP_NAME}"
RESOURCES_PATH="${APP_PATH}/Contents/Resources"
UI_DIR="${ROOT_DIR}/ui/dist"
WEBVIEW_DIR="${APP_DIR}/webview"
SERVER_CLIENT="${ROOT_DIR}/server/src/client.ts"
SERVER_BIN="${ROOT_DIR}/server/build/rpc-server"


echo "Building in ${NODE_ENV} mode..."

if [ "$RE_BUNDLE_ONLY" = false ]; then
    # Clean build directory
    rm -rf ${BUILD_DIR}
    # Build
    xcodebuild -project ${APP_DIR}/BudgetBudget.xcodeproj \
      -scheme BudgetBudget \
      -configuration ${CONFIG} \
      -derivedDataPath ${BUILD_DIR}/DerivedData \
      -quiet \
      build
fi

## bundle webview 
if [[ "$CONFIG" == "Debug" ]]; then
  deno bundle --sourcemap=inline $WEBVIEW_DIR/bootstrap.ts -o $WEBVIEW_DIR/dist/bootstrap.js
else
  deno bundle --minify $WEBVIEW_DIR/bootstrap.ts -o $WEBVIEW_DIR/dist/bootstrap.js
fi

mkdir -p ${RESOURCES_PATH}/ui

# Embed assets into index.html
deno eval "
let document = await Deno.readTextFile('${WEBVIEW_DIR}/index.html');
let bootstrapJS = await Deno.readTextFile('${WEBVIEW_DIR}/dist/bootstrap.js');
bootstrapJS = bootstrapJS.replace(/process\.env\.NODE_ENV/g, '\"${NODE_ENV}\"');
const css = await Deno.readTextFile('${UI_DIR}/styles.css');
document = document.split('<!--CLIENT-->').join('<script type=\"module\">' + bootstrapJS + '</script>');
document = document.split('<!--STYLES-->').join('<style>' + css + '</style>');
await Deno.writeTextFile('${RESOURCES_PATH}/ui/index.html', document);
"

# Copy RPC server into .app bundle
cp -r ${SERVER_BIN} ${RESOURCES_PATH}/rpc-server

## Copy final .app to build directory root
rm -rf ${BUILD_DIR}/${APP_NAME}
cp -r ${BUILD_DIR}/DerivedData/Build/Products/${CONFIG}/${APP_NAME} ${BUILD_DIR}/${APP_NAME}