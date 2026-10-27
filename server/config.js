/**
 * Server Configuration & Security Settings
 */

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'karunya_dsa_secure_secret_key_2026',
  JWT_EXPIRES_IN: '8h',
  ADMIN_CREDENTIALS: {
    username: process.env.ADMIN_USER || 'admin',
    // In production, password hash is used. Default demonstration password for Karunya Admin:
    password: process.env.ADMIN_PASSWORD || 'karunya123',
    role: 'ADMIN',
  },
};
