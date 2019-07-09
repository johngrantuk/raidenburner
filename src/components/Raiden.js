import React from 'react';
import Ruler from "./Ruler";
import Balance from "./Balance";
import {CopyToClipboard} from "react-copy-to-clipboard";
import Blockies from 'react-blockies';
import RecentTransactions from './RecentTransactions';
import { scroller } from 'react-scroll'
import i18n from '../i18n';
import axios from 'axios';

const QRCode = require('qrcode.react');

export default class Raiden extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tokenAddress: '0x450Ad7606971bA248Ac03270736438026EEe7813',
      channels: [],
      receiverAddress: '',
      depositAmount: 0,
      nodeDetails: 'http://localhost:5001'
    }
  }
  componentDidMount(){
    console.log('Mounted');
    this.longPoll();
    this.GetChannels(this.state.tokenAddress);
  }
  longPoll() {
    axios.get("https://api.coinmarketcap.com/v2/ticker/1027/")
     .then((response)=>{
       let ethprice = response.data.data.quotes.USD.price;
       //this.setState({ethprice})
       console.log('Price: ' + ethprice)
     })

     axios.get("http://localhost:5001/api/v1/address")
      .then((response)=>{
        console.log(response.data.our_address)
      })
  }
  async GetChannels(tokenAddress){
    let response = await axios({
      method: 'get',
      url: 'http://localhost:5001/api/v1/channels'
    });

    console.log(response.status);
    console.log(typeof(response.data));
    console.log('Channels:');
    console.log(response.data);

    let chs = [];

    for(var i = 0;i < response.data.length;i++){
      /*
      balance: 0
      channel_identifier: 10
      partner_address: "0xA0FE2192d084849939e18eE0685696FcD07837CB"
      reveal_timeout: 50
      settle_timeout: 500
      state: "closed"
      token_address: "0x450Ad7606971bA248Ac03270736438026EEe7813"
      token_network_identifier: "0x9DFE14Bd2328dd394Dd35723B46e7d0B6DCd8530"
      total_deposit: 0
      */
      chs.push({
        id: response.data[i].channel_identifier,
        balance: response.data[i].balance,
        partner_address: response.data[i].partner_address,
        reveal_timeout: response.data[i],
        settle_timeout: response.data[i],
        state: response.data[i].state,
        token_address: response.data[i].token_address,
        total_deposit: response.data[i].total_deposit
      })

    }

    //if(response.status != 200);
    this.setState({channels: chs})
    return response.data;
  }

  checkRaiden = async () => {
    console.log('Checking Raiden Setup')
  }

  openChannel = async () => {
    console.log('Openning Channel')
  }

  render() {
    let {dollarDisplay,view,buttonStyle,ERC20TOKEN,address, balance, changeAlert, changeView, subBalanceDisplay,account} = this.props


    let qrSize = Math.min(document.documentElement.clientWidth,512)-90
    let qrValue = address;

    const channels = this.state.channels;

    const channelsList = channels.map((channel) => {
      /*
      balance: 0
      channel_identifier: 10
      partner_address: "0xA0FE2192d084849939e18eE0685696FcD07837CB"
      reveal_timeout: 50
      settle_timeout: 500
      state: "closed"
      token_address: "0x450Ad7606971bA248Ac03270736438026EEe7813"
      token_network_identifier: "0x9DFE14Bd2328dd394Dd35723B46e7d0B6DCd8530"
      total_deposit: 0
      */
      console.log('?')
      console.log(channel);

      return (
        <li>
          ID: {channel.id} Partner: {channel.partner_address} Deposit: {channel.total_deposit}
          <button>
            Send
          </button>
        </li>
        /*
        <li>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
        */
      );
    });

    return (
      <div>
        <div className="send-to-address w-100">
          <CopyToClipboard text={address} onCopy={() => {
            changeAlert({type: 'success', message: i18n.t('receive.address_copied')})
          }}>
            <div className="content qr row" style={{cursor:"pointer"}}>

              <div className="input-group">
                <input type="text" className="form-control" style={{color:"#999999"}} value={address} disabled/>
                <div className="input-group-append">
                  <span className="input-group-text"><i style={{color:"#999999"}}  className="fas fa-copy"/></span>
                </div>
              </div>
            </div>
          </CopyToClipboard>
          <div style={{width:"100%",textAlign:'center',padding:20}}>
            <a href={"https://blockscout.com/poa/dai/address/"+address+"/transactions"} target="_blank">
              View on Blockscout
            </a>
          </div>
        </div>

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

        <button name="confirm" className={`btn btn-lg w-100`} style={this.props.buttonStyle.primary}
                onClick={this.checkRaiden}>
          Check Raiden
        </button>

        <div style={{width:"100%",textAlign:'center',padding:20}}>
          <h2>
            Available Channels
          </h2>
        </div>

        <div className="content row">
          <ul>{channelsList}</ul>
        </div>

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
