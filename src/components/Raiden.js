import React from 'react';
import Ruler from "./Ruler";
import Balance from "./Balance";
import {CopyToClipboard} from "react-copy-to-clipboard";
import Blockies from 'react-blockies';
import RecentTransactions from './RecentTransactions';
import { scroller } from 'react-scroll'
import i18n from '../i18n';
import axios from 'axios';
const web3 = require('web3');

const QRCode = require('qrcode.react');

let intervalLong;

export default class Raiden extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tokenAddress: '0x450Ad7606971bA248Ac03270736438026EEe7813',
      channels: [],
      receiverAddress: '',
      depositAmount: 0,
      nodeDetails: 'http://localhost:5001',
      raidenAddress: 'Click Check Raiden'
    }
  }
  componentDidMount(){
    console.log('Mounted');
    // this.GetChannels(this.state.tokenAddress);
    intervalLong = setInterval(this.GetChannels.bind(this), 1000, this.state.tokenAddress);
  }
  componentWillUnmount() {
    clearInterval(intervalLong);
  }
  longPoll() {
    axios.get("https://api.coinmarketcap.com/v2/ticker/1027/")
     .then((response)=>{
       let ethprice = response.data.data.quotes.USD.price;
       //this.setState({ethprice})
       console.log('Price: ' + ethprice)
     })

     axios.get(this.state.nodeDetails + "/api/v1/address")
      .then((response)=>{
        console.log(response.data.our_address)
      })
  }
  async GetChannels(tokenAddress){
    try{
      let response = await axios({
        method: 'get',
        url: this.state.nodeDetails + '/api/v1/channels'
      });
      /*
      console.log(response.status);
      console.log(typeof(response.data));
      console.log('Channels:');
      console.log(response.data);
      */

      let chs = [];

      for(var i = 0;i < response.data.length;i++){

        let state = <h5>Channel Is In A Funny State {response.data[i].state} ID: {response.data[i].channel_identifier}</h5>;

        let payBtn = '';
        let closeBtn = '';
        const id = response.data[i].channel_identifier;
        const amountId = "payamount_" + id;
        const partnerId = "partner_" + id;

        if(response.data[i].state == 'closed'){
          state = <h5>Channel Is Closed ID: {response.data[i].channel_identifier}</h5>;
        }else if(response.data[i].state == 'opened'){

          state = <h5>Channel Is Open ID: {response.data[i].channel_identifier}</h5>;

          payBtn =
          <div>
          <label htmlFor="amount_input">Payment Amount</label>
          <input type="text" className="form-control" id={amountId} placeholder="10000000000000000000"/>
          <button name="pay" className={`btn btn-lg w-100`} style={this.props.buttonStyle.primary} onClick={() => this.payChannel(id)}>
            Pay Partner
          </button>
          </div>

          closeBtn =
          <button name="close" className={`btn btn-lg w-100`} style={this.props.buttonStyle.primary} onClick={() => this.closeChannel(id)}>
            Close Channel
          </button>

        }else if(response.data[i].state == 'settled'){
          state = <h5>Channel Is Settled ID: {response.data[i].channel_identifier}</h5>;
        }

        chs.push(
          <div className="content row">
            <div className="form-group w-100">
                {state}
                <label htmlFor="amount_input">Partner Address</label>
                <input type="text" className="form-control" id={partnerId} value={response.data[i].partner_address} disabled/>
                <label htmlFor="amount_input">Balance</label>
                <input type="text" className="form-control" value={response.data[i].balance} disabled/>
                <label htmlFor="amount_input">Deposit</label>
                <input type="text" className="form-control" value={response.data[i].total_deposit} disabled/>
                {closeBtn}
                {payBtn}
            </div>
          </div>
        )

      }
      //if(response.status != 200);
      this.setState({channels: chs})
      return response.data;
    }catch(err){
      console.log('Channels Error: ');
      console.log(err);
      // this.setState({channels: []});
    }
  }

  checkRaiden = async () => {
    console.log('Checking Raiden Setup');
    try{
      let response = await axios.get(this.state.nodeDetails + '/api/v1/address');

      console.log('Raiden Address: ' + response.data.our_address);
      this.setState({raidenAddress: response.data.our_address})

      response = await axios.get(this.state.nodeDetails + '/api/v1/tokens');

      let isToken = false;
      for(var i = 0;i < response.data.length; i++){
        if(web3.utils.toChecksumAddress(this.state.tokenAddress) == web3.utils.toChecksumAddress(response.data[i])){
          isToken = true;
          break;
        }
      }

      if(isToken){
        this.props.changeAlert({type: 'success', message: "The token is registered on Raiden"});
        this.GetChannels(this.state.tokenAddress);
      }
      else{
        this.props.changeAlert({type: 'warning', message: "The token is NOT registered on Raiden"});
        this.setState({channels: []})
      }
    }catch(err){
      this.props.changeAlert({type: 'danger', message: err.toString()});
    }
  }

  openChannel = async () => {
    try{
      const deposit = this.state.depositAmount;
      const tokenAddress = this.state.tokenAddress;
      const counterPartyAddr = this.state.receiverAddress;
      console.log('Opening Channel:');
      console.log('Token: ' + tokenAddress);
      console.log('To Address: ' + counterPartyAddr);
      console.log('Deposit (WEI): ' + deposit);
      // This can be done even if the other node holds tokens or not.
      let response = await axios({
        method: 'put',
        url: this.state.nodeDetails + '/api/v1/channels',
        data: {
          partner_address: counterPartyAddr,
          reveal_timeout: 10,
          settle_timeout: 500,                      // settle_timeout must be in range [500, 555428]
          token_address: tokenAddress,
          total_deposit: deposit
        }
      });

      console.log('Status: ');
      console.log(response.status);
      console.log('Data: ');
      console.log(response.data);

      if(response.status == 200){
        this.props.changeAlert({type: 'success', message: "Channel Open"});
      }else {
        this.props.changeAlert({type: 'warning', message: "Issue Sending. Code: " + response.status});        // This would be improved
      }

      this.GetChannels(this.state.tokenAddress);
    }catch(err){
      this.props.changeAlert({type: 'danger', message: err.toString()});
    }
  }

  closeChannel = async (ID) => {

    const tokenAddress = this.state.tokenAddress;
    const partnerId = "partner_" + ID;
    const counterPartyAddr = document.getElementById(partnerId).value;

    console.log('Closing Channel:');
    console.log('Token: ' + tokenAddress);
    console.log('With Address: ' + counterPartyAddr);
    try{
      let response = await axios({
        method: 'patch',
        url: this.state.nodeDetails + '/api/v1/channels/' + tokenAddress + '/' + counterPartyAddr,
        data: {
          state: 'closed'
        }
      });

      console.log('Status: ');
      console.log(response.status);
      console.log('Data: ');
      console.log(response.data);

      if(response.status == 200){
        this.props.changeAlert({type: 'success', message: "Channel Closed. Wait For Settle."});
      }else {
        this.props.changeAlert({type: 'warning', message: "Issue Sending. Code: " + response.status});        // This would be improved
      }
    }catch(err){
      this.props.changeAlert({type: 'danger', message: err.toString()});
    }
  }

  payChannel = async (ID) => {
    const amountId = "payamount_" + ID;
    const amount = document.getElementById(amountId).value;
    const tokenAddress = this.state.tokenAddress;
    const partnerId = "partner_" + ID;
    const counterPartyAddr = document.getElementById(partnerId).value;

    console.log('Making Payment: ' +  + ID);
    console.log('Token: ' + tokenAddress);
    console.log('To Address: ' + counterPartyAddr);
    console.log('Amount (WEI): ' + amount);

    try{
      let response = await axios({
        method: 'post',
        url: this.state.nodeDetails + '/api/v1/payments/' + tokenAddress + '/' + counterPartyAddr,
        data: {
          amount: amount
        }
      });

      console.log('Status: ');
      console.log(response.status);
      console.log('Data: ');
      console.log(response.data);
      if(response.status == 200){
        this.props.changeAlert({type: 'success', message: "Payment Complete 💸"});
      }else {
        this.props.changeAlert({type: 'warning', message: "Issue Sending. Code: " + response.status});        // This would be improved
      }

      // Reload balance, etc
      this.GetChannels(this.state.tokenAddress);
    }catch(err){
      this.props.changeAlert({type: 'danger', message: err.toString()});
    }
  }

  render() {
    let {dollarDisplay,view,buttonStyle,ERC20TOKEN,address, balance, changeAlert, changeView, subBalanceDisplay,account} = this.props

    const channelsList = this.state.channels;

    return (
      <div>

        <div className="content row">
          <div className="form-group w-100">
            <div className="form-group w-100">
              <label htmlFor="amount_input">Node Details</label>
              <div className="input-group">
                <input type="text" className="form-control" placeholder="http://localhost:5001"
                  value={this.state.nodeDetails}
                  onChange={event => this.setState({nodeDetails: event.target.value})}
                />

              </div>
            </div>
          </div>
        </div>

        <div className="content row">
          <div className="form-group w-100">
            <div className="form-group w-100">
              <label htmlFor="amount_input">Node Address</label>
              <div className="input-group">
                <input type="text" className="form-control" placeholder="Click Check Raiden"
                  value={this.state.raidenAddress} disabled
                />

              </div>
            </div>
          </div>
        </div>

        <div className="content row">
          <div className="form-group w-100">
            <div className="form-group w-100">
              <label htmlFor="amount_input">Token Address</label>
              <div className="input-group">
                <input type="text" className="form-control" placeholder="0x450Ad7606971bA248Ac03270736438026EEe7813"
                  value={this.state.tokenAddress}
                  onChange={event => this.setState({tokenAddress: event.target.value})}
                />

              </div>
            </div>
          </div>
        </div>

        <button name="confirm" className={`btn btn-lg w-100`} style={this.props.buttonStyle.primary} onClick={this.checkRaiden}>
          Check Raiden
        </button>

        <div style={{width:"100%",textAlign:'center',padding:20}}>
          <h2>
            Available Channels
          </h2>
        </div>

        {channelsList}

        <div style={{width:"100%",textAlign:'center',padding:20}}>
          <h2>
            Open A Channel
          </h2>
        </div>

        <div className="content row">
          <div className="form-group w-100">
            <div className="form-group w-100">
              <label htmlFor="amount_input">Receiver Address</label>
              <div className="input-group">
                <input type="text" className="form-control" placeholder="0x450Ad7606971bA248Ac03270736438026EEe7813"
                  value={this.state.receiverAddress}
                  onChange={event => this.setState({receiverAddress: event.target.value})}
                />

              </div>

              <label htmlFor="amount_input">Deposit Amount</label>
              <div className="input-group">
                <input type="text" className="form-control" placeholder="0"
                  value={this.state.depositAmount}
                  onChange={event => this.setState({depositAmount: event.target.value})}
                />

              </div>
            </div>
          </div>
        </div>

        <button name="open" className={`btn btn-lg w-100`} style={this.props.buttonStyle.primary}
                onClick={this.openChannel}>
          Open Channel
        </button>

        <div name="theVeryBottom" className="text-center bottom-text">
          <span style={{padding:10}}>
            <a href="#" style={{color:"#FFFFFF"}} onClick={()=>{this.props.goBack()}}>
              <i className="fas fa-times"/> {i18n.t('cancel')}
            </a>
          </span>
        </div>
      </div>
    )
  }
}
