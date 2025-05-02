/** @type {import('@babel/core').TransformOptions} */

const plugins = [
  [
    "@babel/plugin-proposal-decorators",
    {
      legacy: true,
    },
  ],
  "@babel/plugin-transform-optional-catch-binding",
  "inline-dotenv",
  "react-native-reanimated/plugin",
]

module.exports = function (api) {
  api.cache(true)
  return {
    presets: ["babel-preset-expo"],
    env: {
      production: {},
    },
    plugins,
  }
}
