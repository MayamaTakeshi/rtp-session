const dgram = require("dgram")

class RtpSession {
    constructor(opts) {
        this._info = {
            payload_type: opts.payload_type ? opts.payload_type : 0,
            ssrc: opts.ssrc ? opts.ssrc : 0x1234678,

            seq_num: 1,
            time_stamp: 160,
        }

        this._preserve_headers = opts.preserve_headers || false

        //console.log(this._info)

        var version = 2
        var padding = 0
        var extension = 0
        var csrc_count = 0
        var marker = 0

        this._hdr = Buffer.alloc(12)

        this._hdr[0] = (version << 6 | padding << 5 | extension << 4 | csrc_count)
        this._hdr[1] = (marker << 7 | this._info.payload_type)
        this._hdr[2] = 0   // seq_num MSB
        this._hdr[3] = 0   // seq_num LSB
        this._hdr[4] = 0   // timestamp MSB
        this._hdr[5] = 0   // timestamp 
        this._hdr[6] = 0   // timestamp
        this._hdr[7] = 1   // timestamp LSB
        this._hdr[8] = this._info.ssrc >>> 24
        this._hdr[9] = this._info.ssrc >>> 16 & 0xFF
        this._hdr[10] = this._info.ssrc >>> 8 & 0xFF
        this._hdr[11] = this._info.ssrc & 0xFF

        this._socket = dgram.createSocket("udp4")
    }

    set_socket(socket) {
        if(this._socket != socket) {
            this._socket.close()
        }

        this._socket = socket

        this._info.local_ip = this._socket.address().address
        this._info.local_port = this._socket.address().port

        this._socket.on('message', (msg, rinfo) => {
            if(rinfo.address != this._info.remote_ip || rinfo.port != this._info.remote_port) {
                // ignore packet out of RTP session
                return
            }

            // TODO: must check if message is really an RTP packet

            var data = this._preserve_headers ? msg : msg.slice(12) // assume 12 bytes header for now
            this._socket.emit('data', data) 
        })

    }

    set_local_end_point(ip, port) {
        this._socket.bind(port, ip, (err) => {
            if(err) return

            this.set_socket(this._socket)
        })
    }

    set_remote_end_point(ip, port) {
        this._info.remote_ip = ip
        this._info.remote_port = port
    }

    get info() {
        return this._info
    }

    send_payload(payload, marker_bit, payload_type) {
        var buf = Buffer.concat([this._hdr, payload])

        //buf[1] = (marker_bit ? marker_bit : 0) << 7 | (payload_type ? payload_type : this._info.payload_type)
        buf[1] = (this._info.seq_num ? 1 : 0) << 7 | (payload_type ? payload_type : this._info.payload_type)

        var seq_num = this._info.seq_num
        buf[2] = seq_num >>> 8
        buf[3] = seq_num & 0xFF
        this._info.seq_num++

        var time_stamp = this._info.time_stamp
        this._info.time_stamp += payload.length

        buf[4] = time_stamp >>> 24
        buf[5] = time_stamp >>> 16 & 0xFF
        buf[6] = time_stamp >>> 8 & 0xFF
        buf[7] = time_stamp & 0xFF
    
        this._socket.send(buf, 0, buf.length, this._info.remote_port, this._info.remote_ip)
    }

    close() {
        this._socket.close()
    }

    on(evt, cb) {
        this._socket.on(evt, cb)
    }
}

module.exports = RtpSession
