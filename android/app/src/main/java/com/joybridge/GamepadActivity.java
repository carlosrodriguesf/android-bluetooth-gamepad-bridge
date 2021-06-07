package com.joybridge;

import android.view.InputDevice;
import android.view.InputEvent;
import android.view.KeyEvent;
import android.view.MotionEvent;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class GamepadActivity extends ReactActivity {
    static final String BUTTON_A = "buttonA";
    static final String BUTTON_B = "buttonB";
    static final String BUTTON_Y = "buttonY";
    static final String BUTTON_X = "buttonX";
    static final String BUTTON_UP = "buttonUp";
    static final String BUTTON_DOWN = "buttonDown";
    static final String BUTTON_LEFT = "buttonLeft";
    static final String BUTTON_RIGHT = "buttonRight";
    static final String BUTTON_LB = "buttonLB";
    static final String BUTTON_RB = "buttonRB";
    static final String BUTTON_THUMBL = "buttonThumbL";
    static final String BUTTON_THUMBR = "buttonThumbR";

    private String getButton(int keyCode) {
        switch (keyCode) {
            case KeyEvent.KEYCODE_BUTTON_A:
                return BUTTON_A;
            case KeyEvent.KEYCODE_BUTTON_B:
                return BUTTON_B;
            case KeyEvent.KEYCODE_BUTTON_Y:
                return BUTTON_Y;
            case KeyEvent.KEYCODE_BUTTON_X:
                return BUTTON_X;
            case KeyEvent.KEYCODE_DPAD_UP:
                return BUTTON_UP;
            case KeyEvent.KEYCODE_DPAD_DOWN:
                return BUTTON_DOWN;
            case KeyEvent.KEYCODE_DPAD_LEFT:
                return BUTTON_LEFT;
            case KeyEvent.KEYCODE_DPAD_RIGHT:
                return BUTTON_RIGHT;
            case KeyEvent.KEYCODE_BUTTON_L1:
                return BUTTON_LB;
            case KeyEvent.KEYCODE_BUTTON_R1:
                return BUTTON_RB;
            case KeyEvent.KEYCODE_BUTTON_THUMBL:
                return BUTTON_THUMBL;
            case KeyEvent.KEYCODE_BUTTON_THUMBR:
                return BUTTON_THUMBR;
        }
        return "BUTTON_" + keyCode;
    }

    private void emit(String event, WritableMap params) {
        getReactInstanceManager()
                .getCurrentReactContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(event, params);
    }

    private boolean isValidGamepadEvent(KeyEvent event) {
        return event.getSource() == InputDevice.SOURCE_GAMEPAD || event.getSource() == 1281;
    }

    private boolean processKeyCode(String event, int keyCode) {
        WritableMap params = Arguments.createMap();
        params.putString("button", getButton(keyCode));
        this.emit(event, params);
        return true;
    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        if (!this.isValidGamepadEvent(event)) {
            return super.onKeyDown(keyCode, event);
        }
        if (event.getRepeatCount() != 0) {
            return true;
        }
        return this.processKeyCode("onKeyUp", keyCode);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (!this.isValidGamepadEvent(event)) {
            return super.onKeyDown(keyCode, event);
        }
        if (event.getRepeatCount() != 0) {
            return true;
        }
        return this.processKeyCode("onKeyDown", keyCode);
    }

    @Override
    public boolean onGenericMotionEvent(MotionEvent event) {
        if (event.getSource() != InputDevice.SOURCE_JOYSTICK) {
            return super.onGenericMotionEvent(event);
        }

        WritableMap params = Arguments.createMap();
        params.putDouble("axisLY", event.getAxisValue(MotionEvent.AXIS_Y));
        params.putDouble("axisLX", event.getAxisValue(MotionEvent.AXIS_X));
        params.putDouble("axisRY", event.getAxisValue(MotionEvent.AXIS_RZ));
        params.putDouble("axisRX", event.getAxisValue(MotionEvent.AXIS_Z));
        params.putDouble("axisLT", event.getAxisValue(MotionEvent.AXIS_LTRIGGER));
        params.putDouble("axisRT", event.getAxisValue(MotionEvent.AXIS_RTRIGGER));

        this.emit("onGenericMotion", params);

        return true;
    }
}
