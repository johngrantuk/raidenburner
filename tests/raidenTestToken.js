const axios = require('axios');
const web3 = require('web3');

async function test() {
  console.log('Johns');
  let response = await axios.get('http://localhost:5001/api/v1/tokens');
  console.log(response.data)
}

console.log('Start');

let testing = test();

console.log('Done');
