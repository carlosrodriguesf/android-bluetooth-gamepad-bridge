import {useEffect, useMemo} from "react";
import Gamepad, {OnChangeCallback} from "./Gamepad";

export default function useGamepad(callback: OnChangeCallback) {
    const gamepad = useMemo(() => new Gamepad(callback), [])
    useEffect(gamepad.effect)
    return gamepad
}