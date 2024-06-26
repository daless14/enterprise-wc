const fs = require('fs');
const path = require('path');

// Constants
const basePath = `./src/themes`;
const tokenPath = `./node_modules/ids-foundation/`;
const outputPath = `./src/assets/data/themeData/`;

const tokenFiles = {
  core: `${tokenPath}/theme-soho/core.scss`,
  semanticContrast: `${tokenPath}/theme-soho/semantic-contrast.scss`,
  semanticLight: `${tokenPath}/theme-soho/semantic-light.scss`,
  semanticDark: `${tokenPath}/theme-soho/semantic-dark.scss`,
  themeColors: `${tokenPath}/theme-soho/theme-colors.scss`
};
const themeFiles = [
  `${basePath}/default/ids-theme-default-core.scss`,
  `${basePath}/default/ids-theme-default-contrast.scss`,
  `${basePath}/default/ids-theme-default-dark.scss`,
];

// Utilities
const writeFileSync = (filePath, data) => fs.writeFileSync(filePath, data, 'utf8');

/**
 * Simple unique ID generator
 */
let idCounter = 0;
function generateUniqueId() {
  return `id-${Date.now()}-${idCounter++}`;
}

/**
 * Extracts the component name from the variable name
 * @param {string} tokenName - The CSS variable name
 * @returns {string} - The component name
 */
function extractComponentName(tokenName) {
  const match = tokenName.match(/^--ids-([^:]*?)-/);
  return match ? match[1] : '';
}

/**
 * Reads a SCSS file and returns an object of token values
 * @param {string} filePath - The path to the SCSS file
 * @param {string} type - The type for the SCSS file
 * @param {string} label - The label for the SCSS file
 * @returns {object} - An object of token values
 */
function generateTokenObjects(filePath, type = '', label = '') {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n');

  const tokenRegex = /^--ids-(.*):\s*(.*);/;
  const tokenObjects = [];

  // Parse each line
  let currentType = type;
  lines.forEach((line) => {
    // Check if the line contains a comment that sets the type
    const commentMatch = line.trim().match(/^\/\/\s*@(\w+)/);
    if (commentMatch) {
      currentType = commentMatch[1].charAt(0).toUpperCase() + commentMatch[1].slice(1);
    }

    // Check if the line contains a CSS variable declaration
    const matches = line.trim().match(tokenRegex);
    if (matches && matches.length === 3) {
      const tokenName = `--ids-${matches[1].trim()}`; // Token name
      const tokenValue = matches[2].trim(); // Token value
      const component = extractComponentName(tokenName); // Extract component name
      tokenObjects.push({
        id: generateUniqueId(),
        tokenName,
        tokenValue,
        type: currentType,
        label,
        component
      });
    }
  });

  return tokenObjects;
}

/**
 * Reads a theme SCSS file and identifies the source of each CSS variable
 * @param {string} filePath - The path to the theme SCSS file
 * @param {Array} tokenDependencies - An array of token dependencies
 * @returns {Array<object>} - An array of objects with token information
 */
