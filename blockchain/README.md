# Blockchain Voting Smart Contract

This is the smart contract implementation for the blockchain-based voting system. The contract is written in Solidity and uses Hardhat for development, testing, and deployment.

## Features

- Create and manage elections
- Add candidates to elections
- Verify voters
- Cast votes
- View election results
- Secure access control

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Hardhat

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
ALCHEMY_API_KEY=your_alchemy_api_key_here
NETWORK=localhost
```

## Development

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm run test
```

### Deploy Contracts

Local network:
```bash
npm run deploy:local
```

Testnet:
```bash
npm run deploy:testnet
```

Mainnet:
```bash
npm run deploy:mainnet
```

## Contract Functions

### Admin Functions
- `createElection(string title, string description, uint256 startTime, uint256 endTime)`
- `addCandidate(uint256 electionId, string name, string party)`
- `verifyVoter(address voter)`
- `setElectionStatus(uint256 electionId, bool isActive)`

### Voter Functions
- `castVote(uint256 electionId, uint256 candidateId)`

### View Functions
- `getElection(uint256 electionId)`
- `getCandidate(uint256 electionId, uint256 candidateId)`
- `getVote(uint256 electionId, address voter)`
- `isVoterVerified(address voter)`
- `getElectionCount()`
- `getCandidateCount(uint256 electionId)`

## Security Features

- Only admin can create elections and add candidates
- Only verified voters can cast votes
- One vote per voter per election
- Election time constraints
- Secure access control modifiers

## Testing

The contract includes comprehensive tests covering:
- Contract deployment
- Election creation
- Candidate management
- Voting functionality
- Voter verification
- Access control

## License

MIT 