/**
 * Auto-Seed OmniRoute Connections on Cloud Container Boot
 */
const { execSync } = require('child_process');

const CONNECTIONS = [
  {
    provider: 'gemini',
    authType: 'apikey',
    apiKey: process.env.GEMINI_API_KEY
  },
  {
    provider: 'groq',
    authType: 'apikey',
    apiKey: process.env.GROQ_API_KEY
  },
  {
    provider: 'moonshot',
    authType: 'apikey',
    apiKey: process.env.MOONSHOT_API_KEY
  },
  {
    provider: 'openrouter',
    authType: 'apikey',
    apiKey: process.env.OPENROUTER_API_KEY
  }
];

console.log('⚡ Seeding OmniRoute provider connections from environment...');
for (const conn of CONNECTIONS) {
  try {
    if (conn.apiKey && conn.apiKey.trim()) {
      console.log(`   Configuring provider: ${conn.provider}`);
      execSync(`omniroute provider add ${conn.provider} --api-key "${conn.apiKey.trim()}" --non-interactive`, { stdio: 'ignore' });
    }
  } catch (err) {
    // Ignore already added
  }
}
console.log('✅ OmniRoute provider seeding check complete.');
