# Blockmason Link ERC20 Token (BLINK)

This repo contains the source code for the BLINK token contract,
along with all necessary support files for testing and deployment.

## Prerequisites

The following tools are **required** to be available in your environment:

 * `node`, provided by [Node.js][1] (>= 11.x recommended)
 * `yarn`, provided by [Yarn][2] (>= 1.13 recommended)

## Getting Started

This is a [Truffle][3] project, and follows its recommended project layout.

### Installing

As with any JavaScript project, the first thing you'll need to do is
install the project's dependencies. To do this, just run `yarn install`.
This will install the project's dependencies *locally*, and will not
otherwise pollute your environment.

### Testing

The test suite requires connectivity to a live Ethereum JSON-RPC server.
For convenience, one is included with this package. To start it, just run
`yarn start`. This will start the server in a blocking process, so make sure
to send it to the background or launch it in a separate pane/window/tab of
your preferred terminal.

Then, run `yarn test` to perform the test suite.

[1]: https://nodejs.org/
[2]: https://yarnpkg.com/
[3]: https://truffleframework.com/
