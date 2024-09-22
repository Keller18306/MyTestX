import { Server, Socket } from 'net'
import { MTXClient } from './client'
import { config } from './config'

export class MTXServer extends Server {
    constructor() {
        super()

        this.on('connection', this.onConnect.bind(this))
    }

    private onConnect(socket: Socket) {
        
        new MTXClient(socket)
    }

    public run() {
        this.listen(config.bindPort, config.bindHost, () => {
            console.log('Listening...', config.bindPort, config.bindHost);
        })
    }
}