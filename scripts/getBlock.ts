const web3 = require('@solana/web3.js');

(async () => {

  // Connect to cluster
  const RPC = "https://green-restless-river.solana-mainnet.quiknode.pro/d0edf84e7c18f7ec6c5372c22bac6e765822927f/";
  let connection = new web3.Connection(
    RPC,
    {
      httpHeaders: {
        'Content-Type': 'application/json',
        'Referer': 'http://winnerwheel.win',
      },
      commitment: 'confirmed'
    },
  );

  let currentSlot = await connection.getBlock(142264529);
  console.log('Current slot:', currentSlot);
})();