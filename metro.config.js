/* eslint-env node */
// Learn more https://docs.expo.io/guides/customizing-metro
const { getSentryExpoConfig } = require("@sentry/react-native/metro")

/** @type {import('expo/metro-config').MetroConfig} */
const config = getSentryExpoConfig(__dirname)

config.transformer.getTransformOptions = async () => ({
  transform: {
    inlineRequires: true,
  },
})

config.resolver.sourceExts.push("cjs")

module.exports = config
