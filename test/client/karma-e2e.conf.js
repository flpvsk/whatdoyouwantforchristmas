// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '../../',

    // list of files / patterns to load in the browser
    files: [
      'test/client/e2e/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 9877,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['ng-scenario'],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,

    proxies: {
      '/': 'http://localhost:3000/'
    },

    plugins: [
      'karma-jasmine',
      'karma-ng-scenario',
      'karma-script-launcher',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher'
    ],

    urlRoot: '/_karma_/',

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO
  });
};
