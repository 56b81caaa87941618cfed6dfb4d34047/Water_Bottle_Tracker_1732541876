
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const UniswapV3FactoryInterface: React.FC = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [fee, setFee] = useState('');
  const [poolAddress, setPoolAddress] = useState('');
  const [result, setResult] = useState('');

  const contractAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
  const chainId = 1; // Ethereum Mainnet

  const contractABI = [
    {
      name: "createPool",
      stateMutability: "nonpayable",
      inputs: [
        { name: "tokenA", type: "address" },
        { name: "tokenB", type: "address" },
        { name: "fee", type: "uint24" }
      ],
      outputs: [{ name: "pool", type: "address" }]
    },
    {
      name: "getPool",
      stateMutability: "view",
      inputs: [
        { name: "", type: "address" },
        { name: "", type: "address" },
        { name: "", type: "uint24" }
      ],
      outputs: [{ name: "", type: "address" }]
    },
    {
      name: "feeAmountTickSpacing",
      stateMutability: "view",
      inputs: [{ name: "", type: "uint24" }],
      outputs: [{ name: "", type: "int24" }]
    }
  ];

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        const web3Signer = web3Provider.getSigner();
        setSigner(web3Signer);
        const uniswapContract = new ethers.Contract(contractAddress, contractABI, web3Signer);
        setContract(uniswapContract);
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

  const createPool = async () => {
    await checkConnectionAndChain();
    if (contract && tokenA && tokenB && fee) {
      try {
        const tx = await contract.createPool(tokenA, tokenB, fee);
        await tx.wait();
        setResult(`Pool created successfully. Transaction hash: ${tx.hash}`);
      } catch (error) {
        console.error("Failed to create pool:", error);
        setResult("Failed to create pool. Please check your inputs and try again.");
      }
    } else {
      setResult("Please fill in all fields and ensure wallet is connected.");
    }
  };

  const getPool = async () => {
    await checkConnectionAndChain();
    if (contract && tokenA && tokenB && fee) {
      try {
        const pool = await contract.getPool(tokenA, tokenB, fee);
        setPoolAddress(pool);
        setResult(`Pool address: ${pool}`);
      } catch (error) {
        console.error("Failed to get pool:", error);
        setResult("Failed to get pool. Please check your inputs and try again.");
      }
    } else {
      setResult("Please fill in all fields and ensure wallet is connected.");
    }
  };

  const getFeeAmountTickSpacing = async () => {
    await checkConnectionAndChain();
    if (contract && fee) {
      try {
        const tickSpacing = await contract.feeAmountTickSpacing(fee);
        setResult(`Tick spacing for fee ${fee}: ${tickSpacing}`);
      } catch (error) {
        console.error("Failed to get fee amount tick spacing:", error);
        setResult("Failed to get fee amount tick spacing. Please check your input and try again.");
      }
    } else {
      setResult("Please enter a fee amount and ensure wallet is connected.");
    }
  };

  return (
    <header className="bg-blue-500 text-white p-5 w-full">
      <div className="container mx-auto">
        <div className="text-2xl font-bold mb-4">UniswapV3Factory Interface</div>
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Token A Address"
              className="p-2 rounded-lg text-black w-full"
              value={tokenA}
              onChange={(e) => setTokenA(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Token B Address"
              className="p-2 rounded-lg text-black w-full"
              value={tokenB}
              onChange={(e) => setTokenB(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Fee (in basis points)"
              className="p-2 rounded-lg text-black w-full"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
            />
          </div>
          <div className="space-x-2">
            <button onClick={createPool} className="bg-green-500 hover:bg-green-600 p-2 rounded-lg">
              Create Pool
            </button>
            <button onClick={getPool} className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-lg">
              Get Pool
            </button>
            <button onClick={getFeeAmountTickSpacing} className="bg-purple-500 hover:bg-purple-600 p-2 rounded-lg">
              Get Fee Amount Tick Spacing
            </button>
          </div>
          <div className="bg-white text-black p-2 rounded-lg">
            <p>{result}</p>
            {poolAddress && <p>Pool Address: {poolAddress}</p>}
          </div>
        </div>
      </div>
    </header>
  );
};

export { UniswapV3FactoryInterface as component };
