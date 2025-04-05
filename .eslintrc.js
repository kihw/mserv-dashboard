export default {
    "env": {
      "browser": true,
      "es2021": true,
      "node": true
    },
    "extends": [
      "eslint:recommended"
    ],
    "parserOptions": {
      "ecmaVersion": "latest",
      "sourceType": "module"
    },
    "rules": {
      "indent": ["error", 2],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "single"],
      "semi": ["error", "always"],
      "no-console": "warn",
      "no-unused-vars": "warn",
      "eqeqeq": "error",
      "complexity": ["warn", 10],
      "max-len": ["warn", { 
        "code": 120, 
        "ignoreComments": true,
        "ignoreStrings": true 
      }]
    }
  };