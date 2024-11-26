
// Add these state variables
const [account, setAccount] = React.useState<string | null>(null);
const [isConnecting, setIsConnecting] = React.useState(false);

// Modified useEffect to handle events
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

  const handleChainChanged = () => {
    // Reload the page as recommended by MetaMask
    window.location.reload();
  };

  window.ethereum.on('accountsChanged', handleAccountsChanged);
  window.ethereum.on('chainChanged', handleChainChanged);

  // Check if already connected
  window.ethereum.request({ method: 'eth_accounts' })
    .then(handleAccountsChanged)
    .catch(console.error);

  return () => {
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', handleChainChanged);
  };
}, []);

// Modified connect function
const connectWallet = async () => {
  if (!window.ethereum) {
    setResult("Please install MetaMask");
    return;
  }

  setIsConnecting(true);
  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });
    setAccount(accounts[0]);
    await switchChain();
  } catch (error) {
    console.error("Connection error:", error);
    setResult("Failed to connect wallet");
  } finally {
    setIsConnecting(false);
  }
};

// Enhanced chain switching
const switchChain = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error: any) {
    // If the chain hasn't been added to MetaMask
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${chainId.toString(16)}`,
            chainName: 'Holesky Testnet',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://rpc.holesky.ethpandaops.io'],
            blockExplorerUrls: ['https://holesky.etherscan.io']
          }]
        });
      } catch (addError) {
        console.error("Failed to add network:", addError);
        setResult("Failed to add Holesky network to MetaMask");
      }
    }
  }
};