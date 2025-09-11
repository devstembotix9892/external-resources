function addGenerator(Blockly) {
  Blockly.Arduino.ble_connection = function (block) {
    const name = Blockly.Arduino.valueToCode(block, 'NAME', Blockly.Arduino.ORDER_ATOMIC) || '"ESP32_BLE"';

    // ----------------- INCLUDES + GLOBALS -----------------
    Blockly.Arduino.includes_['ble_includes'] = `
#include <ESP32Servo.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include "esp32-hal-ledc.h"
#include "esp_ota_ops.h"
#include <driver/ledc.h>

// ================== Global Declarations ==================
Servo myServo[40];
#define IS_PIN_ANALOG(pin) (pin >= 0 && pin <= 39)
#define SERVICE_UUID_ESPOTA "d804b643-6ce7-4e81-9f8a-ce0f699085eb"
#define CHARACTERISTIC_UUID_CMD "c8659211-af91-4ad3-a995-a58d6fd26145"
#define CHARACTERISTIC_UUID_FW "c8659211-af91-4ad3-a995-a58d6fd26145"
#define CHARACTERISTIC_UUID_HW_VERSION "c8659212-af91-4ad3-a995-a58d6fd26145"
#define FULL_PACKET 512
#define BOOT_BUTTON_PIN 0

esp_ota_handle_t otaHandler = 0;
bool updateFlag = false;

BLEServer* pServer;
BLEService* pService;
BLECharacteristic* pCmdCharacteristic;
BLECharacteristic* pOtaCharacteristic;
BLECharacteristic* pVersionCharacteristic;

// ================== BLE Server Callbacks ==================
class BLECustomServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        Serial.println("Device Connected");
        pServer->getAdvertising()->stop();
    }
    void onDisconnect(BLEServer* pServer) {
        Serial.println("Device Disconnected");
        pServer->getAdvertising()->start();
    }
};

// ================== Command Callback ==================
class CommandCallback : public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic* pCharacteristic) {
        std::string rxData = pCharacteristic->getValue().c_str();
        if (rxData.empty()) return;

        Serial.printf("Received: %s\\n", rxData.c_str());   // ✅ Fixed escape sequence

        if (rxData.find("SET_PIN_MODE") != std::string::npos) {
            int pin;
            char mode[10];
            sscanf(rxData.c_str(), "SET_PIN_MODE %d %s", &pin, mode);
            if (strcmp(mode, "INPUT") == 0) pinMode(pin, INPUT);
            else if (strcmp(mode, "OUTPUT") == 0) pinMode(pin, OUTPUT);
        }
        else if (rxData.find("SET_DIGITAL_OUTPUT") != std::string::npos) {
            int pin, state;
            sscanf(rxData.c_str(), "SET_DIGITAL_OUTPUT %d %d", &pin, &state);
            pinMode(pin, OUTPUT);
            digitalWrite(pin, state);
        }
        else if (rxData.find("SET_SERVO_OUTPUT") != std::string::npos) {
            int pin, angle;
            sscanf(rxData.c_str(), "SET_SERVO_OUTPUT %d %d", &pin, &angle);
            if (!myServo[pin].attached())
                myServo[pin].attach(pin, 600, 2400);
            myServo[pin].write(angle);
        }
        else if (rxData.find("READ_ANALOG") != std::string::npos) {
            int pin;
            sscanf(rxData.c_str(), "READ_ANALOG %d", &pin);
            if (IS_PIN_ANALOG(pin)) {
                int analogValue = analogRead(pin);
                char response[20];
                snprintf(response, sizeof(response), "ANALOG_VALUE %d", analogValue);
                pCmdCharacteristic->setValue(response);
                pCmdCharacteristic->notify();
            }
        }
        else if (rxData.find("SET_PWM_OUTPUT") != std::string::npos) {
            int pin, value;
            sscanf(rxData.c_str(), "SET_PWM_OUTPUT %d %d", &pin, &value);
            pinMode(pin, OUTPUT);
            ledcAttachPin(pin, pin);     // ✅ ESP32 specific PWM
            ledcWrite(pin, value);
        }

        pCmdCharacteristic->setValue("Command Executed");
        pCmdCharacteristic->notify();
    }
};

// ================== Initialize BLE ==================
void initializeBLE(const char* name) {
    BLEDevice::init(name);
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new BLECustomServerCallbacks());

    pService = pServer->createService(SERVICE_UUID_ESPOTA);

    pCmdCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID_CMD,
        BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY
    );
    pCmdCharacteristic->addDescriptor(new BLE2902());
    pCmdCharacteristic->setCallbacks(new CommandCallback());

    pOtaCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID_FW,
        BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY
    );

    pVersionCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID_HW_VERSION,
        BLECharacteristic::PROPERTY_READ
    );
    uint8_t hardwareVersion[3] = {1, 2, 0};
    pVersionCharacteristic->setValue(hardwareVersion, sizeof(hardwareVersion));

    pService->start();
    BLEDevice::startAdvertising();
    Serial.println("🚀 BLE Ready for Commands");
}
`;

    // ----------------- SETUP CODE -----------------
    Blockly.Arduino.setups_['ble_setup'] = `
Serial.begin(57600);
Serial.println("ESP32 BLE OTA Ready");
initializeBLE(${name});
`;

    // ----------------- LOOP CODE -----------------
    Blockly.Arduino.loops_['ble_loop'] = `
// BLE tasks can be handled here if needed
`;


    return '';
  };
 // ---------------- Bluetooth Generators ----------------
    Blockly.Arduino.bt_classic_connection = function (block) {
        const name = Blockly.Arduino.valueToCode(block, 'NAME', Blockly.Arduino.ORDER_ATOMIC) || '"MyESP32"';

        Blockly.Arduino.includes_['bt_classic'] = `#include <BluetoothSerial.h>`;
        Blockly.Arduino.definitions_['bt_classic'] = `BluetoothSerial esp32BT;`;
        Blockly.Arduino.setups_['bt_classic'] = `esp32BT.begin(${name});`;

        return '';
    };

    Blockly.Arduino.bt_available = function () {
        return ['esp32BT.available()', Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.bt_read = function () {
        return ['esp32BT.readString()', Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.bt_send = function (block) {
        const text = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_ATOMIC) || '""';
        return `esp32BT.println(${text});\n`;
    };

    // ---------------- Serial Generators ----------------
    Blockly.Arduino.serial_set_baud = function (block) {
        const serial = block.getFieldValue('SERIAL') || '0';
        const baud = block.getFieldValue('BAUD') || '115200';
        if (serial === '0') {
            Blockly.Arduino.setups_[`serial_${serial}`] = `Serial.begin(${baud});`;
            return '';
        } else {
            // ESP32 has Serial1, Serial2
            Blockly.Arduino.setups_[`serial_${serial}`] = `Serial${serial}.begin(${baud});`;
            return '';
        }
    };

    Blockly.Arduino.serial_available = function (block) {
        const serial = block.getFieldValue('SERIAL') || '0';
        const ser = serial === '0' ? 'Serial' : `Serial${serial}`;
        return [`${ser}.available()`, Blockly.Arduino.ORDER_ATOMIC];
    };

    Blockly.Arduino.serial_read_bytes = function(block) {
        const serial = block.getFieldValue('SERIAL') || '0';
        const ser = serial === '0' ? 'Serial' : `Serial${serial}`;
        // ✅ check available before reading, otherwise return 0
        const code = `(${ser}.available() > 0 ? ${ser}.read() : 0)`;
        return [code, Blockly.Arduino.ORDER_ATOMIC];
    };


    Blockly.Arduino.serial_read_number = function(block) {
        const serial = block.getFieldValue('SERIAL') || '0';
        const ser = serial === '0' ? 'Serial' : `Serial${serial}`;
        // ✅ check available before parsing integer
        const code = `(${ser}.available() > 0 ? ${ser}.parseInt() : 0)`;
        return [code, Blockly.Arduino.ORDER_ATOMIC];
    };


    Blockly.Arduino.serial_read_string = function(block) {
        const serial = block.getFieldValue('SERIAL') || '0';
        const ser = serial === '0' ? 'Serial' : `Serial${serial}`;
        // ✅ check available before reading string
        const code = `(${ser}.available() > 0 ? ${ser}.readString() : "")`;
        return [code, Blockly.Arduino.ORDER_ATOMIC];
    };


    Blockly.Arduino.serial_write = function (block) {
        const text = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_ATOMIC) || '""';
        const serial = block.getFieldValue('SERIAL') || '0';
        const ser = serial === '0' ? 'Serial' : `Serial${serial}`;
        return `${ser}.println(${text});\n`;
    };
    return Blockly;
}

exports = addGenerator;
