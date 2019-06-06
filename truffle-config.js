module.exports = {
  compilers: {
    solc: {
      settings: {
        optimizer: {
          enabled: true
        }
      },
      version: '0.5.4'
    }
  },
  mocha: process.env.CI ? {
    reporter: 'xunit',
    reporterOptions: {
      output: process.env.TEST_REPORT_PATH
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
