
import React from 'react';
import { ethers } from 'ethers';

const StakingComponent: React.FC = () => {
  const [walletAddress, setWalletAddress] = React.useState<string>('');
  const [stakedBalance, setStakedBalance] = React.useState<string>('0');
  const [totalStaked, setTotalStaked] = React.useState<string>('0');
  const [stakeAmount, setStakeAmount] = React.useState<string>('');

  const contractAddress = '0xFb0b65497fFd92B32c8899aEe19bb645cE1f7960';
  const chainId = 17000; // Holesky testnet

  const contractABI = [
    "function stake() external payable",
    "function getStakedBalance(address account) external view returns (uint256)",
    "function totalStaked() external view returns (uint256)"
  ];

  React.useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    console.log("Checking wallet connection...");
    if (typeof window.ethereum !== 'undefined') {
      try {
        console.log("Ethereum object found");
        const provider = new Ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        console.log("Current network:", network.chainId);
        if (network.chainId !== chainId) {
          console.log("Incorrect network, switching...");
          await switchNetwork();
        }
        const accounts = await provider.listAccounts();
        console.log("Accounts:", accounts);
        if (accounts.length > 0) {
          console.log("Wallet connected:", accounts[0]);
          setWalletAddress(accounts[0]);
          fetchStakedBalance(accounts[0]);
          fetchTotalStaked();
        } else {
          console.log("No accounts found");
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    } else {
      console.log("Ethereum object not found");
    }
  };

  const connectWallet = async () => {
    console.log("Connecting wallet...");
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new Ethers.providers.Web3Provider(window.ethereum);
        console.log("Requesting accounts...");
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        console.log("Wallet connected:", address);
        setWalletAddress(address);
        fetchStakedBalance(address);
        fetchTotalStaked();
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      console.log("Ethereum object not found");
    }
  };

  const switchNetwork = async () => {
    console.log("Switching network...");
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      console.log("Network switched successfully");
    } catch (error) {
      console.error("Error switching network:", error);
    }
  };

  const fetchStakedBalance = async (address: string) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const balance = await contract.getStakedBalance(address);
      setStakedBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error("Error fetching staked balance:", error);
    }
  };

  const fetchTotalStaked = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const total = await contract.totalStaked();
      setTotalStaked(ethers.utils.formatEther(total));
    } catch (error) {
      console.error("Error fetching total staked:", error);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.stake({ value: ethers.utils.parseEther(stakeAmount) });
      await tx.wait();
      fetchStakedBalance(walletAddress);
      fetchTotalStaked();
      setStakeAmount('');
    } catch (error) {
      console.error("Error staking:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStakeAmount(e.target.value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-5">
      <div className="bg-white rounded-lg shadow-md p-5 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Staking HOLESKY ETH</h1>
        {!walletAddress ? (
          <button
            onClick={connectWallet}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <p className="mb-2">Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
            <p className="mb-2">Your Staked Balance: {stakedBalance} ETH</p>
            <p className="mb-4">Total Staked: {totalStaked} ETH</p>
            <input
              type="number"
              value={stakeAmount}
              onChange={handleInputChange}
              placeholder="Amount to stake (ETH)"
              className="w-full border rounded-lg p-2 mb-2"
            />
            <button
              onClick={handleStake}
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Stake
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export { StakingComponent as component };
