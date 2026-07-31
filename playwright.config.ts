import { defineConfig, devices } from '@playwright/test';

function optionalChromiumProject(name: string, environmentVariable: string) {
  const executablePath = process.env[environmentVariable];

  return executablePath
    ? [
        {
          name,
          use: { ...devices['Desktop Chrome'], executablePath },
        },
      ]
    : [];
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4200',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run serve:browser:test',
    url: 'http://127.0.0.1:4200',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    ...(process.platform === 'win32'
      ? [
          {
            name: 'edge',
            use: { ...devices['Desktop Edge'], channel: 'msedge' },
          },
        ]
      : []),
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
    ...optionalChromiumProject('brave', 'BRAVE_EXECUTABLE_PATH'),
    ...optionalChromiumProject('opera', 'OPERA_EXECUTABLE_PATH'),
  ],
});
