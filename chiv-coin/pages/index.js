import { BigNumber, Contract, providers, utils } from "ethers"
import Head from "next/head"
import React, { useEffect, useRef, useState } from "react"
import Web3Modal from "web3modal"
import Image from "next/image"
import coin from '../public/chiv-coin-no-bg.png'
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS } from "../constants"

export default function Home() {
  const zero = BigNumber.from(0)

  const [walletConnected, setWalletConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero)
  const [balanceOfChivCoinTokens, setBalanceOfChivCoinTokens] = useState(zero)
  const [tokenAmount, setTokenAmount] = useState(zero)
  const [tokensMinted, setTokensMinted] = useState(zero)
  const web3ModalRef = useRef()

  const getTokensToBeClaimed = async () => {
    try {
      const provider = await getProviderOrSigner()
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider)
      const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider)
      const signer = await getProviderOrSigner(true)

      const address = await signer.getAddress()
      const balance = await nftContract.balanceOf(address)
      if (balance === zero) {
        setTokensToBeClaimed(zero)
      } else {
        var amount = 0
        for (var i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i)
          const claimed = await tokenContract.tokenIdsClaimed(tokenId)
          if (!claimed) {
            amount++
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount))
      }
    } catch (err) {
      console.error(err)
      setTokensToBeClaimed(zero)
    }
  }

  const getBalanceOfChivCoinTokens = async () => {
    try {
      const provider = await getProviderOrSigner()
      const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider)
      const signer = await getProviderOrSigner(true)
      const address = await signer.getAddress()

      const balance = await tokenContract.balanceOf(address)
      setBalanceOfChivCoinTokens(balance)
    } catch (err) {
      console.error(err)
      setBalanceOfChivCoinTokens(zero)
    }
  }

  const mintChivCoinToken = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true)
      const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer)
      //each token costs 0.01 ether
      const value = 0.01 * amount
      const tx = await tokenContract.mint(amount, {value: utils.parseEther(value.toString())})
      setLoading(true)
      await tx.wait()
      setLoading(false)
      window.alert("Successfully minted ChivCoin tokens!")
      await getBalanceOfChivCoinTokens()
      await getTotalTokensMinted()
      await getTokensToBeClaimed()
    } catch (err) {
      console.error(err)
    }
  }

  const claimChivCoinTokens = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer)
      const tx = await tokenContract.claim()
      setLoading(true)
      await tx.wait()
      setLoading(false)
      window.alert("Successfully claimed Chiv Coin tokens!")
      await getBalanceOfChivCoinTokens()
      await getTotalTokensMinted()
      await getTokensToBeClaimed()
    } catch (error) {
      console.error(error)
    }
  }

  const getTotalTokensMinted = async () => {
    try {
      const provider = await getProviderOrSigner()
      const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider)

      const _tokensMinted = await tokenContract.totalSupply()
      setTokensMinted(_tokensMinted)
    } catch (err) {
      console.error(err)
    }
  }

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect()
    const web3Provider = new providers.Web3Provider(provider)

    const { chainId } = await web3Provider.getNetwork()
    if (chainId !== 4) {
      window.alert("Change network to Rinkeby")
      throw new Error("Change network to Rinkeby")
    }

    if (needSigner) {
      const signer = web3Provider.getSigner()
      return signer
    }
    return web3Provider
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner()
      setWalletConnected(true)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      })
      connectWallet()
      getTotalTokensMinted()
      getBalanceOfChivCoinTokens()
      getTokensToBeClaimed()
    }
  }, [walletConnected])

  const renderButton = () => {
    if (loading) {
      return (
        <div>
          <button className="bg-teal-400 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded text-center">Loading...</button>
        </div>
      )
    }
    
    if (tokensToBeClaimed > 0) {
      return (
        <div>
          <p className="text-xl my-3">{tokensToBeClaimed * 10} Tokens can be claimed!</p>
          <button className="bg-teal-400 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded text-center" onClick={claimChivCoinTokens}>Claim Tokens</button>
        </div>
      )
    }

    return (
      <div>
        <div>
          <input 
            type="number" 
            placeholder="Amount of Tokens"
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className="my-3 bg-gray-200 appearance-none border-2 border-gray-200 rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          />
        </div>
        <button className="bg-teal-400 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded text-center" disabled={!(tokenAmount > 0)} onClick={() => mintChivCoinToken(tokenAmount)}>Mint Tokens</button>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>ChivCoin Token</title>
        <meta name="description" content="Mint you ERC-20 tokens for the Chivivus-Verse!" />
      </Head>
      <div className="container mx-auto px-4">
        <h1 className="text-6xl my-3">Chiv-Coin Initial Coin Offering</h1>
        <p className="text-2xl my-3">Welcome to the ICO for ChivCoin! The official ERC-20 Token for the Chivivus-Verse!</p>
        <p className="text-2xl my-3">You can either claim or mint tokens here</p>
        {walletConnected ? (
          <div>
            <p className="text-xl my-3">You have minted {utils.formatEther(balanceOfChivCoinTokens)} ChivCoin Tokens</p>
            <p className="text-xl my-3">Overall {utils.formatEther(tokensMinted)}/10,000 have been minted!!!</p>
            {renderButton()}
          </div>
        ) : (
          <div>
            <button className="bg-teal-400 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded text-center" onClick={connectWallet}>Connect your wallet</button>
          </div>
        )}
      </div>
      <div className="coins flex justify-center my-8 justify-around">
        <Image src={coin} alt="Chiv-Coin" />
        <Image src={coin} alt="Chiv-Coin" />
        <Image src={coin} alt="Chiv-Coin" />
        <Image src={coin} alt="Chiv-Coin" />
      </div>
      <footer className="text-center py-6 border-t mt-4">
        <p className="">A <a href="https://twitter.com/YipsCT" target="blank" className="border-b border-gray-500">@YipsCT</a> Project.</p>
        <p className="">I&#39;m looking to do Web3 as a job. Consider Me.</p>
      </footer>
    </>
  )
}