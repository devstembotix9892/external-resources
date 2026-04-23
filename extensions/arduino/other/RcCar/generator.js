function addGenerator(Blockly) {

    // =========================
    // 1. BLUETOOTH CONNECT
    // =========================
    let pwmChannel = 0;
   Blockly.Arduino.bt_connect = function () {

    Blockly.Arduino.includes_['ble'] = `#include "BluetoothSerial.h"`;
    Blockly.Arduino.includes_['servo'] = `#include <ESP32Servo.h>`;

    // ✅ VARIABLES (IMPORTANT)
Blockly.Arduino.definitions_['vars'] = `
BluetoothSerial SerialBT;
char command;
int motorSpeed = 200;

// servo objects
Servo servo_5;
Servo servo_14;
Servo servo_32;
Servo servo_33;

// ✅ dynamic servo
int servoPin = 14;
int servoAngle = 50;
`;

Blockly.Arduino.setups_['servo_setup'] = `
servo_5.attach(5);
servo_14.attach(14);
servo_32.attach(32);
servo_33.attach(33);
`;

    // PWM CHANNELS
    Blockly.Arduino.definitions_['channels'] = `
// MOTOR PINS
#define MOTOR_FL1 27
#define MOTOR_FL2 19
#define MOTOR_FR1 15
#define MOTOR_FR2 23
#define MOTOR_BL1 12
#define MOTOR_BL2 18
#define MOTOR_BR1 13
#define MOTOR_BR2 2
`;

    // FUNCTIONS
    Blockly.Arduino.definitions_['robot_functions'] = `

    void setServoByPin(int pin, int angle){

  switch(pin){

    case 5: servo_5.write(angle); break;
    case 14: servo_14.write(angle); break;
    case 32: servo_32.write(angle); break;
    case 33: servo_33.write(angle); break;

  }
}

void moveForward() {
  ledcWrite(MOTOR_FL1, motorSpeed); ledcWrite(MOTOR_FL2, 0);
  ledcWrite(MOTOR_FR1, motorSpeed); ledcWrite(MOTOR_FR2, 0);
  ledcWrite(MOTOR_BL1, 0); ledcWrite(MOTOR_BL2, motorSpeed);
  ledcWrite(MOTOR_BR1, 0); ledcWrite(MOTOR_BR2, motorSpeed);
}

void moveBackward() {
  ledcWrite(MOTOR_FL1, 0); ledcWrite(MOTOR_FL2, motorSpeed);
  ledcWrite(MOTOR_FR1, 0); ledcWrite(MOTOR_FR2, motorSpeed);
  ledcWrite(MOTOR_BL1, motorSpeed); ledcWrite(MOTOR_BL2, 0);
  ledcWrite(MOTOR_BR1, motorSpeed); ledcWrite(MOTOR_BR2, 0);
}

void moveLeft() {
  ledcWrite(MOTOR_FL1, 0); ledcWrite(MOTOR_FL2, motorSpeed);
  ledcWrite(MOTOR_FR1, motorSpeed); ledcWrite(MOTOR_FR2, 0);
  ledcWrite(MOTOR_BL1, motorSpeed); ledcWrite(MOTOR_BL2, 0);
  ledcWrite(MOTOR_BR1, 0); ledcWrite(MOTOR_BR2, motorSpeed);
}

void moveRight() {
  ledcWrite(MOTOR_FL1, motorSpeed); ledcWrite(MOTOR_FL2, 0);
  ledcWrite(MOTOR_FR1, 0); ledcWrite(MOTOR_FR2, motorSpeed);
  ledcWrite(MOTOR_BL1, 0); ledcWrite(MOTOR_BL2, motorSpeed);
  ledcWrite(MOTOR_BR1, motorSpeed); ledcWrite(MOTOR_BR2, 0);
}

void stopMotors() {
  ledcWrite(MOTOR_FL1, 0); ledcWrite(MOTOR_FL2, 0);
  ledcWrite(MOTOR_FR1, 0); ledcWrite(MOTOR_FR2, 0);
  ledcWrite(MOTOR_BL1, 0); ledcWrite(MOTOR_BL2, 0);
  ledcWrite(MOTOR_BR1, 0); ledcWrite(MOTOR_BR2, 0);
}

void handleCommand(char cmd) {
  switch (cmd) {
    case 'u': moveForward(); break;
    case 'd': moveBackward(); break;
    case 'l': moveLeft(); break;
    case 'r': moveRight(); break;
    case 'n': stopMotors(); break;
    case 'f': setServoByPin(servoPin, servoAngle); break;
    case 'b': setServoByPin(servoPin, 0); break;
  }
}
`;

    // LOOP
    Blockly.Arduino.loops_['main_loop'] = `
if (SerialBT.available()) {
  command = SerialBT.read();
  handleCommand(command);
}
`;

    return '';
};

    // =========================
    // 2. SET NAME
    // =========================
    Blockly.Arduino.bt_name = function (block) {

        const name = Blockly.Arduino.valueToCode(
            block,
            'NAME',
            Blockly.Arduino.ORDER_ATOMIC
        ) || '"MyCar"';

        Blockly.Arduino.setups_['bt_name'] = `
SerialBT.begin(${name});
Serial.println("Bluetooth Device Ready");
`;

        return '';
    };


    // =========================
    // 3. MOTOR SETUP
    // =========================
Blockly.Arduino.motor_setup = function (block) {

    const m1 = block.getFieldValue('MOTOR1');
    const m2 = block.getFieldValue('MOTOR2');

    const motorMap = {
        M1: ["MOTOR_FL1", "MOTOR_FL2"],
        M2: ["MOTOR_FR1", "MOTOR_FR2"],
        M3: ["MOTOR_BL1", "MOTOR_BL2"],
        M4: ["MOTOR_BR1", "MOTOR_BR2"]
    };

    const selectedMotors = [...new Set([m1, m2])];

    let setupCode = `
Serial.begin(9600);
`;

    selectedMotors.forEach(motor => {

        const pins = motorMap[motor];

        setupCode += `

// ${motor}
ledcAttach(${pins[0]}, ${pwmChannel++}, 8);
ledcAttach(${pins[1]}, ${pwmChannel++}, 8);
`;
    });

    // 🔥 IMPORTANT: append karo
    if (!Blockly.Arduino.setups_['motor_setup']) {
        Blockly.Arduino.setups_['motor_setup'] = '';
    }

    Blockly.Arduino.setups_['motor_setup'] += setupCode;

    return '';
};
    // =========================
    // 4. SPEED CONTROL
    // =========================
Blockly.Arduino.set_speed = function (block) {

    const speed = Blockly.Arduino.valueToCode(
        block,
        'SPEED',
        Blockly.Arduino.ORDER_ATOMIC
    ) || 200;

    return `motorSpeed = ${speed};\n`;
};

Blockly.Arduino.set_servo = function (block) {

    const pin = block.getFieldValue('PIN');
    const angle = Blockly.Arduino.valueToCode(
        block,
        'ANGLE',
        Blockly.Arduino.ORDER_ATOMIC
    ) || 90;

    return `
servoPin = ${pin};
servoAngle = ${angle};
setServoByPin(${pin}, ${angle});
`;
};

// Blockly.Arduino.ble_robot_full_1 = function(block){

// const name =
// Blockly.Arduino.valueToCode(block,'NAME',
// Blockly.Arduino.ORDER_ATOMIC) || '"DOZZRE"';


// // ===== INCLUDE =====

// Blockly.Arduino.includes_['ble_robot'] = `
// #include "BluetoothSerial.h"
// #include <ESP32Servo.h>
// `;


// // ===== MOTOR PINS =====

// Blockly.Arduino.definitions_['motor_pins'] = `
// #define MOTOR_FL1 13
// #define MOTOR_FL2 2
// #define MOTOR_FR1 18
// #define MOTOR_FR2 12
// #define MOTOR_BL1 15
// #define MOTOR_BL2 23
// #define MOTOR_BR1 19
// #define MOTOR_BR2 27

// #define SERVO_PIN 14
// `;


// // ===== VARIABLES =====

// Blockly.Arduino.definitions_['robot_vars'] = `
// BluetoothSerial SerialBT;

// Servo myServo;

// int servoPosition = 0;

// char command;
// `;


// // ===== FUNCTIONS =====

// Blockly.Arduino.definitions_['robot_functions'] = `

// // ---------- MOVEMENT ----------

// void moveForward() {

// digitalWrite(MOTOR_FL1, LOW);
// digitalWrite(MOTOR_FL2, HIGH);

// digitalWrite(MOTOR_FR1, HIGH);
// digitalWrite(MOTOR_FR2, LOW);

// digitalWrite(MOTOR_BL1, HIGH);
// digitalWrite(MOTOR_BL2, LOW);

// digitalWrite(MOTOR_BR1, LOW);
// digitalWrite(MOTOR_BR2, HIGH);

// }


// void moveBackward() {

// digitalWrite(MOTOR_FL1, HIGH);
// digitalWrite(MOTOR_FL2, LOW);

// digitalWrite(MOTOR_FR1, LOW);
// digitalWrite(MOTOR_FR2, HIGH);

// digitalWrite(MOTOR_BL1, LOW);
// digitalWrite(MOTOR_BL2, HIGH);

// digitalWrite(MOTOR_BR1, HIGH);
// digitalWrite(MOTOR_BR2, LOW);

// }


// void moveLeft() {

// digitalWrite(MOTOR_FL1, HIGH);
// digitalWrite(MOTOR_FL2, LOW);

// digitalWrite(MOTOR_FR1, HIGH);
// digitalWrite(MOTOR_FR2, LOW);

// digitalWrite(MOTOR_BL1, LOW);
// digitalWrite(MOTOR_BL2, HIGH);

// digitalWrite(MOTOR_BR1, LOW);
// digitalWrite(MOTOR_BR2, HIGH);

// }


// void moveRight() {

// digitalWrite(MOTOR_FL1, LOW);
// digitalWrite(MOTOR_FL2, HIGH);

// digitalWrite(MOTOR_FR1, LOW);
// digitalWrite(MOTOR_FR2, HIGH);

// digitalWrite(MOTOR_BL1, HIGH);
// digitalWrite(MOTOR_BL2, LOW);

// digitalWrite(MOTOR_BR1, HIGH);
// digitalWrite(MOTOR_BR2, LOW);

// }


// void rotateClockwise() {

// digitalWrite(MOTOR_FL1, HIGH);
// digitalWrite(MOTOR_FL2, LOW);

// digitalWrite(MOTOR_FR1, LOW);
// digitalWrite(MOTOR_FR2, HIGH);

// digitalWrite(MOTOR_BL1, HIGH);
// digitalWrite(MOTOR_BL2, LOW);

// digitalWrite(MOTOR_BR1, LOW);
// digitalWrite(MOTOR_BR2, HIGH);

// }


// void rotateAnticlockwise() {

// digitalWrite(MOTOR_FL1, LOW);
// digitalWrite(MOTOR_FL2, HIGH);

// digitalWrite(MOTOR_FR1, HIGH);
// digitalWrite(MOTOR_FR2, LOW);

// digitalWrite(MOTOR_BL1, LOW);
// digitalWrite(MOTOR_BL2, HIGH);

// digitalWrite(MOTOR_BR1, HIGH);
// digitalWrite(MOTOR_BR2, LOW);

// }


// void stopMotors() {

// digitalWrite(MOTOR_FL1, LOW);
// digitalWrite(MOTOR_FL2, LOW);

// digitalWrite(MOTOR_FR1, LOW);
// digitalWrite(MOTOR_FR2, LOW);

// digitalWrite(MOTOR_BL1, LOW);
// digitalWrite(MOTOR_BL2, LOW);

// digitalWrite(MOTOR_BR1, LOW);
// digitalWrite(MOTOR_BR2, LOW);

// }


// // ---------- SERVO ----------

// void setServoPosition(int position){

// servoPosition = position;

// myServo.detach();

// delay(10);

// myServo.attach(SERVO_PIN);

// myServo.write(servoPosition);

// }

// `;


// // ===== SETUP =====

// Blockly.Arduino.setups_['robot_setup'] = `

// pinMode(MOTOR_FL1, OUTPUT);
// pinMode(MOTOR_FL2, OUTPUT);
// pinMode(MOTOR_FR1, OUTPUT);
// pinMode(MOTOR_FR2, OUTPUT);
// pinMode(MOTOR_BL1, OUTPUT);
// pinMode(MOTOR_BL2, OUTPUT);
// pinMode(MOTOR_BR1, OUTPUT);
// pinMode(MOTOR_BR2, OUTPUT);

// myServo.attach(SERVO_PIN);
// myServo.write(servoPosition);

// SerialBT.begin(${name});

// Serial.println("Bluetooth Robot Ready");

// `;


// // ===== LOOP =====

// Blockly.Arduino.loops_['robot_loop'] = `

// if (SerialBT.available()) {

// command = SerialBT.read();

// switch(command){

// case 'u': moveForward(); break;
// case 'd': moveBackward(); break;
// case 'l': moveLeft(); break;
// case 'r': moveRight(); break;
// case 'C': rotateClockwise(); break;
// case 'G': rotateAnticlockwise(); break;
// case 'n': stopMotors(); break;
// case 'f': setServoPosition(70); break;
// case 'b': setServoPosition(0); break;

// break;
// }

// }

// `;

// return '';

// };


// Blockly.Arduino.ble_robot_full_2 = function(block){

// const name =
// Blockly.Arduino.valueToCode(block,'NAME',
// Blockly.Arduino.ORDER_ATOMIC) || '"Pen"';


// // ===== INCLUDE =====

// Blockly.Arduino.includes_['ble_robot'] = `
// #include "BluetoothSerial.h"
// #include <ESP32Servo.h>
// `;


// // ===== MOTOR PINS =====

// Blockly.Arduino.definitions_['motor_pins'] = `
// #define MOTOR_FL1 13
// #define MOTOR_FL2 2
// #define MOTOR_FR1 18
// #define MOTOR_FR2 12
// #define MOTOR_BL1 15
// #define MOTOR_BL2 23
// #define MOTOR_BR1 19
// #define MOTOR_BR2 27

// #define SERVO_PIN 14
// `;


// // ===== VARIABLES =====

// Blockly.Arduino.definitions_['robot_vars'] = `
// BluetoothSerial SerialBT;

// Servo myServo;

// int servoPosition = 0;

// char command;
// `;


// // ===== FUNCTIONS =====

// Blockly.Arduino.definitions_['robot_functions'] = `

// // ---------- MOVEMENT ----------

// void moveForward() {

// digitalWrite(MOTOR_FL1, LOW);
// digitalWrite(MOTOR_FL2, HIGH);

// digitalWrite(MOTOR_FR1, HIGH);
// digitalWrite(MOTOR_FR2, LOW);

// digitalWrite(MOTOR_BL1, HIGH);
// digitalWrite(MOTOR_BL2, LOW);

// digitalWrite(MOTOR_BR1, LOW);
// digitalWrite(MOTOR_BR2, HIGH);

// }


// void moveBackward() {

// digitalWrite(MOTOR_FL1, HIGH);
// digitalWrite(MOTOR_FL2, LOW);

// digitalWrite(MOTOR_FR1, LOW);
// digitalWrite(MOTOR_FR2, HIGH);

// digitalWrite(MOTOR_BL1, LOW);
// digitalWrite(MOTOR_BL2, HIGH);

// digitalWrite(MOTOR_BR1, HIGH);
// digitalWrite(MOTOR_BR2, LOW);

// }


// void moveLeft() {

// digitalWrite(MOTOR_FL1, HIGH);
// digitalWrite(MOTOR_FL2, LOW);

// digitalWrite(MOTOR_FR1, HIGH);
// digitalWrite(MOTOR_FR2, LOW);

// digitalWrite(MOTOR_BL1, LOW);
// digitalWrite(MOTOR_BL2, HIGH);

// digitalWrite(MOTOR_BR1, LOW);
// digitalWrite(MOTOR_BR2, HIGH);

// }


// void moveRight() {

// digitalWrite(MOTOR_FL1, LOW);
// digitalWrite(MOTOR_FL2, HIGH);

// digitalWrite(MOTOR_FR1, LOW);
// digitalWrite(MOTOR_FR2, HIGH);

// digitalWrite(MOTOR_BL1, HIGH);
// digitalWrite(MOTOR_BL2, LOW);

// digitalWrite(MOTOR_BR1, HIGH);
// digitalWrite(MOTOR_BR2, LOW);

// }


// void rotateClockwise() {

// digitalWrite(MOTOR_FL1, HIGH);
// digitalWrite(MOTOR_FL2, LOW);

// digitalWrite(MOTOR_FR1, LOW);
// digitalWrite(MOTOR_FR2, HIGH);

// digitalWrite(MOTOR_BL1, HIGH);
// digitalWrite(MOTOR_BL2, LOW);

// digitalWrite(MOTOR_BR1, LOW);
// digitalWrite(MOTOR_BR2, HIGH);

// }


// void rotateAnticlockwise() {

// digitalWrite(MOTOR_FL1, LOW);
// digitalWrite(MOTOR_FL2, HIGH);

// digitalWrite(MOTOR_FR1, HIGH);
// digitalWrite(MOTOR_FR2, LOW);

// digitalWrite(MOTOR_BL1, LOW);
// digitalWrite(MOTOR_BL2, HIGH);

// digitalWrite(MOTOR_BR1, HIGH);
// digitalWrite(MOTOR_BR2, LOW);

// }


// void stopMotors() {

// digitalWrite(MOTOR_FL1, LOW);
// digitalWrite(MOTOR_FL2, LOW);

// digitalWrite(MOTOR_FR1, LOW);
// digitalWrite(MOTOR_FR2, LOW);

// digitalWrite(MOTOR_BL1, LOW);
// digitalWrite(MOTOR_BL2, LOW);

// digitalWrite(MOTOR_BR1, LOW);
// digitalWrite(MOTOR_BR2, LOW);

// }


// // ---------- SERVO ----------

// void setServoPosition(int position){

// servoPosition = position;

// myServo.detach();

// delay(10);

// myServo.attach(SERVO_PIN);

// myServo.write(servoPosition);

// }

// `;


// // ===== SETUP =====

// Blockly.Arduino.setups_['robot_setup'] = `

// pinMode(MOTOR_FL1, OUTPUT);
// pinMode(MOTOR_FL2, OUTPUT);
// pinMode(MOTOR_FR1, OUTPUT);
// pinMode(MOTOR_FR2, OUTPUT);
// pinMode(MOTOR_BL1, OUTPUT);
// pinMode(MOTOR_BL2, OUTPUT);
// pinMode(MOTOR_BR1, OUTPUT);
// pinMode(MOTOR_BR2, OUTPUT);

// myServo.attach(SERVO_PIN);
// myServo.write(servoPosition);

// SerialBT.begin(${name});

// Serial.println("Bluetooth Robot Ready");

// `;


// // ===== LOOP =====

// Blockly.Arduino.loops_['robot_loop'] = `

// if (SerialBT.available()) {

// command = SerialBT.read();

// switch(command){

// case 'u': moveForward(); break;
// case 'd': moveBackward(); break;
// case 'l': moveLeft(); break;
// case 'r': moveRight(); break;
// case 'C': rotateClockwise(); break;
// case 'G': rotateAnticlockwise(); break;
// case 'n': stopMotors(); break;
// case 'f': setServoPosition(70); break;
// case 'b': setServoPosition(0); break;

// break;
// }

// }

// `;

// return '';

// };



// Blockly.Arduino.ble_robot_full_3 = function(block){

// const name =
// Blockly.Arduino.valueToCode(block,'NAME',
// Blockly.Arduino.ORDER_ATOMIC) || '"Soccer"';


// // ===== INCLUDE =====

// Blockly.Arduino.includes_['ble_robot'] = `
// #include "BluetoothSerial.h"
// #include <ESP32Servo.h>
// `;


// // ===== MOTOR PINS =====

// Blockly.Arduino.definitions_['motor_pins'] = `
// #define MOTOR_FL1 13
// #define MOTOR_FL2 2
// #define MOTOR_FR1 18
// #define MOTOR_FR2 12
// #define MOTOR_BL1 15
// #define MOTOR_BL2 23
// #define MOTOR_BR1 19
// #define MOTOR_BR2 27

// #define SERVO_PIN 14
// `;


// // ===== VARIABLES =====

// Blockly.Arduino.definitions_['robot_vars'] = `
// BluetoothSerial SerialBT;

// Servo myServo;

// int servoPosition = 0;

// char command;
// `;


// // ===== FUNCTIONS =====

// Blockly.Arduino.definitions_['robot_functions'] = `

// // ---------- MOVEMENT ----------

// void moveForward() {

// digitalWrite(MOTOR_FL1, LOW);
// digitalWrite(MOTOR_FL2, HIGH);

// digitalWrite(MOTOR_FR1, HIGH);
// digitalWrite(MOTOR_FR2, LOW);

// digitalWrite(MOTOR_BL1, HIGH);
// digitalWrite(MOTOR_BL2, LOW);

// digitalWrite(MOTOR_BR1, LOW);
// digitalWrite(MOTOR_BR2, HIGH);

// }


// void moveBackward() {

// digitalWrite(MOTOR_FL1, HIGH);
// digitalWrite(MOTOR_FL2, LOW);

// digitalWrite(MOTOR_FR1, LOW);
// digitalWrite(MOTOR_FR2, HIGH);

// digitalWrite(MOTOR_BL1, LOW);
// digitalWrite(MOTOR_BL2, HIGH);

// digitalWrite(MOTOR_BR1, HIGH);
// digitalWrite(MOTOR_BR2, LOW);

// }


// void moveLeft() {

// digitalWrite(MOTOR_FL1, HIGH);
// digitalWrite(MOTOR_FL2, LOW);

// digitalWrite(MOTOR_FR1, HIGH);
// digitalWrite(MOTOR_FR2, LOW);

// digitalWrite(MOTOR_BL1, LOW);
// digitalWrite(MOTOR_BL2, HIGH);

// digitalWrite(MOTOR_BR1, LOW);
// digitalWrite(MOTOR_BR2, HIGH);

// }


// void moveRight() {

// digitalWrite(MOTOR_FL1, LOW);
// digitalWrite(MOTOR_FL2, HIGH);

// digitalWrite(MOTOR_FR1, LOW);
// digitalWrite(MOTOR_FR2, HIGH);

// digitalWrite(MOTOR_BL1, HIGH);
// digitalWrite(MOTOR_BL2, LOW);

// digitalWrite(MOTOR_BR1, HIGH);
// digitalWrite(MOTOR_BR2, LOW);

// }


// void rotateClockwise() {

// digitalWrite(MOTOR_FL1, HIGH);
// digitalWrite(MOTOR_FL2, LOW);

// digitalWrite(MOTOR_FR1, LOW);
// digitalWrite(MOTOR_FR2, HIGH);

// digitalWrite(MOTOR_BL1, HIGH);
// digitalWrite(MOTOR_BL2, LOW);

// digitalWrite(MOTOR_BR1, LOW);
// digitalWrite(MOTOR_BR2, HIGH);

// }


// void rotateAnticlockwise() {

// digitalWrite(MOTOR_FL1, LOW);
// digitalWrite(MOTOR_FL2, HIGH);

// digitalWrite(MOTOR_FR1, HIGH);
// digitalWrite(MOTOR_FR2, LOW);

// digitalWrite(MOTOR_BL1, LOW);
// digitalWrite(MOTOR_BL2, HIGH);

// digitalWrite(MOTOR_BR1, HIGH);
// digitalWrite(MOTOR_BR2, LOW);

// }


// void stopMotors() {

// digitalWrite(MOTOR_FL1, LOW);
// digitalWrite(MOTOR_FL2, LOW);

// digitalWrite(MOTOR_FR1, LOW);
// digitalWrite(MOTOR_FR2, LOW);

// digitalWrite(MOTOR_BL1, LOW);
// digitalWrite(MOTOR_BL2, LOW);

// digitalWrite(MOTOR_BR1, LOW);
// digitalWrite(MOTOR_BR2, LOW);

// }


// // ---------- SERVO ----------

// void setServoPosition(int position){

// servoPosition = position;

// myServo.detach();

// delay(10);

// myServo.attach(SERVO_PIN);

// myServo.write(servoPosition);

// }

// `;


// // ===== SETUP =====

// Blockly.Arduino.setups_['robot_setup'] = `

// pinMode(MOTOR_FL1, OUTPUT);
// pinMode(MOTOR_FL2, OUTPUT);
// pinMode(MOTOR_FR1, OUTPUT);
// pinMode(MOTOR_FR2, OUTPUT);
// pinMode(MOTOR_BL1, OUTPUT);
// pinMode(MOTOR_BL2, OUTPUT);
// pinMode(MOTOR_BR1, OUTPUT);
// pinMode(MOTOR_BR2, OUTPUT);

// myServo.attach(SERVO_PIN);
// myServo.write(servoPosition);

// SerialBT.begin(${name});

// Serial.println("Bluetooth Robot Ready");

// `;


// // ===== LOOP =====

// Blockly.Arduino.loops_['robot_loop'] = `

// if (SerialBT.available()) {

// command = SerialBT.read();

// switch(command){

// case 'u': moveForward(); break;
// case 'd': moveBackward(); break;
// case 'l': moveLeft(); break;
// case 'r': moveRight(); break;
// case 'C': rotateClockwise(); break;
// case 'G': rotateAnticlockwise(); break;
// case 'n': stopMotors(); break;
// case 'f': setServoPosition(70); break;
// case 'b': setServoPosition(0); break;

// break;
// }

// }

// `;

// return '';

// };



// Blockly.Arduino.ble_robot_full_4 = function(block){

// const name =
// Blockly.Arduino.valueToCode(block,'NAME',
// Blockly.Arduino.ORDER_ATOMIC) || '"Gripper"';


// // ===== INCLUDE =====

// Blockly.Arduino.includes_['ble_robot'] = `
// #include "BluetoothSerial.h"
// #include <ESP32Servo.h>
// `;


// // ===== MOTOR PINS =====

// Blockly.Arduino.definitions_['motor_pins'] = `
// #define MOTOR_FL1 13
// #define MOTOR_FL2 2
// #define MOTOR_FR1 18
// #define MOTOR_FR2 12
// #define MOTOR_BL1 15
// #define MOTOR_BL2 23
// #define MOTOR_BR1 19
// #define MOTOR_BR2 27

// #define SERVO_PIN 14
// `;


// // ===== VARIABLES =====

// Blockly.Arduino.definitions_['robot_vars'] = `
// BluetoothSerial SerialBT;

// Servo myServo;

// int servoPosition = 0;

// char command;
// `;


// // ===== FUNCTIONS =====

// Blockly.Arduino.definitions_['robot_functions'] = `

// // ---------- MOVEMENT ----------

// void moveForward() {

// digitalWrite(MOTOR_FL1, LOW);
// digitalWrite(MOTOR_FL2, HIGH);

// digitalWrite(MOTOR_FR1, HIGH);
// digitalWrite(MOTOR_FR2, LOW);

// digitalWrite(MOTOR_BL1, HIGH);
// digitalWrite(MOTOR_BL2, LOW);

// digitalWrite(MOTOR_BR1, LOW);
// digitalWrite(MOTOR_BR2, HIGH);

// }


// void moveBackward() {

// digitalWrite(MOTOR_FL1, HIGH);
// digitalWrite(MOTOR_FL2, LOW);

// digitalWrite(MOTOR_FR1, LOW);
// digitalWrite(MOTOR_FR2, HIGH);

// digitalWrite(MOTOR_BL1, LOW);
// digitalWrite(MOTOR_BL2, HIGH);

// digitalWrite(MOTOR_BR1, HIGH);
// digitalWrite(MOTOR_BR2, LOW);

// }


// void moveLeft() {

// digitalWrite(MOTOR_FL1, HIGH);
// digitalWrite(MOTOR_FL2, LOW);

// digitalWrite(MOTOR_FR1, HIGH);
// digitalWrite(MOTOR_FR2, LOW);

// digitalWrite(MOTOR_BL1, LOW);
// digitalWrite(MOTOR_BL2, HIGH);

// digitalWrite(MOTOR_BR1, LOW);
// digitalWrite(MOTOR_BR2, HIGH);

// }


// void moveRight() {

// digitalWrite(MOTOR_FL1, LOW);
// digitalWrite(MOTOR_FL2, HIGH);

// digitalWrite(MOTOR_FR1, LOW);
// digitalWrite(MOTOR_FR2, HIGH);

// digitalWrite(MOTOR_BL1, HIGH);
// digitalWrite(MOTOR_BL2, LOW);

// digitalWrite(MOTOR_BR1, HIGH);
// digitalWrite(MOTOR_BR2, LOW);

// }


// void rotateClockwise() {

// digitalWrite(MOTOR_FL1, HIGH);
// digitalWrite(MOTOR_FL2, LOW);

// digitalWrite(MOTOR_FR1, LOW);
// digitalWrite(MOTOR_FR2, HIGH);

// digitalWrite(MOTOR_BL1, HIGH);
// digitalWrite(MOTOR_BL2, LOW);

// digitalWrite(MOTOR_BR1, LOW);
// digitalWrite(MOTOR_BR2, HIGH);

// }


// void rotateAnticlockwise() {

// digitalWrite(MOTOR_FL1, LOW);
// digitalWrite(MOTOR_FL2, HIGH);

// digitalWrite(MOTOR_FR1, HIGH);
// digitalWrite(MOTOR_FR2, LOW);

// digitalWrite(MOTOR_BL1, LOW);
// digitalWrite(MOTOR_BL2, HIGH);

// digitalWrite(MOTOR_BR1, HIGH);
// digitalWrite(MOTOR_BR2, LOW);

// }


// void stopMotors() {

// digitalWrite(MOTOR_FL1, LOW);
// digitalWrite(MOTOR_FL2, LOW);

// digitalWrite(MOTOR_FR1, LOW);
// digitalWrite(MOTOR_FR2, LOW);

// digitalWrite(MOTOR_BL1, LOW);
// digitalWrite(MOTOR_BL2, LOW);

// digitalWrite(MOTOR_BR1, LOW);
// digitalWrite(MOTOR_BR2, LOW);

// }


// // ---------- SERVO ----------

// void setServoPosition(int position){

// servoPosition = position;

// myServo.detach();

// delay(10);

// myServo.attach(SERVO_PIN);

// myServo.write(servoPosition);

// }

// `;


// // ===== SETUP =====

// Blockly.Arduino.setups_['robot_setup'] = `

// pinMode(MOTOR_FL1, OUTPUT);
// pinMode(MOTOR_FL2, OUTPUT);
// pinMode(MOTOR_FR1, OUTPUT);
// pinMode(MOTOR_FR2, OUTPUT);
// pinMode(MOTOR_BL1, OUTPUT);
// pinMode(MOTOR_BL2, OUTPUT);
// pinMode(MOTOR_BR1, OUTPUT);
// pinMode(MOTOR_BR2, OUTPUT);

// myServo.attach(SERVO_PIN);
// myServo.write(servoPosition);

// SerialBT.begin(${name});

// Serial.println("Bluetooth Robot Ready");

// `;


// // ===== LOOP =====

// Blockly.Arduino.loops_['robot_loop'] = `

// if (SerialBT.available()) {

// command = SerialBT.read();

// switch(command){

// case 'u': moveForward(); break;
// case 'd': moveBackward(); break;
// case 'l': moveLeft(); break;
// case 'r': moveRight(); break;
// case 'C': rotateClockwise(); break;
// case 'G': rotateAnticlockwise(); break;
// case 'n': stopMotors(); break;
// case 'f': setServoPosition(60); break;
// case 'b': setServoPosition(0); break;

// break;
// }

// }

// `;

// return '';

// <block type="ble_robot_full_1">
//   <value name="NAME">
    // <shadow type="text">
    //   <field name="TEXT">DOZZRE</field>
//     </shadow>
//   </value>
// </block>

// <block type="ble_robot_full_2">
//   <value name="NAME">
//     <shadow type="text">
//       <field name="TEXT">pen</field>
//     </shadow>
//   </value>
// </block>
// <block type="ble_robot_full_3">
//   <value name="NAME">
//     <shadow type="text">
//       <field name="TEXT">Soccer</field>
//     </shadow>
//   </value>
// </block>
// <block type="ble_robot_full_4">
//   <value name="NAME">
//     <shadow type="text">
//       <field name="TEXT">Gripper</field>
//     </shadow>
//   </value>
// </block>
// };
return Blockly;

}

exports = addGenerator;