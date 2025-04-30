#!/usr/bin/env node

/**
 * Script to find deprecated UI component usages
 * 
 * This script scans the codebase for imports of deprecated UI components
 * and reports the files where they are used.
 * 
 * Usage:
 * node scripts/find-deprecated-components.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import globPkg from 'glob';

const { glob } = globPkg;

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const srcDir = path.resolve(__dirname, '../src');
const deprecatedComponentPaths = [
  '@/shared/components/ui-kit/inputs',
  '@/shared/components/ui-kit/navigation',
  '@/shared/components/ui-kit/layout',
  '@/shared/components/ui-kit/feedback',
  '@/shared/components/ui-kit/data-display',
];

// Components that have been migrated to the new library
const migratedComponents = [
  {
    name: 'SearchInput',
    oldPath: '@/shared/components/ui-kit/inputs/SearchInput',
    newPath: '@/lib/ui/inputs',
  },
  {
    name: 'BackButton',
    oldPath: '@/shared/components/ui-kit/navigation/BackButton',
    newPath: '@/lib/ui/navigation',
  },
  {
    name: 'StatusBadge',
    oldPath: '@/shared/components/ui-kit/data-display/StatusBadge',
    newPath: '@/lib/ui/data-display',
  },
  // Add more migrated components here
];

// Find all TypeScript and TSX files
const files = await glob('**/*.{ts,tsx}', {
  cwd: srcDir,
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
});

// Track results
const results = {
  deprecatedImports: [],
  totalFilesScanned: files.length,
};

// Regular expressions to match imports
const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"](.*?)['"];?/g;
const componentNameRegex = /\s*(\w+)(?:\s+as\s+\w+)?\s*/g;

// Scan each file
files.forEach(file => {
  const filePath = path.join(srcDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Look for import statements
    let importMatch;
    while ((importMatch = importRegex.exec(content)) !== null) {
      const importNames = importMatch[1];
      const importPath = importMatch[2];
      
      // Check if this is a deprecated import path
      const isDeprecatedPath = deprecatedComponentPaths.some(
        depPath => importPath.includes(depPath)
      );
      
      if (isDeprecatedPath) {
        // Extract component names from the import
        let componentMatch;
        let componentNames = [];
        const componentsString = importNames.replace(/\s+/g, '');
        
        // Split by comma to get individual components
        componentNames = componentsString.split(',');
        
        // Check which components are migrated
        const migratedComponentsFound = migratedComponents.filter(
          migratedComp => {
            return componentNames.includes(migratedComp.name) && 
                  importPath.includes(migratedComp.oldPath);
          }
        );
        
        if (migratedComponentsFound.length > 0) {
          results.deprecatedImports.push({
            file: file,
            line: content.substring(0, importMatch.index).split('\n').length,
            import: importMatch[0],
            components: migratedComponentsFound,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
});

// Print results
console.log('UI Component Library Migration Report');
console.log('====================================');
console.log(`Total files scanned: ${results.totalFilesScanned}`);
console.log(`Files with deprecated UI components: ${results.deprecatedImports.length}`);
console.log('\nDeprecated component usages:');

if (results.deprecatedImports.length === 0) {
  console.log('No deprecated component imports found. Great job!');
} else {
  results.deprecatedImports.forEach(result => {
    console.log(`\n${result.file} (line ${result.line}):`);
    console.log(`  ${result.import}`);
    console.log('  Migrate to:');
    
    result.components.forEach(comp => {
      console.log(`  import { ${comp.name} } from '${comp.newPath}';`);
    });
  });
  
  // Print migration stats
  const componentStats = migratedComponents.map(comp => {
    const usages = results.deprecatedImports.filter(
      result => result.components.some(c => c.name === comp.name)
    ).length;
    
    return {
      name: comp.name,
      usages,
    };
  });
  
  console.log('\nMigration progress:');
  componentStats.forEach(stat => {
    console.log(`- ${stat.name}: ${stat.usages} usages to migrate`);
  });
}