const { expect, assert } = require('chai')
	.use(require('chai-bytes'))

const RtpSession = require('../index')

describe('rtp-session', function() {
	describe('basic', function() {
		it('should notify rtp packet reception', function(done) {

			var args = {
				payload_type: 0,
				ssrc: 0x12345678,
			}

			var rs1 = new RtpSession(args)
			var rs2 = new RtpSession(args)

			rs1.on('error', err => {
				rs1.close()
				rs2.close()
				done(`rs1 error ${err}`)
			})

			rs1.on('error', err => {
				rs1.close()
				rs2.close()
				done(`rs2 error ${err}`)
			})

			rs1.set_local_end_point('127.0.0.1', null)
			rs2.set_local_end_point('127.0.0.1', null)

			var payload = Buffer.from([1,2,3,4])
			var payload_type = 0
			var marker_bit = 1

			rs2.on('data', data => {
				console.log("rs2 on data")
				assert.equalBytes(data, payload)

				rs1.close()						
				rs2.close()						

				done()
			})

			rs2.on('listening', () => {
				console.log('rs2 on listening')
				console.log(rs2.info.local_ip, rs2.info.local_port)
				rs1.set_remote_end_point(rs2.info.local_ip, rs2.info.local_port)
				rs1.send_payload(payload, marker_bit, payload_type)
			})

			rs1.on('listening', () => {
				console.log('rs1 on listening')
				console.log(rs1.info.local_ip, rs1.info.local_port)
				rs2.set_remote_end_point(rs1.info.local_ip, rs1.info.local_port)
			})

		})
	})
})
