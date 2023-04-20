
/*
 * Module dependencies.
 */

import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

/*
 * Jest configuration.
 */
const jestConfig: JestConfigWithTsJest = {
  testRegex: ['\\.test\\.(ts|js)$'],
  preset: 'ts-jest',
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths)
};

export default jestConfig;
