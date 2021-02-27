const ToneStream = require('tone-stream')
const RtpSession = require('../../index.js')

const args = process.argv

if(args.length != 7) {
	console.log(`
Invalid Number of arguments. 

Parameters: local_ip local_port remote_ip remote_port dtmf_string
Ex:         127.0.0.1 127.0.0.1 8890 01234567890abcdef
`)

	process.exit(1)
}

const local_ip = process.argv[2]
const local_port = parseInt(process.argv[3])
const remote_ip = process.argv[4]
const remote_port = parseInt(process.argv[5])
const dtmf_string = process.argv[6]

const re = /[0-9a-dA-D]+/
if(!dtmf_string.match(re)) {
	console.log('Invalid dtmf_string. Valid chars are 0123456789abcdef')	
	process.exit(1)
}

const format = {
	sampleRate: 8000,
	bitDepth: 16,
	channels: 1,
}

const ts = new ToneStream(format)
for (var i = 0; i < dtmf_string.length; i++) {
	var digit = dtmf_string.charAt(i)

	ts.add([800, `DTMF:${digit}`])
	ts.add([800, 0]) // silence
}

const rs_args = {
	payload_type: 0,
	ssrc: 0x12345678,
}

const rs = new RtpSession(rs_args)
rs.set_local_end_point(local_ip, local_port)

rs.on('error', err => {
	console.log(err)
})

rs.on('listening', () => {
	rs.set_remote_end_point(remote_ip, remote_port)
	
	setInterval(() => {
		var data = ts.read(160)
		if(!data) {
			console.log("tone stream finished")
			process.exit(0)
		} 
		//console.log(data)
		rs.send_payload(data)
	}, 20)
})

