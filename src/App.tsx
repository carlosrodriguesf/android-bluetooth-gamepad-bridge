import React, {useEffect, useMemo, useState} from 'react';
import {
    Button,
    FlatList,
    StyleSheet,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View
} from 'react-native';
import useGamepad from "./useGamepad";
import Queue from 'promise-queue'
import bluetooth from './common/bluetooth'
import {debounce} from 'lodash'

interface Device {
    id: string
    name: string
}

const map = {
    buttonA: '01',
    buttonB: '02',
    buttonY: '03',
    buttonX: '04',
    buttonLB: '05',
    buttonRB: '06',
    buttonThumbL: '07',
    buttonThumbR: '08',
    axisLY: '09',
    axisLX: '10',
    axisRY: '11',
    axisRX: '12',
    axisLT: '13',
    axisRT: '14',
}

function getPositiveValue(value: number, m: number = 100, fixed: number = 0) {
    if (value < 0) {
        value *= -1;
    }
    return Number((value * m).toFixed(fixed))
}

export default function App() {
    const [enabled, setEnabled] = useState(false)
    const [devices, setDevices] = useState<Device[]>([])
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null)

    const queue = useMemo(() => new Queue(1, Infinity), [])

    useGamepad((k, v) => {
        if (!(k in map)) {
            return
        }
        let button = map[k];
        let value: string = "";
        switch (typeof v) {
            case 'number':
                value = `${getPositiveValue(v).toString().padStart(3, "0")}${Number(v >= 0)}`
                break
            case "boolean":
                value = `00${Number(v)}1`
                break
        }
        send(`${button}${value}`)
    })

    useEffect(() => {
        checkIsEnabled()
    }, [])

    useEffect(() => {
        if (enabled) {
            loadDevices()
        }
    }, [enabled])

    async function checkIsEnabled() {
        setEnabled(await bluetooth.isEnabled())
    }

    async function loadDevices() {
        setDevices(await bluetooth.devices())
    }

    async function connect(device: Device) {
        if (connectedDevice?.id === device.id) {
            return
        }

        try {
            await bluetooth.connect(device)
            setConnectedDevice(device)
        } catch (e) {
            ToastAndroid.show(e.message, ToastAndroid.SHORT)
        }
    }

    async function _send(message: string) {
        try {
            console.log("Sending:", message)
            await bluetooth.send(message)
        } catch (e) {
            ToastAndroid.show(e.message, ToastAndroid.SHORT)
        }
    }

    const send = debounce(_send, 10);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select device</Text>
            <FlatList
                style={styles.deviceList}
                data={devices}
                keyExtractor={({id}) => id}
                renderItem={({item: device}) => (
                    <TouchableOpacity style={styles.deviceContainer} onPress={() => connect(device)}>
                        <View style={{flex: 1}}>
                            <Text style={styles.deviceName}>{device.name}</Text>
                            <Text style={styles.deviceId}>{device.id}</Text>
                        </View>
                        {connectedDevice?.id !== device.id ? null : (
                            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={styles.deviceStatus}>Connected</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}/>
            <Button title="Send packet" onPress={() => send(`t${Date.now()}`)}/>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#dbe4f1',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
    },
    title: {
        fontSize: 16,
        padding: 10
    },
    deviceList: {
        alignSelf: 'stretch',
        padding: 10
    },
    deviceContainer: {
        padding: 10,
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 5,
        flexDirection: 'row'
    },
    deviceName: {
        fontSize: 14
    },
    deviceId: {
        fontSize: 10
    },
    deviceStatus: {
        fontSize: 10,
        color: '#76ee4a'
    }
});