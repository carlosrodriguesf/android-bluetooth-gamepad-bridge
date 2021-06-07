declare module 'react-native-bluetooth-serial' {
    export type Buffer = (data: number[]) => void;

    export default class BluetoothSerial {
        static on(eventName: string, handler: () => void): void;

        static removeListener(eventName: string, handler: () => void): void;

        static write(data: Buffer | string): Promise<boolean>;

        static list(): Promise<Array<{ id: string, name: string }>>;

        static isEnabled(): Promise<boolean>;

        static connect(id: string): Promise<void>;

        static disconnect(): Promise<void>;

        static isConnected(): Promise<boolean>;

        static discoverUnpairedDevices(): Promise<Array<{ id: string, name: string }>>

        static readFromDevice(): Promise<string>
    }
}