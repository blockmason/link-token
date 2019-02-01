module.exports = {
  env: {
    es6: true,
    mocha: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:ante/recommended',
    'plugin:ante/style'
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    },
    ecmaVersion: 6,
    sourceType: 'module'
  },
  plugins: [
    'eslint-plugin-ante'
  ]
};
