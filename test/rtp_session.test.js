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

			rs1.set_local_end_point(null, null, err => {
				if(err) done(`failed to set first local_end_point: ${err}`)

				rs2.set_local_end_point(null, null, err => {
					if(err) done(`failed to set second local_end_point: ${err}`)

					var payload_type = 0
					var marker_bit = 1
					var payload = Buffer.from([1,2,3,4])

					rs1.set_remote_end_point(rs2.info.local_ip, rs2.info.local_port)
					rs1.send_payload(payload, marker_bit, payload_type)

					rs2.on('data', data => {
						assert.equalBytes(data, payload)

						rs1.close()						
						rs2.close()						

						done()
					})
				})
			})
		})
	})
})
