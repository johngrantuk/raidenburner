const axios = require('axios');
const web3 = require('web3');

async function CheckForToken(tokenAddress) {

  let response = await axios.get('http://localhost:5001/api/v1/tokens');

  isToken = false;
  for(var i = 0;i < response.data.length; i++){
    if(web3.utils.toChecksumAddress(tokenAddress) == web3.utils.toChecksumAddress(response.data[i])){
      isToken = true;
      break;
    }
  }

  return isToken;
}

async function OpenChannel(tokenAddress, counterPartyAddr, deposit){

  console.log('Opening Channel:');
  console.log('Token: ' + tokenAddress);
  console.log('To Address: ' + counterPartyAddr);
  console.log('Deposit (WEI): ' + deposit);
  // This can be done even if the other node holds tokens or not.
  let response = await axios({
    method: 'put',
    url: 'http://localhost:5001/api/v1/channels',
    data: {
      partner_address: counterPartyAddr,
      reveal_timeout: 10,
      settle_timeout: 21,                      // Normally 500 but set lower for testing
      token_address: tokenAddress,
      total_deposit: deposit
    }
  });

  console.log('Status: ');
  console.log(response.status);
  console.log('Data: ');
  console.log(response.data);
  /*
  {
      "channel_identifier": "0xfb43f382bbdbf209f854e14b74d183970e26ad5c1fd1b74a20f8f6bb653c1617",
      "token_network_address": "0x3C158a20b47d9613DDb9409099Be186fC272421a",
      "partner_address": "0x61C808D82A3Ac53231750daDc13c777b59310bD9",
      "token_address": "0x9aBa529db3FF2D8409A1da4C9eB148879b046700",
      "balance": 1337,
      "total_deposit": 1337,
      "state": "opened",
      "settle_timeout": 500,
      "reveal_timeout": 10
  }

  Saw:
  Status:
  201
  Data:
  { balance: 10000000000000000000,
    settle_timeout: 500,
    token_address: '0x450Ad7606971bA248Ac03270736438026EEe7813',
    state: 'opened',
    partner_address: '0xa1A39f20a905A5FB4EdDF42581A7bE133803b15A',
    token_network_identifier: '0x9DFE14Bd2328dd394Dd35723B46e7d0B6DCd8530',
    total_deposit: 10000000000000000000,
    channel_identifier: 6,
    reveal_timeout: 50 }
  */

}

async function Pay(tokenAddress, counterPartyAddr, amount){

  console.log('Making Payment:');
  console.log('Token: ' + tokenAddress);
  console.log('To Address: ' + counterPartyAddr);
  console.log('Amount (WEI): ' + amount);

  let response = await axios({
    method: 'post',
    url: 'http://localhost:5001/api/v1/payments/' + tokenAddress + '/' + counterPartyAddr,
    data: {
      amount: amount
    }
  });

  console.log('Status: ');
  console.log(response.status);
  console.log('Data: ');
  console.log(response.data);
  /*
  Status:
  200
  Data:
  { initiator_address: '0x461cC5dD8cE53dB09f876644d512f52e10Aa7d88',
    amount: 1000000000000000000,
    token_address: '0x450Ad7606971bA248Ac03270736438026EEe7813',
    secret_hash:
     '0x7dae06eeb6ab7fbd1b9fe1c8a4b6b86232067659e8f49249ce697fdcb0e6ce4c',
    target_address: '0xa1A39f20a905A5FB4EdDF42581A7bE133803b15A',
    identifier: 12722186676780580000,
    secret:
     '0xcbb413d1924a400b2baa82460ec3b372eac75228c2ac3f4a1546f7cf7a550ffd' }
  */
}

async function CloseChannel(tokenAddress, counterPartyAddr){

  console.log('Closing Channel:');
  console.log('Token: ' + tokenAddress);
  console.log('With Address: ' + counterPartyAddr);

  let response = await axios({
    method: 'patch',
    url: 'http://localhost:5001/api/v1/channels/' + tokenAddress + '/' + counterPartyAddr,
    data: {
      state: 'closed'
    }
  });

  console.log('Status: ');
  console.log(response.status);
  console.log('Data: ');
  console.log(response.data);
  /*
  Status:
  200
  Data:
  { balance: 8000000000000000000,
    settle_timeout: 500,
    token_address: '0x450Ad7606971bA248Ac03270736438026EEe7813',
    state: 'closed',
    partner_address: '0xa1A39f20a905A5FB4EdDF42581A7bE133803b15A',
    token_network_identifier: '0x9DFE14Bd2328dd394Dd35723B46e7d0B6DCd8530',
    total_deposit: 10000000000000000000,
    channel_identifier: 6,
    reveal_timeout: 50 }
  */
}

async function SettleChannel(tokenAddress, counterPartyAddr){

  console.log('Closing Channel:');
  console.log('Token: ' + tokenAddress);
  console.log('With Address: ' + counterPartyAddr);

  let response = await axios({
    method: 'patch',
    url: 'http://localhost:5001/api/v1/channels/' + tokenAddress + '/' + counterPartyAddr,
    data: {
      state: 'closed'
    }
  });

  console.log('Status: ');
  console.log(response.status);
  console.log('Data: ');
  console.log(response.data);
}


async function OpenConnection(tokenAddress, counterPartyAddr, deposit){
  // This can be done even if the other node holds tokens or not.
  let response = await axios({
    method: 'put',
    url: 'http://localhost:5001/api/v1/connections/' + tokenAddress,
    data: {
      funds: deposit
    }
  });

  console.log(response.status);
  //if(response.status != 200)
}

/*


response = axios({
  method: 'delete',
  url: 'http://localhost:5001/api/v1/connections/' + tokenAddress,

}).then((response) => {
  console.log('Should have left network')
  console.log(response)
})
*/

async function Main() {

  let tokenAddress = '0x450Ad7606971bA248Ac03270736438026EEe7813';
  let isExist = await CheckForToken(tokenAddress);
  console.log(isExist);

  // Join Network with Address 1
  let addr1 = '0xa1A39f20a905A5FB4EdDF42581A7bE133803b15A';
  let addr2 = '0xA0FE2192d084849939e18eE0685696FcD07837CB'
  await OpenChannel(tokenAddress, addr1, web3.utils.toWei('10', 'ether'))

  // Send value
}

async function Payment(){

  let tokenAddress = '0x450Ad7606971bA248Ac03270736438026EEe7813';
  let addr1 = '0xa1A39f20a905A5FB4EdDF42581A7bE133803b15A';

  await Pay(tokenAddress, addr1, web3.utils.toWei('1', 'ether'))
}

async function Close(){

  let tokenAddress = '0x450Ad7606971bA248Ac03270736438026EEe7813';
  let addr1 = '0xa1A39f20a905A5FB4EdDF42581A7bE133803b15A';

  await CloseChannel(tokenAddress, addr1)
}

Main();
// Payment();
//Close();

// GET /api/(version)/channels
// GET /api/(version)/channels/(token_address)
//GET /api/(version)/channels/(token_address)/(partner_address)
