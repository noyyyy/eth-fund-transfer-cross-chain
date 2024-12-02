# Eth fund transfer cross chain

To stay on chain, you need use on chain method to transfer assets. Stably transferring assets across chains through programming is a valuable thing. So I take a try on sepolia and mantle sepolia.

Demo: https://eth-fund-transfer-cross-chain.vercel.app/

Demo doesn't work perfectly because:

Backend cron service will stop if nobody visit api for sustainability. So the status update may be delayed. Refer to [here](https://fly.io/docs/reference/fly-proxy-autostop-autostart/#fly-proxy-process-to-stop-or-suspend-machines)

## Technical Stack

fastify, prisma, pgsql, react, viem

## Way of solving this problem

To bridge assets programmatically, you can just bridge assets via bridge page, then follow the transaction you send and receive to find some trait, then implement it in your code and trace them.

Specifically, when you bridge eth from sepolia to mantle sepolia, you will call bridge contract `depositETH` method and put the eth amount in value. When your fund arrive, your will see a `DepositFinalized` event and can use it as confirmation.

On the contrary, it's more complex to bridge from mantle sepolia to sepolia. You need to call bridge on mantle sepolia first. After 30min, you need to submit zkp on sepolia and withdraw eth on sepolia after 30min.

However, all the complex things can be handled via calling mantleSDK, so we just need to mantain a task queue, check status and execute some transaction.

## TODO

For now, it can only transfer ETH(WETH) between sepolia and mantle sepolia, there's lot of todo to make it perfect

- [ ] handle MNT transfer
- [ ] handle generate erc20 transfer
- [ ] use hardware to store private key like AWS KMS rather save it in environment
- [ ] gas balance monitor and alert

# Deploy

Use neon.tech for pgsql, vercel for frontend, fly.io for backend

# Credit

- https://github.com/bangphe/typescript-fastify
- https://github.com/mantlenetworkio/mantle-tutorial

# Disclaimer

This is a personal practice and share it for fun. Do not use in _Production_
