module.exports = {
  "plugins": [
    "prettier"
  ],
  "extends": [
    "prettier"
  ],
  "rules": {
    "prettier/prettier": ["error",{"singleQuote": true}]
  },
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true,
    }
  },
};
