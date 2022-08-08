export default (req: any, res: any) => {
	const body = JSON.parse(req.body)
	const { dataLength } = body
	console.log(dataLength)
	// const signed = body.signed
	return res.status(200).json({
		status: 'Ok',
		data: Math.floor(Math.random() * dataLength)
	})

	// const ix  = Transfer()

	// sendTransaction({ connection, tx })
	
	// handle error 
}