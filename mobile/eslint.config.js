// https://docs.expo.dev/guides/using-eslint/
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier/flat');

module.exports = defineConfig([expoConfig, prettier, globalIgnores(['dist/**', '.expo/**', 'expo-env.d.ts'])]);
