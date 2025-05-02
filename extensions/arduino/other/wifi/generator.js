function addGenerator(Blockly) {
  Blockly.Arduino.wifi_connect = function (block) {
    const ssid = Blockly.Arduino.valueToCode(block, 'SSID', Blockly.Arduino.ORDER_ATOMIC) || '""';
    const password = Blockly.Arduino.valueToCode(block, 'PASSWORD', Blockly.Arduino.ORDER_ATOMIC) || '""';

    // Include necessary libraries
    Blockly.Arduino.includes_['wifi'] = `
#include <WiFi.h>
#include <WebServer.h>`;

    // Define WiFi credentials
    Blockly.Arduino.definitions_['wifi_credentials'] = `
const char* ssid = ${ssid};
const char* password = ${password};
WebServer server(80);`;

    // Setup function
    Blockly.Arduino.setups_['wifi_setup'] = `
Serial.begin(115200);
initializeWiFi();`;

    // Full initializeWiFi function
    Blockly.Arduino.definitions_['initialize_wifi_function'] = `
void handleConnect() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", "Connected to WiFi");
}

void handleDisconnect() {
  WiFi.disconnect();
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", "Disconnected from WiFi");
}

void initializeWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  unsigned long startAttemptTime = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - startAttemptTime >= 10000) {
      Serial.println("❌ WiFi Connection Failed!");
      return;
    }
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("✅ Connected to WiFi");
  Serial.println("IP Address: " + WiFi.localIP().toString());

  server.on("/connect", HTTP_GET, handleConnect);
  server.on("/disconnect", HTTP_POST, handleDisconnect);

  server.on("/", HTTP_GET, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/plain", "Hello from ESP32 (WebServer)");
  });

  server.on("/control", HTTP_POST, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");

    if (!server.hasArg("plain")) {
      server.send(400, "text/plain", "No data received");
      return;
    }

    String command = server.arg("plain");
    Serial.println("📩 Received Command:");
    Serial.println(command);

    if (command.startsWith("SET_DIGITAL_OUTPUT")) {
      command.replace("SET_DIGITAL_OUTPUT", "");
      command.trim();
      String tokens[20];
      int i = 0;
      while (command.length() > 0 && i < 20) {
        int spaceIndex = command.indexOf(' ');
        if (spaceIndex == -1) {
          tokens[i++] = command;
          break;
        } else {
          tokens[i++] = command.substring(0, spaceIndex);
          command = command.substring(spaceIndex + 1);
          command.trim();
        }
      }
      for (int j = 0; j < i - 1; j += 2) {
        int pinNum = tokens[j].toInt();
        String state = tokens[j + 1];
        pinMode(pinNum, OUTPUT);
        digitalWrite(pinNum, (state == "HIGH") ? HIGH : LOW);
        Serial.printf("✅ Pin %d set to %s\\n", pinNum, state.c_str());
      }
      server.send(200, "text/plain", "✅ Pins updated");

    } else if (command.startsWith("SET_PIN_MODE")) {
      int pin;
      char mode[10];
      sscanf(command.c_str(), "SET_PIN_MODE %d %s", &pin, mode);
      if (strcmp(mode, "INPUT") == 0) {
        pinMode(pin, INPUT);
        Serial.printf("📥 Pin %d set to INPUT\\n", pin);
      } else if (strcmp(mode, "OUTPUT") == 0) {
        pinMode(pin, OUTPUT);
        Serial.printf("📤 Pin %d set to OUTPUT\\n", pin);
      }
      server.send(200, "text/plain", "✅ Pin mode set");

    } else if (command.startsWith("READ_ANALOG")) {
      int pin;
      sscanf(command.c_str(), "READ_ANALOG %d", &pin);
      if (pin >= 0 && pin <= 39) {
        int value = analogRead(pin);
        Serial.printf("📡 Analog value on pin %d: %d\\n", pin, value);
        server.send(200, "text/plain", String(value));
      } else {
        server.send(400, "text/plain", "⚠ Invalid analog pin");
      }

    } else if (command.startsWith("DIGITAL_WRITE")) {
      int pin, value;
      sscanf(command.c_str(), "DIGITAL_WRITE %d %d", &pin, &value);
      digitalWrite(pin, value);
      Serial.printf("💡 Digital write on pin %d with value %d\\n", pin, value);
      server.send(200, "text/plain", "✅ Digital write done");

    } else if (command.startsWith("DIGITAL_READ")) {
      int pin;
      sscanf(command.c_str(), "DIGITAL_READ %d", &pin);
      int value = digitalRead(pin);
      Serial.printf("📶 Digital read on pin %d: %d\\n", pin, value);
      server.send(200, "text/plain", String(value));

    } else {
      Serial.println("❓ Unknown command received");
      server.send(400, "text/plain", "⚠ Unknown command");
    }
  });

  server.begin();
  Serial.println("🌍 HTTP Server Started");
}`;

    // Loop function
    Blockly.Arduino.loops_['wifi_loop'] = `
server.handleClient();`;

    return '';
  };

  return Blockly;
}

exports = addGenerator;