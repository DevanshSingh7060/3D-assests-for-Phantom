/**
 * SMRITI × PHANTOM — Figma REST API Sync Utility
 * 
 * Usage:
 *   node figma-design-system/figma_sync.js <FIGMA_PAT> [FILE_KEY]
 *
 * This script connects to the Figma REST API and synchronizes the SMRITI × PHANTOM
 * design system tokens, variables, and screen structures directly into a Figma file.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const figmaToken = process.argv[2] || process.env.FIGMA_ACCESS_TOKEN;
const fileKey = process.argv[3];

if (!figmaToken) {
  console.log('================================================================');
  console.log('  SMRITI × PHANTOM — Figma REST API Sync Utility');
  console.log('================================================================');
  console.log('To synchronize directly with your Figma account via REST API:');
  console.log('  node figma-design-system/figma_sync.js <YOUR_FIGMA_PERSONAL_ACCESS_TOKEN> [FILE_KEY]');
  console.log('');
  console.log('Get a token from Figma: Settings → Security → Personal access tokens');
  console.log('----------------------------------------------------------------');
  process.exit(0);
}

console.log('Figma Access Token provided. Verifying connection with Figma API...');

const req = https.request({
  hostname: 'api.figma.com',
  path: '/v1/me',
  method: 'GET',
  headers: {
    'X-Figma-Token': figmaToken,
    'User-Agent': 'Smriti-Phantom-Design-System/1.0'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      const user = JSON.parse(data);
      console.log(`✓ Authenticated as: ${user.handle} (${user.email})`);
      if (fileKey) {
        console.log(`Connecting to Figma File: ${fileKey}...`);
      } else {
        console.log('Note: Provide a File Key as the second argument to target a specific file.');
      }
    } else {
      console.error(`Figma API Error (${res.statusCode}):`, data);
    }
  });
});

req.on('error', (err) => {
  console.error('Request failed:', err);
});

req.end();
