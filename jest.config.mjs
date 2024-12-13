import { createDefaultEsmPreset } from 'ts-jest';

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  ...createDefaultEsmPreset(),
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  moduleNameMapper: {
    "^utils/(.*)$": "<rootDir>/src/utils/$1",
  },
  resolver: "ts-jest-resolver",
};
