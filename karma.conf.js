// Karma configuration for Angular unit tests.
const fs = require('fs');
const path = require('path');

const playwrightChromiumRoot = path.join(
  process.env.LOCALAPPDATA || '',
  'ms-playwright'
);
const playwrightChromiumPath = fs.existsSync(playwrightChromiumRoot)
  ? fs
      .readdirSync(playwrightChromiumRoot)
      .filter((entry) => entry.startsWith('chromium-'))
      .sort()
      .reverse()
      .map((entry) =>
        path.join(playwrightChromiumRoot, entry, 'chrome-win64', 'chrome.exe')
      )
      .find((candidate) => fs.existsSync(candidate))
  : undefined;
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

if (!process.env.CHROME_BIN && playwrightChromiumPath) {
  process.env.CHROME_BIN = playwrightChromiumPath;
} else if (!process.env.CHROME_BIN && fs.existsSync(edgePath)) {
  process.env.CHROME_BIN = edgePath;
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      jasmine: {},
      clearContext: false,
    },
    jasmineHtmlReporter: {
      suppressAll: true,
    },
    coverageReporter: {
      dir: path.join(__dirname, './coverage/pcgamercdmx'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['progress'],
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--remote-debugging-port=9222',
        ],
      },
    },
    restartOnFileChange: true,
  });
};
