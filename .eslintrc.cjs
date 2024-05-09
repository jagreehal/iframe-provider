module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'next/core-web-vitals',
    'plugin:tailwindcss/recommended',
    'plugin:valtio/recommended',
  ],
  ignorePatterns: ['**/dist/*'],
  rules: {
    'tailwindcss/no-custom-classname': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'unicorn/prevent-abbreviations': 'off',
  },
  settings: {
    tailwindcss: {
      callees: ['cn'],
      config: 'tailwind.config.js',
    },
    next: {
      rootDir: ['./'],
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
    },
  ],
  env: {
    node: true,
  },
};
