
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const UniswapV3FactoryInteraction: React.FC = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [result, setResult] = useState<string>('');

  const contractAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
  const contractABI = [
    {
      "name": "createPool",
      "stateMutability": "nonpayable",
      "inputs": [
        { "name": "tokenA", "type": "address" },
        { "name": "tokenB", "type": "address" },
        { "name": "fee", "type": "uint24" }
      ],
      "outputs": [{ "name": "pool", "type": "address" }]
    },
    {
      "name": "getPool",
      "stateMutability": "view",
      "inputs": [
        { "name": "", "type": "address" },
        { "name": "", "type": "address" },
        { "name": "", "type": "uint24" }
      ],
      "outputs": [{ "name": "", "type": "address" }]
    },
    {
      "name": "feeAmountTickSpacing",
      "stateMutability": "view",
      "inputs": [{ "name": "", "type": "uint24" }],
      "outputs": [{ "name": "", "type": "int24" }]
    },
    {
      "name": "owner",
      "stateMutability": "view",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address" }]
    },
    {
      "name": "parameters",
      "stateMutability": "view",
      "inputs": [],
      "outputs": [
        { "name": "factory", "type": "address" },
        { "name": "token0", "type": "address" },
        { "name": "token1", "type": "address" },
        { "name": "fee", "type": "uint24" },
        { "name": "tickSpacing", "type": "int24" }
      ]
    }
  ];

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        const web3Signer = web3Provider.getSigner();
        setSigner(web3Signer);
        const uniswapContract = new ethers.Contract(contractAddress, contractABI, web3Signer);
        setContract(uniswapContract);
        setIsConnected(true);
        const network = await web3Provider.getNetwork();
        setChainId(network.chainId);
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
    if (chainId !== 1) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1' }],
        });
        const network = await provider!.getNetwork();
        setChainId(network.chainId);
      } catch (error) {
        console.error('Failed to switch network:', error);
        setResult('Please switch to the Ethereum mainnet to interact with this contract.');
        return false;
      }
    }
    return true;
  };

  const createPool = async (tokenA: string, tokenB: string, fee: number) => {
    if (!await checkConnection()) return;
    try {
      const tx = await contract!.createPool(tokenA, tokenB, fee);
      const receipt = await tx.wait();
      setResult(`Pool created. Transaction hash: ${receipt.transactionHash}`);
    } catch (error) {
      console.error('Error creating pool:', error);
      setResult('Error creating pool. Please check your inputs and try again.');
    }
  };

  const getPool = async (tokenA: string, tokenB: string, fee: number) => {
    if (!await checkConnection()) return;
    try {
      const poolAddress = await contract!.getPool(tokenA, tokenB, fee);
      setResult(`Pool address: ${poolAddress}`);
    } catch (error) {
      console.error('Error getting pool:', error);
      setResult('Error getting pool. Please check your inputs and try again.');
    }
  };

  const getFeeAmountTickSpacing = async (fee: number) => {
    if (!await checkConnection()) return;
    try {
      const tickSpacing = await contract!.feeAmountTickSpacing(fee);
      setResult(`Tick spacing for fee ${fee}: ${tickSpacing}`);
    } catch (error) {
      console.error('Error getting fee amount tick spacing:', error);
      setResult('Error getting fee amount tick spacing. Please check your input and try again.');
    }
  };

  const getOwner = async () => {
    if (!await checkConnection()) return;
    try {
      const ownerAddress = await contract!.owner();
      setResult(`Contract owner: ${ownerAddress}`);
    } catch (error) {
      console.error('Error getting owner:', error);
      setResult('Error getting owner. Please try again.');
    }
  };

  const getParameters = async () => {
    if (!await checkConnection()) return;
    try {
      const params = await contract!.parameters();
      setResult(`Parameters:
        Factory: ${params.factory}
        Token0: ${params.token0}
        Token1: ${params.token1}
        Fee: ${params.fee}
        Tick Spacing: ${params.tickSpacing}`);
    } catch (error) {
      console.error('Error getting parameters:', error);
      setResult('Error getting parameters. Please try again.');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-5">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-5">
        <h1 className="text-2xl font-bold mb-4">UniswapV3Factory Interaction</h1>
        
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
          <h2 className="text-xl font-semibold mb-2">Create Pool</h2>
          <input id="tokenA" placeholder="Token A Address" className="border p-2 mr-2"/>
          <input id="tokenB" placeholder="Token B Address" className="border p-2 mr-2"/>
          <input id="fee" type="number" placeholder="Fee" className="border p-2 mr-2"/>
          <button onClick={() => createPool(
            (document.getElementById('tokenA') as HTMLInputElement).value,
            (document.getElementById('tokenB') as HTMLInputElement).value,
            parseInt((document.getElementById('fee') as HTMLInputElement).value)
          )} className="bg-green-500 text-white px-4 py-2 rounded">
            Create Pool
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Get Pool</h2>
          <input id="getTokenA" placeholder="Token A Address" className="border p-2 mr-2"/>
          <input id="getTokenB" placeholder="Token B Address" className="border p-2 mr-2"/>
          <input id="getFee" type="number" placeholder="Fee" className="border p-2 mr-2"/>
          <button onClick={() => getPool(
            (document.getElementById('getTokenA') as HTMLInputElement).value,
            (document.getElementById('getTokenB') as HTMLInputElement).value,
            parseInt((document.getElementById('getFee') as HTMLInputElement).value)
          )} className="bg-blue-500 text-white px-4 py-2 rounded">
            Get Pool
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Get Fee Amount Tick Spacing</h2>
          <input id="tickSpacingFee" type="number" placeholder="Fee" className="border p-2 mr-2"/>
          <button onClick={() => getFeeAmountTickSpacing(
            parseInt((document.getElementById('tickSpacingFee') as HTMLInputElement).value)
          )} className="bg-purple-500 text-white px-4 py-2 rounded">
            Get Tick Spacing
          </button>
        </div>

        <div className="mb-4">
          <button onClick={getOwner} className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">
            Get Owner
          </button>
          <button onClick={getParameters} className="bg-pink-500 text-white px-4 py-2 rounded">
            Get Parameters
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

export { UniswapV3FactoryInteraction as component };
