module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
    'plugin:prettier/recommended', // This must be the last extension
  ],
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    // Add any specific ESLint rule overrides here if needed in the future
    // For example, to allow console.log in development:
    // 'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
};
