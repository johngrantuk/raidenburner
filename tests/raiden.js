const axios = require('axios');
const assert = require('assert');
const clevis = require('clevis');
const web3 = require('web3');
const { expect } = require('chai');

describe('Raiden', function() {
  this.timeout(90000);

  let raidenAddress = '0x461cC5dD8cE53dB09f876644d512f52e10Aa7d88';   // This will change depending on local set up but is used to make sure Raiden is running as expected for tests.
  let tokenAddress = '0x450Ad7606971bA248Ac03270736438026EEe7813';

  let accounts = [];

  before(async function() {
    accounts = await clevis('accounts');
  });

  it("should have matching Raiden address", async function () {
    let response = await axios.get("http://localhost:5001/api/v1/address");

    console.log(response.data.our_address);
    expect(response.status, "should 200 status").to.equal(200);
    expect(response.data.our_address, "Should have matching Raiden address").to.equal(raidenAddress);
  })

  it("should confirm token is registered", async function () {
    let response = await axios.get('http://localhost:5001/api/v1/tokens');
    expect(response.status, "should 200 status").to.equal(200);

    isToken = false;

    for(var i = 0;i < response.data.length; i++){
      // console.log(response.data[i])
      if(web3.utils.toChecksumAddress(tokenAddress) == web3.utils.toChecksumAddress(response.data[i])){
        isToken = true;
        break;
      }
    }

    expect(isToken, "should confirm token is registered").to.equal(true);
  })

  it("should connect to network", async function () {
    let response = await axios({
      method: 'post',
      url: 'http://localhost:5001/api/v1/connections/' + tokenAddress,
      data: {
        funds: 2000
      }
    });

    console.log(response)
    expect(response.status, "should 200 status").to.equal(200);


  })


})
