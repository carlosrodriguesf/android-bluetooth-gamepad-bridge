import {EffectCallback} from "react";
import {DeviceEventEmitter} from "react-native";
import {mapValues} from 'lodash';
import diff, {Field} from "./common/diff";

export type GamepadButton = "A" | "B" | "Y" | "X" | "LB" | "RB"

interface GamepadButtonEvent {
    button: GamepadButton
}

interface GamepadMotionEvent {
    axisLY: number
    axisLX: number
    axisRY: number
    axisRX: number
    axisLT: number
    axisRT: number
}

interface GamepadMap {
    buttonA: boolean
    buttonB: boolean
    buttonY: boolean
    buttonX: boolean
    buttonLB: boolean
    buttonRB: boolean
    buttonThumbL: boolean
    buttonThumbR: boolean
    axisLY: number
    axisLX: number
    axisRY: number
    axisRX: number
    axisLT: number
    axisRT: number
}

export type OnChangeCallback<T extends GamepadMap = GamepadMap, K extends keyof T = keyof T> = (field: K, value: T[K]) => void

export default class Gamepad {
    private map: GamepadMap;
    private onChangeCallback: OnChangeCallback

    constructor(onChangeCallback: OnChangeCallback) {
        this.onChangeCallback = onChangeCallback;

        this.map = {
            buttonA: false,
            buttonB: false,
            buttonY: false,
            buttonX: false,
            buttonLB: false,
            buttonRB: false,
            buttonThumbL: false,
            buttonThumbR: false,
            axisLY: 0,
            axisLX: 0,
            axisRY: 0,
            axisRX: 0,
            axisLT: 0,
            axisRT: 0
        }

        this.onKeyUpHandler = this.onKeyUpHandler.bind(this)
        this.onKeyDownHandler = this.onKeyDownHandler.bind(this)
        this.onMotionHandler = this.onMotionHandler.bind(this)
    }

    public get effect(): EffectCallback {
        return () => {
            DeviceEventEmitter.addListener("onKeyUp", this.onKeyUpHandler)
            DeviceEventEmitter.addListener("onKeyDown", this.onKeyDownHandler)
            DeviceEventEmitter.addListener("onGenericMotion", this.onMotionHandler)
            return () => {
                DeviceEventEmitter.removeListener("onKeyUp", this.onKeyUpHandler)
                DeviceEventEmitter.removeListener("onKeyDown", this.onKeyDownHandler)
                DeviceEventEmitter.removeListener("onGenericMotion", this.onMotionHandler)
            }
        }
    }

    private onKeyUpHandler(e: GamepadButtonEvent) {
        this.emitDifference({
            ...this.map,
            [e.button]: false
        })
    }

    private onKeyDownHandler(e: GamepadButtonEvent) {
        this.emitDifference({
            ...this.map,
            [e.button]: true
        })
    }

    private onMotionHandler(e: GamepadMotionEvent) {
        this.processMotionEvent(e)
    }

    private roundedMotionEvent(e: GamepadMotionEvent): GamepadMotionEvent {
        return mapValues(e, (v => Number(v.toFixed(2))))
    }

    private processMotionEvent(e: GamepadMotionEvent) {
        this.emitDifference({
            ...this.map,
            ...this.roundedMotionEvent(e)
        })
    }

    private emitDifference(map: GamepadMap) {
        const arr = diff(this.map, map)
        this.map = map
        arr.forEach(({name, value}) => {
            if (this.onChangeCallback) {
                this.onChangeCallback(name, value)
            }
        })
    }
}