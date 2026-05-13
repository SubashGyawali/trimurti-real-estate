#!/usr/bin/env node

/**
 * Comprehensive secret scanning script for repository security audit
 * Scans for common sensitive patterns that shouldn't be in version control
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Patterns to search for
const sensitivePatterns = [
  // API Keys and Tokens
  { pattern: /api[_-]?key\s*[=:]\s*['"](.*?)['"]/gi, name: 'API Keys' },
  { pattern: /API[_-]?KEY\s*[=:]\s*['"](.*?)['"]/gi, name: 'API Keys (uppercase)' },
  { pattern: /token\s*[=:]\s*['"](.*?)['"]/gi, name: 'Tokens' },
  { pattern: /access[_-]?token\s*[=:]\s*['"](.*?)['"]/gi, name: 'Access Tokens' },
  { pattern: /refresh[_-]?token\s*[=:]\s*['"](.*?)['"]/gi, name: 'Refresh Tokens' },
  { pattern: /bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi, name: 'Bearer Tokens' },
  
  // Passwords and Credentials
  { pattern: /password\s*[=:]\s*['"](.*?)['"]/gi, name: 'Passwords' },
  { pattern: /passwd\s*[=:]\s*['"](.*?)['"]/gi, name: 'Passwords (passwd)' },
  { pattern: /pwd\s*[=:]\s*['"](.*?)['"]/gi, name: 'Passwords (pwd)' },
  { pattern: /secret\s*[=:]\s*['"](.*?)['"]/gi, name: 'Secrets' },
  { pattern: /credentials\s*[=:]\s*['"](.*?)['"]/gi, name: 'Credentials' },
  
  // Database URLs and Connections
  { pattern: /database[_-]?url\s*[=:]\s*['"](.*?)['"]/gi, name: 'Database URLs' },
  { pattern: /mongodb[_-]?uri\s*[=:]\s*['"](.*?)['"]/gi, name: 'MongoDB URIs' },
  { pattern: /postgres[_-]?url\s*[=:]\s*['"](.*?)['"]/gi, name: 'PostgreSQL URLs' },
  { pattern: /mysql[_-]?url\s*[=:]\s*['"](.*?)['"]/gi, name: 'MySQL URLs' },
  
  // AWS Credentials
  { pattern: /aws[_-]?access[_-]?key[_-]?id\s*[=:]\s*['"](.*?)['"]/gi, name: 'AWS Access Key' },
  { pattern: /aws[_-]?secret[_-]?access[_-]?key\s*[=:]\s*['"](.*?)['"]/gi, name: 'AWS Secret Key' },
  
  // Private Keys
  { pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY/gi, name: 'Private Keys (PEM)' },
  { pattern: /-----BEGIN\s+OPENSSH\s+PRIVATE\s+KEY/gi, name: 'OpenSSH Private Keys' },
  { pattern: /-----BEGIN\s+EC\s+PRIVATE\s+KEY/gi, name: 'EC Private Keys' },
  
  // Payment Processing
  { pattern: /stripe[_-]?key\s*[=:]\s*['"](.*?)['"]/gi, name: 'Stripe Keys' },
  { pattern: /stripe[_-]?secret\s*[=:]\s*['"](.*?)['"]/gi, name: 'Stripe Secrets' },
  { pattern: /paypal[_-]?(secret|key)\s*[=:]\s*['"](.*?)['"]/gi, name: 'PayPal Credentials' },
  
  // OAuth Credentials
  { pattern: /oauth[_-]?client[_-]?(id|secret)\s*[=:]\s*['"](.*?)['"]/gi, name: 'OAuth Credentials' },
  { pattern: /client[_-]?id\s*[=:]\s*['"](.*?)['"]/gi, name: 'Client ID' },
  { pattern: /client[_-]?secret\s*[=:]\s*['"](.*?)['"]/gi, name: 'Client Secret' },
  
  // JWT and Signing Keys
  { pattern: /jwt[_-]?secret\s*[=:]\s*['"](.*?)['"]/gi, name: 'JWT Secrets' },
  { pattern: /signing[_-]?key\s*[=:]\s*['"](.*?)['"]/gi, name: 'Signing Keys' },
  
  // Encryption Keys
  { pattern: /encryption[_-]?key\s*[=:]\s*['"](.*?)['"]/gi, name: 'Encryption Keys' },
  { pattern: /cipher[_-]?key\s*[=:]\s*['"](.*?)['"]/gi, name: 'Cipher Keys' },
  
  // Firebase and Google
  { pattern: /firebase[_-]?(key|secret|api[_-]?key)\s*[=:]\s*['"](.*?)['"]/gi, name: 'Firebase Credentials' },
  { pattern: /google[_-]?api[_-]?key\s*[=:]\s*['"](.*?)['"]/gi, name: 'Google API Keys' },
];

// Files and directories to skip
const skipPatterns = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /build/,
  /dist/,
  /out/,
  /.DS_Store/,
  /\.env\.example/,
  /\.env\.sample/,
  /package-lock\.json/,
  /yarn\.lock/,
  /pnpm-lock\.yaml/,
];

function shouldSkipPath(filePath) {
  return skipPatterns.some(pattern => pattern.test(filePath));
}

function getFilesRecursively(dir) {
  let files = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (shouldSkipPath(fullPath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        files = files.concat(getFilesRecursively(fullPath));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return files;
}

function isTextFile(filePath) {
  const textExtensions = [
    '.js', '.ts', '.jsx', '.tsx', '.json', '.yaml', '.yml',
    '.env', '.env.local', '.env.development', '.env.production',
    '.conf', '.config', '.ini', '.toml', '.xml', '.properties',
    '.sh', '.bash', '.zsh', '.py', '.java', '.go', '.rb', '.php',
    '.gradle', '.maven', '.sbt', '.cargo', '.lock', '.txt', '.md',
  ];
  
  const ext = path.extname(filePath).toLowerCase();
  return textExtensions.includes(ext) || !path.extname(filePath);
}

function scanFile(filePath) {
  try {
    // Skip large files (> 1MB)
    const stats = fs.statSync(filePath);
    if (stats.size > 1024 * 1024) {
      return [];
    }
    
    if (!isTextFile(filePath)) {
      return [];
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];
    
    for (const { pattern, name } of sensitivePatterns) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      while ((match = regex.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        findings.push({
          file: filePath,
          line: lineNumber,
          type: name,
          match: match[0].substring(0, 100), // Truncate for display
        });
      }
    }
    
    return findings;
  } catch (error) {
    // Skip files we can't read
    return [];
  }
}

function scanGitHistory() {
  try {
    console.log(`\n${colors.blue}Scanning Git history for sensitive data...${colors.reset}`);
    
    const output = execSync('git log -p --all -S "password\\|secret\\|api_key\\|token" --oneline', {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });
    
    if (output.trim().length > 0) {
      return output;
    }
    return null;
  } catch (error) {
    console.log(`${colors.yellow}Note: Git history scan skipped (git not available or error occurred)${colors.reset}`);
    return null;
  }
}

function main() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║     Repository Secret Scanner          ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);
  
  const findings = [];
  const files = getFilesRecursively('.');
  
  console.log(`${colors.blue}Scanning ${files.length} files...${colors.reset}\n`);
  
  let scannedCount = 0;
  for (const file of files) {
    const fileFindings = scanFile(file);
    findings.push(...fileFindings);
    scannedCount++;
    
    if (scannedCount % 50 === 0) {
      process.stdout.write(`\rScanned: ${scannedCount}/${files.length}`);
    }
  }
  
  console.log(`\rScanned: ${scannedCount}/${files.length}\n`);
  
  // Check git history
  const historyFindings = scanGitHistory();
  
  // Display results
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  
  if (findings.length === 0 && !historyFindings) {
    console.log(`${colors.green}✓ No sensitive data patterns found!${colors.reset}\n`);
    return 0;
  }
  
  if (findings.length > 0) {
    console.log(`${colors.red}⚠ Found ${findings.length} potential security issues:${colors.reset}\n`);
    
    const grouped = {};
    for (const finding of findings) {
      if (!grouped[finding.type]) {
        grouped[finding.type] = [];
      }
      grouped[finding.type].push(finding);
    }
    
    for (const [type, typeFindings] of Object.entries(grouped)) {
      console.log(`${colors.yellow}${type}:${colors.reset}`);
      for (const finding of typeFindings) {
        console.log(`  ${finding.file}:${finding.line}`);
        console.log(`    Match: ${finding.match}...`);
      }
      console.log();
    }
  }
  
  if (historyFindings) {
    console.log(`${colors.red}⚠ Found sensitive patterns in Git history:${colors.reset}\n`);
    console.log(historyFindings);
  }
  
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);
  
  if (findings.length === 0 && !historyFindings) {
    console.log(`${colors.green}✓ Repository appears safe to make public!${colors.reset}\n`);
    return 0;
  } else {
    console.log(`${colors.red}✗ Please review and remove the sensitive data above before making the repo public.${colors.reset}\n`);
    return 1;
  }
}

process.exit(main());
