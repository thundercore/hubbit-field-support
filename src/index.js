import Web3 from 'web3';
import settings from './settings';
import abi from '../abi/usdt.json';

class TtkSend {
    constructor(web3, contractAddress) {
        this.web3 = web3; this.account = null;
        this.contractAddress = contractAddress; this.simpleFloatRegex = '';
    }

    async setup(addEventHandlers, receipt) { /* `receipt`, if present, is a we3.js transaction-receipt object */
        const addressP = document.querySelector('#address');
        const balanceP = document.querySelector('#balance');
        const refuseToWorkDiv = document.querySelector('#refuse-to-work');
        const contentDiv = document.querySelector('#my-content');
        this.value = document.querySelector('#value');
        this.toAddress = document.querySelector('#to-address');
        this.submit = document.querySelector('#submit');
        if (addEventHandlers) {
            this.value.addEventListener('input', this.onValueInput.bind(this));
            this.value.addEventListener('input', this.onInput.bind(this));
            this.toAddress.addEventListener('input', this.onInput.bind(this));
            this.submit.addEventListener('click', this.onSubmit.bind(this));
        }

        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];
        this.contract = new this.web3.eth.Contract(abi, this.contractAddress);
        // resolve multiple promises at once to hide latency
        const { contract, account } = this;
        const promises = [
            contract.methods.balanceOf(account).call(),
            contract.methods.decimals().call(),
        ];
        let r = null;
        try {
            r = await Promise.all(promises);
        } catch (error) {
            const code = await this.web3.eth.getCode(this.contractAddress);
            if (code === null || code === '' || code === '0x') {
                displayEarlyError(`No contract was deployed at address ${this.contractAddress}`);
                return;
            }
            displayEarlyError(error);
            return;
        }
        this.balance = r[0];
        this.decimals = parseInt(r[1]);
        addressP.innerHTML = `${this.account}`;
        balanceP.innerHTML = `${formatTokenValue(this.balance, this.decimals, this.web3.utils.toBN)}`;
        contentDiv.style.display = 'block';
        refuseToWorkDiv.style.display = 'none';
        // NOTE: some apps would want to make a server side API call with the `receipt` to
        // verify that funds have been transferred. Here we just display the `receipt` as a link.
        if (receipt !== undefined && receipt !== null) { appendReceipt(receipt); } else { clearMessages(); }
    }

    async onLoad() {
        return this.setup(true /* addEventHandlers */);
    }

    onInput() {
        if (this.value.value !== '' && this.toAddress.value !== '') {
            this.submit.disabled = false;
        } else {
            this.submit.disabled = true;
        }
    }

    async onSubmit() {
        const web3 = this.web3;
        const tenBn = web3.utils.toBN(10);
        const toAddress = this.toAddress.value;
        let value;
        try {
            value = strAndDecimalsToBn(this.value.value, this.decimals, web3.utils.toBN);
        } catch (error) {
            appendError(error);
            return;
        }
        const valueHexStr = `${web3.utils.toHex(value)}`;
        let receipt;
        try {
            receipt = await this.contract.methods.transfer(toAddress, valueHexStr).send({from: this.account});
            await this.setup(false /* addEventHandlers */, receipt); // update token balance
        } catch (error) {
            // Add code here to handle:
            // 1. User rejects transaction via Wallet user interface
            // 2. User has insufficient TT funds for paying gas for the transaction
            // 3. User has insufficient ERC-20 tokens for the amount they want to transfer
            appendError(error);
        }
    }

    onValueInput(event) {
        const s = event.target.value;
        console.log('onValueInput:', s, strIsValidFloat(s));
        if (!strIsValidFloat(s) && s !== '') {
            this.value.value = this.oldValueStr;
        } else {
            this.oldValueStr = s;
        }
    }
}

const isValidFloatRe = new RegExp('^[0-9]+(\\.[0-9]*)?$');
function strIsValidFloat(s) {
    return isValidFloatRe.test(s);
}

function numericStrDot2F(s) {
  if (s.length == 0) {
    return '0.00';
  } else if (s.length == 1) {
    return `0.0${s}`;
  } else if (s.length == 2) {
    return `0.${s}`;
  } else {
    return `${s.slice(0, s.length-2)}.${s.slice(s.length-2, s.length)}`;
  }
}

function formatTokenValue(val, decimals, toBN) {
    console.log('formatTokenValue: val:', val, typeof(val), 'decimals:', decimals, typeof(decimals));
    const tenBn = toBN(10);
    if (decimals < 2) {
        return val.toString();
    }
    const eMinusTwo = tenBn.pow(toBN(decimals - 2));
    return numericStrDot2F(toBN(val).div(eMinusTwo).toString());
}

// strAndDecimalsToBn('1.234', 3) -> toBN('1234')
function strAndDecimalsToBn(s, decimals, toBN) {
  let i = s.lastIndexOf('.');
  if (i === -1) {
    const input = s + '0'.repeat(decimals)
    //console.log('input:', input);
    return toBN(input);
  }
  const f = s.slice(i+1, s.length);
  const w = s.slice(0, i);
  if (decimals === 0) {
    let input;
    if (f === '0' || f === '') {
      input = w; // '123.0' -> '123', '123.' -> '123'
    }else {
      input = s; // `s` contains '.', toBN should throw exceptions
    }
    //console.log('input:', input);
    return toBN(input);
  }
  // at this point: i !== -1, decimals !== 0
  if (f.length > decimals) {
    throw new Error(`Too many digits after decimal point: ${s}, decimals: ${decimals}`);
  }
  const input = w + f + ('0'.repeat(decimals - f.length));
  //console.log('f:', f, 'input:', input);
  return toBN(input);
}

function replaceContent(s) {
    const d = document.querySelector('#refuse-to-work');
    d.innerHTML = s;
}

function displayEarlyError(e) {
    console.log('ERROR:', e);
    replaceContent(formatError(e));
}

function appendError(e) {
    console.log('ERROR:', e);
    const d = document.querySelector('#msg');
    d.innerHTML = '<p>' + formatError(e) + '</p>' + d.innerHTML;
}

function appendReceipt(receipt) {
    //console.log('Receipt:', receipt);
    const d = document.querySelector('#msg');
    d.innerHTML = `<p><a href="${settings.blockExplorerTxUrlPrefix}${receipt.transactionHash}">${receipt.transactionHash}</a></p>` + d.innerHTML;
}

function clearMessages() {
    const d = document.querySelector('#msg');
    d.innerHTML = '';
}

function formatError(e) {
    return `${e.name}: ${e.message}`
}

async function getWeb3() {
    if (settings.rpcUrl !== null) {
        //console.log('rpcUrl:', settings.rpcUrl);
        return new Web3(settings.rpcUrl);
    }
    if (!window.ethereum) {
        return null;
    }
    try {
        await window.ethereum.enable();
    } catch(error) {
        displayEarlyError(error);
    }
    return new Web3(window.ethereum);
}

window.addEventListener('DOMContentLoaded', function () {
    const getWeb3Promise = getWeb3();
    getWeb3Promise.then(function(web3) {
        if (web3 === null) {
            return;
        }
        const app = new TtkSend(web3, settings.contractAddress);
        app.onLoad();
    });
});
