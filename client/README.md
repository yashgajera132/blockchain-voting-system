# Blockchain Voting System - Frontend

This is the frontend application for the Blockchain Voting System, built with React, Vite, and Tailwind CSS.

## Features

- User Authentication (Register/Login)
- Voter Verification
- Election Management
- Real-time Voting
- Admin Dashboard
- Responsive Design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask browser extension

## Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000
VITE_CONTRACT_ADDRESS=your_contract_address
```

## Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## Building for Production

Build the application:
```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/       # React context providers
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── utils/         # Utility functions
├── App.jsx        # Main application component
└── main.jsx       # Application entry point
```

## Technologies Used

- React
- Vite
- Tailwind CSS
- Web3.js
- Ethers.js
- React Router
- React Hot Toast

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
