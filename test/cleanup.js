import { dropDatabase } from './helpers.js';

/**
 * Drop the database after running all tests
 */
export function teardown() {
  dropDatabase();
}
