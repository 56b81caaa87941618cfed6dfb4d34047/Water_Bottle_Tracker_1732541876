
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const StakingHeader: React.FC = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [amount, setAmount] = useState('');
  const [stakedBalance, setStakedBalance] = useState('');
  const [result, setResult] = useState('');

  const contractAddress = '0xFb0b65497fFd92B32c8899aEe19bb645cE1f7960';
  const chainId = 17000; // Holesky testnet

  const contractABI = [
    {
      "inputs": [],
      "name": "stake",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "getStakedBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        const web3Signer = web3Provider.getSigner();
        setSigner(web3Signer);
        const stakingContract = new ethers.Contract(contractAddress, contractABI, web3Signer);
        setContract(stakingContract);
      }
    };

    init();
  }, []);

  const connectWallet = async () => {
    if (provider) {
      try {
        await provider.send("eth_requestAccounts", []);
        const web3Signer = provider.getSigner();
        setSigner(web3Signer);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        setResult("Failed to connect wallet. Please try again.");
      }
    }
  };

  const switchChain = async () => {
    if (provider) {
      try {
        await provider.send("wallet_switchEthereumChain", [{ chainId: `0x${chainId.toString(16)}` }]);
      } catch (error) {
        console.error("Failed to switch chain:", error);
        setResult("Failed to switch to the correct chain. Please try again.");
      }
    }
  };

  const checkConnectionAndChain = async () => {
    if (!signer) {
      await connectWallet();
    }
    if (provider) {
      const network = await provider.getNetwork();
      if (network.chainId !== chainId) {
        await switchChain();
      }
    }
  };

  const stake = async () => {
    await checkConnectionAndChain();
    if (contract && amount) {
      try {
        const tx = await contract.stake({ value: ethers.utils.parseEther(amount) });
        await tx.wait();
        setResult(`Successfully staked ${amount} ETH. Transaction hash: ${tx.hash}`);
        await getStakedBalance();
      } catch (error) {
        console.error("Failed to stake:", error);
        setResult("Failed to stake. Please check your input and try again.");
      }
    } else {
      setResult("Please enter an amount to stake and ensure wallet is connected.");
    }
  };

  const withdraw = async () => {
    await checkConnectionAndChain();
    if (contract && amount) {
      try {
        const tx = await contract.withdraw(ethers.utils.parseEther(amount));
        await tx.wait();
        setResult(`Successfully withdrawn ${amount} ETH. Transaction hash: ${tx.hash}`);
        await getStakedBalance();
      } catch (error) {
        console.error("Failed to withdraw:", error);
        setResult("Failed to withdraw. Please check your input and try again.");
      }
    } else {
      setResult("Please enter an amount to withdraw and ensure wallet is connected.");
    }
  };

  const getStakedBalance = async () => {
    await checkConnectionAndChain();
    if (contract && signer) {
      try {
        const address = await signer.getAddress();
        const balance = await contract.getStakedBalance(address);
        const formattedBalance = ethers.utils.formatEther(balance);
        setStakedBalance(formattedBalance);
        setResult(`Your staked balance: ${formattedBalance} ETH`);
      } catch (error) {
        console.error("Failed to get staked balance:", error);
        setResult("Failed to get staked balance. Please try again.");
      }
    } else {
      setResult("Please ensure wallet is connected.");
    }
  };

  return (
    <header className="bg-blue-500 text-white p-5 w-full">
      <div className="container mx-auto">
        <div className="text-2xl font-bold mb-4">ETH Staking on Holesky</div>
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Amount (ETH)"
              className="p-2 rounded-lg text-black w-full"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-x-2">
            <button onClick={stake} className="bg-green-500 hover:bg-green-600 p-2 rounded-lg">
              Stake
            </button>
            <button onClick={withdraw} className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-lg">
              Withdraw
            </button>
            <button onClick={getStakedBalance} className="bg-purple-500 hover:bg-purple-600 p-2 rounded-lg">
              Check Balance
            </button>
          </div>
          <div className="bg-white text-black p-2 rounded-lg">
            <p>{result}</p>
            {stakedBalance && <p>Current Staked Balance: {stakedBalance} ETH</p>}
          </div>
        </div>
      </div>
    </header>
  );
};

export { StakingHeader as component };
