import BluetoothSerial from 'react-native-bluetooth-serial'
import Queue from 'promise-queue'

interface Device {
    id: string
    name: string
}


class Bluetooth {
    private queue: Queue

    constructor() {
        this.queue = new Queue();
    }

    public isEnabled(): Promise<boolean> {
        return BluetoothSerial.isEnabled()
    }

    public isConnected() {
        return BluetoothSerial.isConnected()
    }

    public devices(): Promise<Device[]> {
        return BluetoothSerial.list()
    }

    public disconnect() {
        return BluetoothSerial.disconnect()
    }

    public async connect(device: Device) {
        if (this.isConnected()) {
            await this.disconnect()
        }
        return BluetoothSerial.connect(device.id)
    }

    public send(message: string): Promise<boolean> {
        return BluetoothSerial.write(message)
    }

    public async receive(): Promise<string> {
        let buffer = ''
        while (!buffer.endsWith('\n')) {
            buffer += await BluetoothSerial.readFromDevice()
        }
        return buffer.trim()
    }

    public addMessage(message: string) {
        return this.queue.add(() => this.send(message))
    }

    public addMessageWithResponse(message: string): Promise<string> {
        return this.queue.add(() => this.sendAndWait(message))
    }

    public async sendAndWait(message: string) {
        await this.send(message)
        return await this.receive()
    }
}

export default new Bluetooth();