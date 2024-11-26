import React from 'react';
import { ethers } from 'ethers';

const StakingInteraction: React.FC = () => {
  const [provider, setProvider] = React.useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = React.useState<ethers.Signer | null>(null);
  const [contract, setContract] = React.useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [chainId, setChainId] = React.useState<number | null>(null);
  const [result, setResult] = React.useState<string>('');
  const [totalStaked, setTotalStaked] = React.useState<string>('0');
  const [userStakedBalance, setUserStakedBalance] = React.useState<string>('0');

  const contractAddress = '0xFb0b65497fFd92B32c8899aEe19bb645cE1f7960';
  const contractABI = [
    "function stake() external payable",
    "function withdraw(uint256 amount) external",
    "function getStakedBalance(address account) external view returns (uint256)",
    "function totalStaked() external view returns (uint256)"
  ];


  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        const web3Signer = web3Provider.getSigner();
        setSigner(web3Signer);
        const stakingContract = new ethers.Contract(contractAddress, contractABI, web3Signer);
        setContract(stakingContract);
        setIsConnected(true);
        const network = await web3Provider.getNetwork();
        setChainId(network.chainId);
        await updateStakingInfo();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        setResult('Failed to connect wallet. Please try again.');
      }
    } else {
      setResult('Please install MetaMask or another Web3 wallet to interact with this dApp.');
    }
  };

  const checkConnection = async () => {
    if (!isConnected) {
      await connectWallet();
    }
    if (chainId !== 17000) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x4268' }],
        });
        const network = await provider!.getNetwork();
        setChainId(network.chainId);
      } catch (error) {
        console.error('Failed to switch network:', error);
        setResult('Please switch to the Holesky testnet to interact with this contract.');
        return false;
      }
    }
    return true;
  };

  const updateStakingInfo = async () => {
    if (contract) {
      const total = await contract.totalStaked();
      setTotalStaked(ethers.utils.formatEther(total));
      const userAddress = await signer!.getAddress();
      const userBalance = await contract.getStakedBalance(userAddress);
      setUserStakedBalance(ethers.utils.formatEther(userBalance));
    }
  };

  const stake = async () => {
    if (!await checkConnection()) return;
    const amount = (document.getElementById('stakeAmount') as HTMLInputElement).value;
    try {
      const tx = await contract!.stake({ value: ethers.utils.parseEther(amount) });
      await tx.wait();
      setResult(`Successfully staked ${amount} ETH`);
      await updateStakingInfo();
    } catch (error) {
      console.error('Error staking:', error);
      setResult('Error staking. Please check your input and try again.');
    }
  };

  const withdraw = async () => {
    if (!await checkConnection()) return;
    const amount = (document.getElementById('withdrawAmount') as HTMLInputElement).value;
    try {
      const tx = await contract!.withdraw(ethers.utils.parseEther(amount));
      await tx.wait();
      setResult(`Successfully withdrew ${amount} ETH`);
      await updateStakingInfo();
    } catch (error) {
      console.error('Error withdrawing:', error);
      setResult('Error withdrawing. Please check your balance and try again.');
    }
  };

  const checkBalance = async () => {
    if (!await checkConnection()) return;
    try {
      const userAddress = await signer!.getAddress();
      const balance = await contract!.getStakedBalance(userAddress);
      setResult(`Your staked balance: ${ethers.utils.formatEther(balance)} ETH`);
    } catch (error) {
      console.error('Error checking balance:', error);
      setResult('Error checking balance. Please try again.');
    }
  };

  React.useEffect(() => {
    connectWallet();
  }, []);

  return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-5">
        <h1 className="text-2xl font-bold mb-4">Staking Interaction (Holesky Testnet)</h1>
        
        <div className="mb-4">
          <p>Wallet Status: {isConnected ? 'Connected' : 'Not Connected'}</p>
          <p>Chain ID: {chainId}</p>
          {!isConnected && (
            <button onClick={connectWallet} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
              Connect Wallet
            </button>
          )}
        </div>

        <div className="mb-4">
          <p>Total Staked: {totalStaked} ETH</p>
          <p>Your Staked Balance: {userStakedBalance} ETH</p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Stake ETH</h2>
          <input id="stakeAmount" type="number" step="0.01" placeholder="Amount to stake" className="border p-2 mr-2"/>
          <button onClick={stake} className="bg-green-500 text-white px-4 py-2 rounded">
            Stake
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Withdraw ETH</h2>
          <input id="withdrawAmount" type="number" step="0.01" placeholder="Amount to withdraw" className="border p-2 mr-2"/>
          <button onClick={withdraw} className="bg-red-500 text-white px-4 py-2 rounded">
            Withdraw
          </button>
        </div>

        <div className="mb-4">
          <button onClick={checkBalance} className="bg-yellow-500 text-white px-4 py-2 rounded">
            Check Balance
          </button>
        </div>

        <div className="mt-4 p-4 bg-gray-200 rounded">
          <h2 className="text-xl font-semibold mb-2">Result:</h2>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      </div>
    </div>
  );
};

export { StakingInteraction as component };
