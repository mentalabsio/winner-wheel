import { web3 } from "@project-serum/anchor"
import { LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "@solana/web3.js"

export default async (req: any, res: any) => {
	try {
		    const endpoint =
      process.env.NEXT_PUBLIC_CONNECTION_NETWORK === "devnet"
        ? process.env.NEXT_PUBLIC_SOLANA_RPC_HOST_DEVNET
        : process.env.NEXT_PUBLIC_SOLANA_RPC_HOST_MAINNET_BETA

    if (!endpoint) throw new Error("No RPC endpoint configured.")


		const body = JSON.parse(req.body)
		const { serializedTx, data, publicKey, selectedBet } = body
		console.log(serializedTx)
		const random = Math.floor(Math.random() * data.length)
		const dataObjectFound = data[random]
		// console.log(data)
		console.log(dataObjectFound)
		switch (dataObjectFound.option) {
			case '⟳':
				console.log('User can retry')
				break
			case '0':
				console.log('User loses everything')
				break
			case '2X':
				console.log('Users doubles his bet')
				break
			case '3X':
				console.log('User triple his bet')
				break
			default:
				break
		}
	
		const connection = new web3.Connection(endpoint, 'confirmed')
	
		const tx = web3.Transaction.from(serializedTx.data)
		

		const txid = await connection.sendRawTransaction(
			tx.serialize()
		)
	
		return res.status(200).json({
			status: 'Ok',
			data: {number: random}
		})
	
		// const ix  = Transfer()
	
		// sendTransaction({ connection, tx })
		
		// handle error 
	} catch (e) {
		console.log(e)
		return res.status(400).json({
			status: 'Error' + e,
			data: null
		})
	}
}