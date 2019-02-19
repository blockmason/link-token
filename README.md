# Blockmason Link ERC20 Token (BLINK)

[![CircleCI][4]][5]

This repo contains the source code for the BLINK token contract,
along with all necessary support files for testing and deployment.

**Contract Address**:  [`0x42bedd647e387dabec65a7dc3a3babcc68bb664d`][6] (mainnet)

> This official deployment on the Ethereum main network is based on
> the smart contract code in commit
> [`839d78be8f80fbc8b1d7c1262f672aca07b7f74c`][7], tagged **mainnet**.

This project has undergone an external security audit by
[ChainSecurity][10], and has been found to be fully ERC20-compatible
and free of known security defects. The full audit report is available
upon request.

## What is Blockmason Link?

Blockmason Link is a SaaS product that enables all developers,
regardless of blockchain experience, to build blockchain-powered apps.
By deploying and managing smart contracts through Link, developers gain
the ability to interact with their contracts as easily as that of any
other web API, and without the overhead of adding blockchain-centric
libraries or tooling to their projects.

For more information about Blockmason Link and the **BLINK** token, see the following resources:

 * [Official Website][9]
 * [Whitepaper][8]
 * [Live Product][11]

## Development

This is a [Truffle][3] project, and follows its recommended project
layout.

### Prerequisites

The following tools are **required** to be available in your
environment:

 * `node`, provided by [Node.js][1] (>= 11.x recommended)
 * `yarn`, provided by [Yarn][2] (>= 1.13 recommended)

### Installing

As with any JavaScript project, the first thing you'll need to do is
install the project's dependencies. To do this, just run
`yarn install`. This will install the project's dependencies
*locally*, and will not otherwise pollute your environment.

### Testing

The test suite requires connectivity to a live Ethereum JSON-RPC
server. For convenience, one is included with this package. To start
it, just run `yarn start`. This will start the server in a blocking
process, so make sure to send it to the background or launch it in a
separate pane/window/tab of your preferred terminal.

Then, run `yarn test` to perform the test suite.

[1]: https://nodejs.org/
[2]: https://yarnpkg.com/
[3]: https://truffleframework.com/
[4]: https://circleci.com/gh/blockmason/link-token.svg?style=svg&circle-token=e062b260cd72e3f6009e25109e7f313842a6921c
[5]: https://circleci.com/gh/blockmason/link-token
[6]: https://etherscan.io/token/0x42bedd647e387dabec65a7dc3a3babcc68bb664d
[7]: https://github.com/blockmason/link-token/blob/839d78be8f80fbc8b1d7c1262f672aca07b7f74c/contracts/BLINKToken.sol
[8]: https://blockmason.link/wp-content/uploads/2018/11/Blockmason_Link_Whitepaper.pdf
[9]: https://blockmason.link/
[10]: https://chainsecurity.com/
[11]: https://mason.link/
