import React from 'react';
import { ethers } from 'ethers';

const StakingHeader: React.FC = () => {
  const [provider, setProvider] = React.useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = React.useState<ethers.Signer | null>(null);
  const [contract, setContract] = React.useState<ethers.Contract | null>(null);
  const [amount, setAmount] = React.useState('');
  const [stakedBalance, setStakedBalance] = React.useState('');
  const [result, setResult] = React.useState('');
  const [account, setAccount] = React.useState<string | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const contractAddress = '0xFb0b65497fFd92B32c8899aEe19bb645cE1f7960';

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

  React.useEffect(() => {
    if (!window.ethereum) {
      setResult("Please install MetaMask to use this dApp");
      return;
    }

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null);
        setSigner(null);
      } else {
        setAccount(accounts[0]);
      }
    };

    const init = async () => {
      try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const web3Signer = web3Provider.getSigner();
          setSigner(web3Signer);
          setAccount(accounts[0]);
          const stakingContract = new ethers.Contract(contractAddress, contractABI, web3Signer);
          setContract(stakingContract);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setResult("Failed to initialize wallet connection");
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    init();

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setResult("Please install MetaMask");
      return;
    }

    setIsConnecting(true);
    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await web3Provider.send("eth_requestAccounts", []);
      const web3Signer = web3Provider.getSigner();
      setSigner(web3Signer);
      setAccount(accounts[0]);
      const stakingContract = new ethers.Contract(contractAddress, contractABI, web3Signer);
      setContract(stakingContract);
    } catch (error) {
      console.error("Connection error:", error);
      setResult("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const stake = async () => {
    setIsLoading(true);
    try {
      if (!signer) {
        await connectWallet();
      }
      if (contract && amount) {
        const tx = await contract.stake({ value: ethers.utils.parseEther(amount) });
        setResult(`Staking transaction submitted. Waiting for confirmation...`);
        await tx.wait();
        setResult(`Successfully staked ${amount} ETH. Transaction hash: ${tx.hash}`);
        await getStakedBalance();
      } else {
        setResult("Please enter an amount to stake and ensure wallet is connected.");
      }
    } catch (error) {
      console.error("Failed to stake:", error);
      setResult("Failed to stake. Please check your input and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const withdraw = async () => {
    setIsLoading(true);
    try {
      if (!signer) {
        await connectWallet();
      }
      if (contract && amount) {
        const tx = await contract.withdraw(ethers.utils.parseEther(amount));
        setResult(`Withdrawal transaction submitted. Waiting for confirmation...`);
        await tx.wait();
        setResult(`Successfully withdrawn ${amount} ETH. Transaction hash: ${tx.hash}`);
        await getStakedBalance();
      } else {
        setResult("Please enter an amount to withdraw and ensure wallet is connected.");
      }
    } catch (error) {
      console.error("Failed to withdraw:", error);
      setResult("Failed to withdraw. Please check your input and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStakedBalance = async () => {
    try {
      if (!signer) {
        await connectWallet();
      }
      if (contract && signer) {
        const address = await signer.getAddress();
        const balance = await contract.getStakedBalance(address);
        const formattedBalance = ethers.utils.formatEther(balance);
        setStakedBalance(formattedBalance);
        setResult(`Your staked balance: ${formattedBalance} ETH`);
      } else {
        setResult("Please ensure wallet is connected.");
      }
    } catch (error) {
      console.error("Failed to get staked balance:", error);
      setResult("Failed to get staked balance. Please try again.");
    }
  };

  return (
    <header className="bg-blue-500 text-white p-5 w-full">
      <div className="container mx-auto">
        <div className="text-2xl font-bold mb-4">ETH Staking</div>
        <div className="space-y-4">
          {!account ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-green-500 hover:bg-green-600 p-2 rounded-lg disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="text-sm">Connected: {account.slice(0, 6)}...{account.slice(-4)}</div>
          )}
          <div>
            <input
              type="text"
              placeholder="Amount (ETH)"
              className="p-2 rounded-lg text-black w-full"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!account}
            />
          </div>
          <div className="space-x-2">
            <button
              onClick={stake}
              disabled={isLoading || !account}
              className="bg-green-500 hover:bg-green-600 p-2 rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Stake'}
            </button>
            <button
              onClick={withdraw}
              disabled={isLoading || !account}
              className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Withdraw'}
            </button>
            <button
              onClick={getStakedBalance}
              disabled={isLoading || !account}
              className="bg-purple-500 hover:bg-purple-600 p-2 rounded-lg disabled:opacity-50"
            >
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

export default StakingHeader;