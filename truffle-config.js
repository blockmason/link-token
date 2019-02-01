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
  networks: {
    test: {
      host: '127.0.0.1',
      network_id: '*',
      port: 8545,
      websockets: true
    }
  }
};
