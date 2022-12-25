import { Socket } from "net";
import { config } from "./config";
import { MTXInjector } from "./injector";

export class MTXClient {
    private client: Socket; //connection to my test student
    private server: Socket; //connection to original server

    private injector: MTXInjector;

    constructor(client: Socket) {
        this.client = client;
        this.client.on('data', this.onClientData.bind(this))
        this.client.on('close', this.onClientClose.bind(this))
        // 8192 | 65536

        this.server = new Socket()
        this.server.on('connect', this.onServerConnect.bind(this))
        this.server.on('data', this.onServerData.bind(this))
        this.server.on('close', this.onServerClose.bind(this))

        this.injector = new MTXInjector(this.client, this.server)

        this.onClientConnect()
    }

    private onServerConnect() {
        console.log('[Proxy -> Server]: Successfull connected')
    }

    private onClientConnect() { 
        console.log(`[Client -> Proxy]: New connection from ${this.client.remoteAddress}:${this.client.remotePort}`)

        console.log(`[Proxy -> Server]: Trying connect to ${config.serverHost}:${config.serverPort}...`)
        this.server.connect(config.serverPort, config.serverHost)
    }
    
    private onServerData(data: Buffer) {
        if (this.injector.onServerData(data)) {
            console.log(`[Server -> Client]:`, data)

            this.client.write(data)
        } else {
            console.log(`[Server -> Proxy]:`, data)
        }
    }

    private onClientData(data: Buffer) {
        if (this.injector.onClientData(data)) {
            console.log(`[Client -> Server]:`, data)

            this.server.write(data)
        } else {
            console.log(`[Client -> Proxy]:`, data)
        }
    }

    private onServerClose() {
        console.log('[Server -> Proxy]: Disconnected.')

        if (!this.client.closed) {
            console.log('[Proxy -> Client]: Closing connection...')
            this.client.destroy()
        }
    }

    private onClientClose() {
        console.log('[Client -> Proxy]: Disconnected.')

        if (!this.server.closed) {
            console.log('[Proxy -> Server]: Closing connection...')
            this.server.destroy()
        }
    }
}