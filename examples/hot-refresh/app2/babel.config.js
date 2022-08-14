module.exports = {
  presets: [
    ["@babel/preset-env", {
      targets: {
        browsers: ["> 1%", "last 2 versions", "not ie <= 8"],
      },
    }],
  ],
  plugins: [
    "@babel/plugin-transform-runtime",
    "transform-react-jsx",
    "react-refresh/babel",
  ],
  sourceType: "unambiguous"
}