// Providing a custom `karmaConfig` to @angular/build:karma replaces its built-in base config
// entirely (it only supplies frameworks/plugins/reporters when no karmaConfig is given), so this
// file has to restate that base and layer on the one thing it actually exists for:
// `ChromeHeadlessCI`, a launcher with --no-sandbox for running as root (CI containers, this
// repo's sandboxed dev environment) — Chrome refuses to sandbox itself as root by default
// (crbug.com/638180). Point `CHROME_BIN` at your Chrome/Chromium binary via the environment when
// using it; nothing here assumes a specific machine's install path.
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],
    jasmineHtmlReporter: {
      suppressAll: true,
    },
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu'],
      },
    },
  });
};
