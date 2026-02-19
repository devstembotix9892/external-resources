function addGenerator(Blockly) {

  Blockly.Arduino.ble_connection = function (block) {

    const name =
      Blockly.Arduino.valueToCode(block,'NAME',
      Blockly.Arduino.ORDER_ATOMIC) || '"ESP32_BLE"';

    Blockly.Arduino.includes_['ble_includes'] = `
#include <ESP32Servo.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <driver/ledc.h>
#include <TM1637Display.h>
#include <DHT.h>
#include <Adafruit_NeoPixel.h>

Servo myServo[40];

#define SERVICE_UUID_ESPOTA "d804b643-6ce7-4e81-9f8a-ce0f699085eb"
#define CHARACTERISTIC_UUID_CMD "c8659211-af91-4ad3-a995-a58d6fd26145"

BLEServer* pServer;
BLEService* pService;
BLECharacteristic* pCmdCharacteristic;

// ===== TM1637 =====
TM1637Display* tm1637Display=nullptr;
bool tm1637_colon=false;

// ===== DHT =====
DHT* dhtSensors[4]={nullptr,nullptr,nullptr,nullptr};

// ===== LED MATRIX =====
Adafruit_NeoPixel* ledMatrix=nullptr;
int ledMatrixNumLeds=35;

// ===== HELPER =====
void sendResponse(const char* msg){
  if(!pCmdCharacteristic) return;
  pCmdCharacteristic->setValue(msg);
  pCmdCharacteristic->notify();
}

// ===== ULTRASONIC =====
float readUltrasonic(int trig,int echo){
  pinMode(trig,OUTPUT);
  pinMode(echo,INPUT);

  digitalWrite(trig,LOW);
  delayMicroseconds(5);
  digitalWrite(trig,HIGH);
  delayMicroseconds(10);
  digitalWrite(trig,LOW);

  long duration=pulseIn(echo,HIGH,50000);
  if(duration==0) return -1;
  return (duration*0.0343)/2.0;
}

// ===== BLE CALLBACK =====
class CommandCallback : public BLECharacteristicCallbacks {

void onWrite(BLECharacteristic* pCharacteristic){

String cmd=String(pCharacteristic->getValue().c_str());
cmd.trim();

// ===== BASIC =====
if(cmd.startsWith("SET_PIN_MODE")){
int pin; char mode[10];
sscanf(cmd.c_str(),"SET_PIN_MODE %d %s",&pin,mode);
pinMode(pin,strcmp(mode,"INPUT")==0?INPUT:OUTPUT);
sendResponse("OK");
}

else if(cmd.startsWith("SET_DIGITAL_OUTPUT")){
int pin,state;
sscanf(cmd.c_str(),"SET_DIGITAL_OUTPUT %d %d",&pin,&state);
pinMode(pin,OUTPUT);
digitalWrite(pin,state);
sendResponse("OK");
}

else if(cmd.startsWith("SET_SERVO_OUTPUT")){
int pin,angle;
sscanf(cmd.c_str(),"SET_SERVO_OUTPUT %d %d",&pin,&angle);
if(!myServo[pin].attached())
myServo[pin].attach(pin,600,2400);
myServo[pin].write(angle);
sendResponse("OK");
}

// ===== PWM =====
else if(cmd.startsWith("SET_PWM_OUTPUT")){
int pin,val;
sscanf(cmd.c_str(),"SET_PWM_OUTPUT %d %d",&pin,&val);

int channel=pin%16;
ledcSetup(channel,5000,8);
ledcAttachPin(pin,channel);
ledcWrite(channel,val);

sendResponse("OK");
}

// ===== TM1637 =====
else if(cmd.startsWith("TM1637_INIT")){
int dio,clk;
sscanf(cmd.c_str(),"TM1637_INIT %d %d",&dio,&clk);
if(tm1637Display) delete tm1637Display;
tm1637Display=new TM1637Display(clk,dio);
tm1637Display->setBrightness(7);
tm1637Display->clear();
sendResponse("OK");
}

else if(cmd.startsWith("TM1637_BRIGHTNESS")){
int b;
sscanf(cmd.c_str(),"TM1637_BRIGHTNESS %d",&b);
if(tm1637Display)
tm1637Display->setBrightness(constrain(b,0,7));
sendResponse("OK");
}

else if(cmd.startsWith("TM1637_NUMBER")){
int n;
sscanf(cmd.c_str(),"TM1637_NUMBER %d",&n);
if(tm1637Display)
tm1637Display->showNumberDecEx(n,tm1637_colon?0x40:0,false);
sendResponse("OK");
}

else if(cmd.startsWith("TM1637_STRING")){

  String txt = cmd.substring(14);
  txt.trim();
  txt.toUpperCase();

  if(tm1637Display){

    uint8_t seg[4]={0,0,0,0};

    for(int i=0;i<4 && i<txt.length();i++){

      char c = txt[i];

      if(c>='0' && c<='9'){
        seg[i] = tm1637Display->encodeDigit(c-'0');
      }
      else if(c>='A' && c<='Z'){
        // simple A-Z mapping
        const uint8_t map[]={
          0x77,0x7C,0x39,0x5E,0x79,0x71,0x3D,0x76,0x30,0x1E,
          0x75,0x38,0x37,0x54,0x3F,0x73,0x67,0x50,0x6D,0x78,
          0x3E,0x1C,0x7E,0x76,0x6E,0x5B
        };
        seg[i]=map[c-'A'];
      }
      else if(c=='-'){
        seg[i]=0x40;
      }
      else{
        seg[i]=0x00;
      }
    }

    tm1637Display->setSegments(seg);
  }

  sendResponse("OK");
}


else if(cmd.startsWith("TM1637_DIGIT")){
int d,pos;
sscanf(cmd.c_str(),"TM1637_DIGIT %d %d",&d,&pos);
if(tm1637Display && pos>=0 && pos<4){
uint8_t seg=tm1637Display->encodeDigit(d%10);
tm1637Display->setSegments(&seg,1,pos);
}
sendResponse("OK");
}

else if(cmd.startsWith("TM1637_CLEAR")){
if(tm1637Display) tm1637Display->clear();
sendResponse("OK");
}

else if(cmd.startsWith("TM1637_COLON")){
char st[10];
sscanf(cmd.c_str(),"TM1637_COLON %s",st);
tm1637_colon=strcmp(st,"true")==0 || strcmp(st,"1")==0;
sendResponse("OK");
}

// ===== DHT =====
else if(cmd.startsWith("DHT_INIT")){
int no,pin,model;
sscanf(cmd.c_str(),"DHT_INIT %d %d %d",&no,&pin,&model);
no--;
if(no>=0 && no<4){
if(dhtSensors[no]) delete dhtSensors[no];
dhtSensors[no]=new DHT(pin,model==22?DHT22:DHT11);
dhtSensors[no]->begin();
}
sendResponse("OK");
}

else if(cmd.startsWith("DHT_READ_TEMP")){
int no,unit;
char resp[32]="ERR";
sscanf(cmd.c_str(),"DHT_READ_TEMP %d %d",&no,&unit);
if(no>=1 && no<=4 && dhtSensors[no-1]){
float t=dhtSensors[no-1]->readTemperature(unit==1);
if(!isnan(t)) snprintf(resp,sizeof(resp),"DHT_TEMP %.2f",t);
}
sendResponse(resp);
}

else if(cmd.startsWith("DHT_READ_HUM")){
int no;
char resp[32]="ERR";
sscanf(cmd.c_str(),"DHT_READ_HUM %d",&no);
if(no>=1 && no<=4 && dhtSensors[no-1]){
float h=dhtSensors[no-1]->readHumidity();
if(!isnan(h)) snprintf(resp,sizeof(resp),"DHT_HUM %.2f",h);
}
sendResponse(resp);
}

// ===== ULTRASONIC =====
else if(cmd.startsWith("ULTRASONIC_READ")){
int trig,echo,inch;
char resp[32];
sscanf(cmd.c_str(),"ULTRASONIC_READ %d %d %d",&trig,&echo,&inch);
float d=readUltrasonic(trig,echo);
if(inch) d/=2.54;
snprintf(resp,sizeof(resp),"ULTRASONIC_DIST %.2f",d);
sendResponse(resp);
}

// ===== LED MATRIX =====
else if(cmd.startsWith("LEDMATRIX_INIT")){
int pin,num,b;
sscanf(cmd.c_str(),"LEDMATRIX_INIT %d %d %d",&pin,&num,&b);

if(ledMatrix) delete ledMatrix;
ledMatrixNumLeds=num;
ledMatrix=new Adafruit_NeoPixel(num,pin,NEO_GRB+NEO_KHZ800);
ledMatrix->begin();
ledMatrix->setBrightness(b);
ledMatrix->clear();
ledMatrix->show();

sendResponse("OK");
}

else if(cmd.startsWith("LEDMATRIX_BRIGHTNESS")){
int b;
sscanf(cmd.c_str(),"LEDMATRIX_BRIGHTNESS %d",&b);
if(ledMatrix){
ledMatrix->setBrightness(constrain(b,0,255));
ledMatrix->show();
}
sendResponse("OK");
}

else if(cmd.startsWith("LEDMATRIX_DIGIT")){
int d;
sscanf(cmd.c_str(),"LEDMATRIX_DIGIT %d",&d);
if(ledMatrix){
ledMatrix->clear();
for(int i=0;i<ledMatrixNumLeds;i++)
if(i<d) ledMatrix->setPixelColor(i,ledMatrix->Color(255,255,255));
ledMatrix->show();
}
sendResponse("OK");
}

else if(cmd.startsWith("LEDMATRIX_LETTER")){
if(ledMatrix){
ledMatrix->clear();
for(int i=0;i<ledMatrixNumLeds;i+=2)
ledMatrix->setPixelColor(i,ledMatrix->Color(0,255,0));
ledMatrix->show();
}
sendResponse("OK");
}

else if(cmd.startsWith("LEDMATRIX_SYMBOL")){
if(ledMatrix){
ledMatrix->clear();
for(int i=0;i<ledMatrixNumLeds;i+=3)
ledMatrix->setPixelColor(i,ledMatrix->Color(255,0,0));
ledMatrix->show();
}
sendResponse("OK");
}

else if(cmd.startsWith("LEDMATRIX_CUSTOM")){
String pattern=cmd.substring(17);
pattern.trim();

if(ledMatrix){
ledMatrix->clear();
int len=min((int)pattern.length(),ledMatrixNumLeds);
for(int i=0;i<len;i++)
if(pattern[i]=='1')
ledMatrix->setPixelColor(i,ledMatrix->Color(255,255,255));
ledMatrix->show();
}
sendResponse("OK");
}

else{
sendResponse("ERR");
}

}
};

// ===== BLE INIT =====
void initializeBLE(const char* name){

BLEDevice::init(name);

pServer=BLEDevice::createServer();
pService=pServer->createService(SERVICE_UUID_ESPOTA);

pCmdCharacteristic=pService->createCharacteristic(
CHARACTERISTIC_UUID_CMD,
BLECharacteristic::PROPERTY_WRITE |
BLECharacteristic::PROPERTY_NOTIFY
);

pCmdCharacteristic->addDescriptor(new BLE2902());
pCmdCharacteristic->setCallbacks(new CommandCallback());

pService->start();
BLEDevice::startAdvertising();
}
`;

    Blockly.Arduino.setups_['ble_setup'] = `
Serial.begin(57600);
initializeBLE(${name});
`;

    Blockly.Arduino.loops_['ble_loop'] = ``;

    return '';
  };

  return Blockly;
}

exports = addGenerator;
