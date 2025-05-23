'use strict';

const bcrypt = require('bcrypt');
const saltRounds = 10; // Defines the complexity of the hashing algorithm. Higher is more secure but slower.

/**
 * Hashes a plaintext password using bcrypt.
 * Bcrypt automatically handles salting.
 * @param {string} plaintextPassword - The password to hash.
 * @returns {Promise<string>} A promise that resolves to the hashed password string.
 */
async function hashPassword(plaintextPassword) {
  // bcrypt.hash is an asynchronous function that takes the plaintext and saltRounds.
  return await bcrypt.hash(plaintextPassword, saltRounds);
}

/**
 * Compares a plaintext password with a previously generated bcrypt hash.
 * @param {string} plaintextPassword - The plaintext password to compare.
 * @param {string} hash - The bcrypt hash (usually retrieved from the database).
 * @returns {Promise<boolean>} A promise that resolves to true if the password matches the hash, false otherwise.
 */
async function comparePassword(plaintextPassword, hash) {
  // bcrypt.compare is an asynchronous function that securely compares the plaintext against the hash.
  return await bcrypt.compare(plaintextPassword, hash);
}

module.exports = {
  hashPassword,
  comparePassword,
};
