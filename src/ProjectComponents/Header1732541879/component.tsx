
import React, { useState, useEffect } from 'react';
import ethers from 'ethers';

const StakingComponent: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [stakedBalance, setStakedBalance] = useState<string>('0');
  const [totalStaked, setTotalStaked] = useState<string>('0');
  const [stakeAmount, setStakeAmount] = useState<string>('');

  const contractAddress = '0xFb0b65497fFd92B32c8899aEe19bb645cE1f7960';
  const chainId = 17000; // Holesky testnet

  const contractABI = [
    "function stake() external payable",
    "function getStakedBalance(address account) external view returns (uint256)",
    "function totalStaked() external view returns (uint256)"
  ];

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        if (network.chainId !== chainId) {
          await switchNetwork();
        }
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          fetchStakedBalance(accounts[0]);
          fetchTotalStaked();
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        fetchStakedBalance(address);
        fetchTotalStaked();
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
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
      const signer = provider.getSigner();
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
