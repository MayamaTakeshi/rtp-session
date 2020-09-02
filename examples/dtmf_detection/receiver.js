const DtmfDetectionStream = require('dtmf-detection-stream')
const RtpSession = require('../../index.js')

const args = process.argv

if(args.length != 4) {
	console.log(`
Invalid Number of arguments. 

Parameters: local_ip local_port
Ex:         127.0.0.1 8890
`)

	process.exit(1)
}

const local_ip = process.argv[2]
const local_port = process.argv[3]

const format = {
	sampleRate: 8000,
	bitDepth: 16,
	channels: 1,
}

const dds = new DtmfDetectionStream(format)

dds.on('digit', digit => {
	console.log('got digit', digit)
})

const rs_args = {
	payload_type: 0,
	ssrc: 0x12345678,
}

const rs = new RtpSession(rs_args)
rs.set_local_end_point(local_ip, local_port)

rs.on('data', data => {
	dds.write(data)
})