function parseThemeFile(filePath, tokenDependencies) {
  // Extract theme name from file path
  const themeName = path.basename(filePath, '.scss');

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n');
  const themeTokens = [];

  // Regular expression to match CSS variable declarations
  const variableRegex = /--ids-(.*?):\s*(.*?)(?:\s*;|$)/;

  /**
   * Finds the value of a CSS variable
   * @param {string} variableName - The name of the CSS variable
   * @returns {object} - The value of the CSS variable
   */
  function findVariableValue(variableName) {
    /* eslint-disable */
    for (const tokens of tokenDependencies) {
      if (tokens.some((token) => token.tokenName === variableName)) {
        const token = tokens.find((token) => token.tokenName === variableName);
        if (token.tokenValue.match(/var\((.*?)\)/)) {
          const nestedVariableName = token.tokenValue.match(/var\((.*?)\)/)[1].trim();
          const nestedValue = findVariableValue(nestedVariableName);
          if (nestedValue) {
            return {
              id: generateUniqueId(),
              tokenName: variableName,
              tokenValue: token.tokenValue,
              type: token?.type,
              source: token.label,
              component: token.component,
              children: [nestedValue]
            };
          }
        } else {
          return {
            id: generateUniqueId(),
            tokenName: variableName,
            tokenValue: token.tokenValue,
            type: token?.type,
            source: token.label,
            component: token.component,
            children: []
          };
        }
      }
    }
    // If the variable is not found in token arrays, search within the theme file itself
    const themeVariableRegex = new RegExp(`${variableName}:\\s*(.*?)(?:\\s*;|$)`);
    for (const line of lines) {
      const themeMatch = line.trim().match(themeVariableRegex);
      if (themeMatch) {
        const value = themeMatch[1].trim();
        if (value.match(/var\((.*?)\)/)) {
          const nestedVariableName = value.match(/var\((.*?)\)/)[1].trim();
          const nestedValue = findVariableValue(nestedVariableName);
          if (nestedValue) {
            return {
              id: generateUniqueId(),
              tokenName: variableName,
              tokenValue: value,
              type: 'Semantic',
              source: 'themeFile',
              component: extractComponentName(variableName),
              children: [nestedValue]
            };
          }
        } else {
          return {
            id: generateUniqueId(),
            tokenName: variableName,
            tokenValue: value,
            type: 'Semantic',
            source: 'themeFile',
            component: extractComponentName(variableName),
            children: []
          };
        }
      }
    }
    /* eslint-enable */
    return null; // Variable not found
  }

  // Parse each line
  let type = '';
  lines.forEach((line) => {
    // Check for comments that indicate the type
    const commentMatch = line.trim().match(/^\/\/\s*@(\w+)/);
    if (commentMatch) {
      const comment = commentMatch[1];
      if (comment === 'semantic') {
        type = 'Semantic'; // Update type to 'Semantic'
      } else if (comment === 'component') {
        type = 'Component'; // Update type to 'Component'
      }
    }

    const match = line.trim().match(variableRegex);
    if (match) {
      const tokenName = `--ids-${match[1].trim()}`;
      const tokenValue = match[2].trim();
      const component = extractComponentName(tokenName); // Extract component name
      const inherited = {
        id: generateUniqueId(),
        tokenName: '',
        tokenValue: '',
        type: '',
        source: '',
        component: '',
      };

      // Check if the token value is a variable (e.g., var(--ids-color-orange-50))
      const variableMatch = tokenValue.match(/var\((.*?)\)/);
      if (variableMatch) {
        const variableName = `${variableMatch[1].trim()}`;

        inherited.tokenName = variableName;

        // Find the value of the inherited variable recursively
        const inheritedValue = findVariableValue(variableName);
        if (inheritedValue) {
          inherited.tokenValue = inheritedValue.tokenValue;
          inherited.type = inheritedValue.type;
          inherited.source = inheritedValue.source;
          inherited.component = inheritedValue.component;
          inherited.children = inheritedValue.children;
        }
      }

      // Only push inherited field if it contains values
      if (inherited.tokenName && inherited.tokenValue) {
        themeTokens.push({
          id: generateUniqueId(),
          tokenName,
          tokenValue,
          children: [inherited],
          type,
          component
        });
      } else {
        themeTokens.push({
          id: generateUniqueId(),
          tokenName,
          tokenValue,
          type,
          component
        });
      }
    }
  });

  // Add theme name to the returned object
  return { themeName, themeTokens };
}

// Token Generation
const coreTokens = generateTokenObjects(tokenFiles.core, 'Core', 'coreTokens');
const themeColorTokens = generateTokenObjects(tokenFiles.themeColors, 'Semantic', 'themeColorTokens');
const semanticLightTokens = generateTokenObjects(tokenFiles.semanticLight, 'Semantic', 'semanticLightTokens');
const semanticDarkTokens = generateTokenObjects(tokenFiles.semanticDark, 'Semantic', 'semanticDarkTokens');
const semanticContrastTokens = generateTokenObjects(tokenFiles.semanticContrast, 'Semantic', 'semanticContrastTokens');
const defaultCoreTheme = generateTokenObjects(themeFiles[0], 'Semantic', 'defaultCoreTheme');

// Theme parsing and writing to files
const themes = [
  {
    filePath: themeFiles[0],
    tokenDependencies: [coreTokens, themeColorTokens, semanticLightTokens]
  },
  {
    filePath: themeFiles[1],
    tokenDependencies: [coreTokens, themeColorTokens, defaultCoreTheme, semanticContrastTokens]
  },
  {
    filePath: themeFiles[2],
    tokenDependencies: [coreTokens, themeColorTokens, defaultCoreTheme, semanticDarkTokens]
  }
];

themes.forEach(({ filePath, tokenDependencies }) => {
  const theme = parseThemeFile(filePath, tokenDependencies);
  writeFileSync(`${outputPath}${theme.themeName}.json`, JSON.stringify(theme, null, 2));
});
