# One Time Setup
```
$ nvm install 10
$ nvm use 10
$ npm install
```
[nvm](https://github.com/nvm-sh/nvm) is used to manage the Node.js version.

# Test App on Phone
1. Run `npm run develop-external`
2. Inspect the IP address of your development machine
3. Point the browser tab in [ThunderCore Hub](https://www.thundercore.com/thundercore-hub/) app to to http://IP-OF-YOUR-DEV-MACHINE:8080

# Normal Development
* Run `npm run develop`
* Hack on `src/index.{html,js}` to your heart's content

# References 
* [web3.js 1.2 API reference](https://web3js.readthedocs.io/en/v1.2.4/web3-eth-contract.html)

# Bundle Javascript for Production
* Run `npm run build`
* Output is `dist/main.js`

