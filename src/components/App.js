import React, { Component } from 'react'
import Web3 from 'web3'
import EthSwap from '../abis/EthSwap.json'
import Token from '../abis/Token.json'
import './App.css'
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {

  //Lifecycle method that will run before this component will mount. Called before render.
  async componentWillMount() {
    await this.loadWeb3()
    //console.log(window.web3)
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3
    
    const accounts = await web3.eth.getAccounts()
    //console my acc
    //console.log(account[0])
    this.setState({ account: accounts[0] })

    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance: ethBalance })

    //get the smart contract info and address
    //Load Token
    const abi = Token.abi
    const networkId = await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    if(tokenData) {
      const address = tokenData.address
      const token = new web3.eth.Contract(abi,address)
      console.log(token)
      this.setState({ token: token })
      //Read the balance of new tokens from the user connected with the MetaMask
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      this.setState({ tokenBalance: tokenBalance.toString() })
    }else {
      window.alert('Token contract not deployed to detected network.')
    }
    
  //get the smart contract info and address
    //Load EthSwap
    const abiE = EthSwap.abi
    const ethSwapData = EthSwap.networks[networkId]
    if(ethSwapData) {
      const address = ethSwapData.address
      const ethSwap = new web3.eth.Contract(abiE,address)
      console.log(ethSwap)
      this.setState({ ethSwap })
    }else {
      window.alert('Token contract not deployed to detected network.')
    }

    this.setState({ loading:false })
    
    console.log(this.state.ethSwap)
    //Ganache network
    //const address = Token.networks['5777'].address
 

  }

  async loadWeb3() {
      // Modern dapp browsers...
      if (window.ethereum) {
          window.web3 = new Web3(window.ethereum)
          await window.ethereum.enable()
      }
      // Legacy dapp browsers...
      else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider);
      }
      else {
          console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.buyTokens()
                              .send({ value: etherAmount, from: this.state.account })
                              .on('transactionHash',(hash) => {
      this.setState({ loading: false })
    })
  }
  
  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount)
                              .send({from: this.state.account })
                              .on('transactionHash',(hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount)
                                .send({from: this.state.account })
                                .on('transactionHash',(hash) => {
      this.setState({ loading: false })
      })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      token: {},
      ethSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true
    }
  }

  render() {
      let content
      if(this.state.loading) {
        content = <p id="loader" className="text-center">Loading.. Thank you for your patience.</p>
      } else {
        content = <Main ethBalance = {this.state.ethBalance} 
                        tokenBalance = {this.state.tokenBalance}
                        buyTokens = {this.buyTokens}
                        sellTokens = {this.sellTokens}
        /> 
      }
      // Connect App to Blockchain, Connect Browser to Blockchain
      return(
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                  {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
