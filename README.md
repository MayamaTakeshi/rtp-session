# rtp-session

A simple RTP (Real-time Transport Protocol) session library.

There is a sample in examples/dtmf_detection that creates two RTP endpoints and transmit DTMF tones over it.
To test with it start receiver.js with:
```
  node receiver.js LOCAL__IP LOCAL_PORT
```
and then start sender.js like this:
```
  node sender.js LOCAL__IP REMOTE_IP REMOTE_PORT
```

Ex:

```
$ node receiver.js 127.0.0.1 8890
got digit 0
got digit 1
got digit 2
got digit 3
got digit 4
got digit 5
got digit 6
got digit 7
got digit 8
got digit 9
got digit A
got digit B
got digit C
got digit D
```

```
$ node sender.js 127.0.0.1 127.0.0.1 8890 0123456789ABCD
tone stream finished
```

