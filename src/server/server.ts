import { Server, Socket } from 'net'
import { config } from './config'
import { MTXProxy } from './proxy'

export class MTXServer extends Server {
    constructor() {
        super()

        this.on('connection', this.onConnect.bind(this))
    }

    private onConnect(socket: Socket) {
        
        new MTXProxy(socket)
    }

    public run() {
        this.listen(config.bindPort, config.bindHost, () => {
            console.log('Listening...', config.bindPort, config.bindHost);
        })
    }
}