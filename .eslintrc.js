'use strict';

module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    extends: [
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'prettier/@typescript-eslint',
        'eslint:recommended',
        'plugin:react/recommended',
    ],
    plugins: ['@typescript-eslint', 'prettier', 'react-hooks'],
    rules: {
        'prettier/prettier': 'error',
        'sort-keys': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/member-ordering': [
            'error',
            {
                default: [
                    'public-static-field',
                    'protected-static-field',
                    'private-static-field',
                    'public-instance-field',
                    'protected-instance-field',
                    'private-instance-field',
                    'public-constructor',
                    'protected-constructor',
                    'private-constructor',
                    'public-instance-method',
                    'protected-instance-method',
                    'private-instance-method',
                    'public-static-method',
                    'protected-static-method',
                    'private-static-method',
                ],
            },
        ],
        '@typescript-eslint/no-parameter-properties': 'error',
        '@typescript-eslint/no-unused-vars': 'error',
        'react/display-name': 'off',
        'react/prop-types': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
    },
    env: {
        browser: true,
        node: true,
        jest: true,
    },
};
