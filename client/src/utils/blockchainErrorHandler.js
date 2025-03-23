/**
 * Process error messages from blockchain transactions to make them more user-friendly
 * @param {Error} error - The error object from the blockchain transaction
 * @returns {string} A user-friendly error message
 */
export function formatBlockchainError(error) {
  if (!error) return 'An unknown error occurred';
  
  // Get the error message string
  const errorMsg = error.message || error.toString();
  
  // Check for common MetaMask errors
  if (errorMsg.includes('user rejected transaction')) {
    return 'Transaction was rejected. Please confirm the transaction in your wallet to proceed.';
  }
  
  if (errorMsg.includes('insufficient funds')) {
    return 'Insufficient funds in your wallet to complete this transaction. Please add funds and try again.';
  }

  if (errorMsg.includes('execution reverted')) {
    // Extract the revert reason if available
    const revertReasonMatch = errorMsg.match(/reason="([^"]+)"/);
    if (revertReasonMatch && revertReasonMatch[1]) {
      return `Transaction failed: ${revertReasonMatch[1]}`;
    }
    return 'Transaction failed on the blockchain. This could be due to contract restrictions or invalid parameters.';
  }
  
  if (errorMsg.includes('nonce')) {
    return 'Transaction nonce error. Please reset your wallet or try again later.';
  }
  
  if (errorMsg.includes('gas')) {
    return 'Gas estimation failed. The transaction might fail or the operation is not allowed.';
  }
  
  if (errorMsg.includes('network changed') || errorMsg.includes('chainId')) {
    return 'Network changed during transaction. Please stay on the same network and try again.';
  }
  
  if (errorMsg.includes('already pending')) {
    return 'A transaction with the same parameters is already pending. Please wait for it to complete.';
  }
  
  if (errorMsg.includes('not found') || errorMsg.includes('not available')) {
    return 'Contract or account not found. The application may be misconfigured or the network could be experiencing issues.';
  }
  
  // If no specific error is matched, return a more user-friendly version of the actual error
  // But truncate it if it's too long
  if (errorMsg.length > 150) {
    return `Blockchain error: ${errorMsg.substring(0, 150)}...`;
  }
  
  return `Blockchain error: ${errorMsg}`;
}

/**
 * Add helpful tips for resolving common blockchain errors
 * @param {string} errorType - A category or type of error 
 * @returns {string} Helpful tips for resolving the error
 */
export function getErrorResolutionTips(errorType) {
  switch (errorType) {
    case 'rejected':
      return 'To complete actions on the blockchain, you need to approve transactions in your wallet when prompted.';
    
    case 'funds':
      return 'You need ETH in your wallet to pay for transaction fees (gas). Consider adding funds to your wallet.';
    
    case 'gas':
      return 'Try increasing the gas limit in your wallet settings, or wait for network congestion to decrease.';
    
    case 'nonce':
      return 'You may need to reset your wallet transaction history. In MetaMask, go to Settings > Advanced > Reset Account.';
    
    case 'network':
      return 'Make sure you are connected to the correct Ethereum network in your wallet (e.g., Mainnet, Goerli, etc.).';
    
    case 'connection':
      return 'Check your internet connection and that your wallet is properly connected to the application.';
    
    default:
      return 'If this error persists, try refreshing the page, restarting your browser, or using a different wallet.';
  }
} 