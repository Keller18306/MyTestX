import { Socket } from "net";
import { config } from "./config";
import { MTXInjector } from "./injector";
import { ProxiedBuffer } from "./buffer";

export class MTXProxy {
    private client: Socket; //connection to my test student
    private clientBuffer: ProxiedBuffer;
    private server: Socket; //connection to original server
    private serverBuffer: ProxiedBuffer;

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

        this.clientBuffer = new ProxiedBuffer((data: Buffer) => { 
            console.log(`[Proxy -> Server]:`, data)
            this.server.write(data);
        });
        this.serverBuffer = new ProxiedBuffer((data: Buffer) => {
            console.log(`[Proxy -> Client]:`, data)
            this.client.write(data);
        });

        this.injector = new MTXInjector();

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
        console.log(`[Server -> Proxy]:`, data);
        this.serverBuffer.append(data);
        this.injector.onServerData(this.serverBuffer);
    }

    private onClientData(data: Buffer) {
        console.log(`[Client -> Proxy]:`, data);
        this.clientBuffer.append(data);
        this.injector.onClientData(this.clientBuffer);
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