module.exports = {
  compilers: {
    solc: {
      settings: {
        optimizer: {
          enabled: true
        }
      },
      version: '0.5.3'
    }
  },
  mocha: process.env.CI ? {
    reporter: 'mocha-junit-reporter',
    reporterOptions: {
      mochaFile: process.env.TEST_REPORT_PATH
    }
  } : {
    reporter: 'spec'
  },
  networks: {
    test: {
      host: '127.0.0.1',
      network_id: '*',
      port: 8545,
      websockets: true
    }
  }
};
