#include "MAX30100_PulseOximeter.h"
#include <Adafruit_GFX.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_SH110X.h>
#include <Adafruit_Sensor.h>
#include <DallasTemperature.h>
#include <OneWire.h>
#include <Wire.h>

//BLE and JSON Libraries
#include <ArduinoJson.h>
#include <BLE2902.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_ADDR 0x3C
#define TEMP_DATA_PIN 23

Adafruit_SH1106G display =
    Adafruit_SH1106G(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
Adafruit_MPU6050 mpu;
OneWire oneWire(TEMP_DATA_PIN);
DallasTemperature sensors(&oneWire);
PulseOximeter pox;

//BLE specific variables
BLEServer *pServer = NULL;
BLECharacteristic *pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *pServer) { deviceConnected = true; };
  void onDisconnect(BLEServer *pServer) { deviceConnected = false; }
};

const unsigned char PROGMEM heart_bmp[] = {
    0x00, 0x00, 0x1c, 0x38, 0x3e, 0x7c, 0x7f, 0xfe, 0x7f, 0xfe, 0x7f,
    0xfe, 0x3f, 0xfc, 0x1f, 0xf8, 0x0f, 0xf0, 0x07, 0xe0, 0x03, 0xc0,
    0x01, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};

//Global Health Data
volatile int currentBPM = 0;
volatile int currentSpO2 = 0;
float currentTemp = 0.0;
float currentVib = 0.0;
float currentTiltY = 0.0;
int currentSteps = 0;
float lastVib = 0.0;

//Timers
unsigned long lastPageChange = 0;
unsigned long lastBLEUpdate = 0;
unsigned long lastStepTime = 0;
unsigned long lastRefresh = 0;
unsigned long lastTempRequest = 0;
unsigned long lastSensorRead = 0;

//Page 3 (NOTIFY) variables
unsigned long notifyDwellStart = 0;
bool notifySent = false;
bool sendNotifyFlag = false;

int currentPage = 1;

//Dual-Core FreeRTOS Task Handle
TaskHandle_t SensorTaskHandle;

//CORE 0 TASK: This runs ONLY the MAX30100 sensor loop
void SensorTask(void *pvParameters) {
  unsigned long lastPrint = 0;

  for (;;) {      //Infinite Loop bounded entirely to Core 0
    pox.update(); //Update the sensor constantly without ANY BLE interruptions

    //Transfer values to global variables safely every 1 sec
    if (millis() - lastPrint > 1000) {
      lastPrint = millis();
      currentBPM = (int)pox.getHeartRate();
      currentSpO2 = pox.getSpO2();
    }

    //Tiny yield to prevent watchdog on Core 0 from barking
    vTaskDelay(pdMS_TO_TICKS(1));
  }
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  if (!display.begin(OLED_ADDR, true)) {
    Serial.println("OLED failed");
    for (;;)
      ;
  }
  display.setTextColor(SH110X_WHITE);

  //Splash Screen
  display.clearDisplay();
  display.drawBitmap(56, 12, heart_bmp, 16, 16, SH110X_WHITE);
  display.setTextSize(1);
  display.setCursor(18, 42);
  display.print("Fitness Tracker");
  display.display();
  delay(1000);

  //Initialize Sensors
  if (!mpu.begin())
    Serial.println("MPU6050 failed");
  sensors.begin();
  sensors.setWaitForConversion(false);

  //Initialize MAX30100
  Serial.print("Initializing MAX30100...");
  if (!pox.begin()) {
    Serial.println("FAILED");
  } else {
    Serial.println("SUCCESS");
    pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);
  }

  //CREATE CORE 0 TASK FOR SENSOR
  xTaskCreatePinnedToCore(SensorTask,        //Function to implement the task
                          "SensorTask",      //Name of the task
                          10000,             //Stack size in words
                          NULL,              //Task input parameter
                          1,                 //Priority of the task
                          &SensorTaskHandle, //Task handle
                          0                  //PIN TO CORE 0
  );

  //Initialize BLE
  BLEDevice::init("SHWatch");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(
      CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  pCharacteristic->addDescriptor(new BLE2902());
  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  Serial.println("Watch Ready & Advertising...");
}

void loop() {

  //CORE 1 (Default): Runs BLE, OLED, MPU6050, Temp
  if (millis() - lastSensorRead > 200) {
    lastSensorRead = millis();

    sensors_event_t a, g, temp_mpu;
    mpu.getEvent(&a, &g, &temp_mpu);

    currentTiltY = g.gyro.y;
    currentVib = sqrt(pow(a.acceleration.x, 2) + pow(a.acceleration.y, 2) +
                      pow(a.acceleration.z, 2));

    if (currentVib > 12.0 && lastVib <= 12.0) {
      if (millis() - lastStepTime > 300) {
        currentSteps++;
        lastStepTime = millis();
      }
    }
    lastVib = currentVib;

    if (millis() - lastPageChange > 700) {
      int prevPage = currentPage;
      if (currentTiltY < -2.5) {
        if (currentPage < 3)
          currentPage++;
        lastPageChange = millis();
      } else if (currentTiltY > 2.5) {
        if (currentPage > 0)
          currentPage--;
        lastPageChange = millis();
      }

      //Reset notify state when leaving page 3
      if (prevPage == 3 && currentPage != 3) {
        notifyDwellStart = 0;
        notifySent = false;
      }
      //Start dwell timer when entering page 3
      if (currentPage == 3 && prevPage != 3) {
        notifyDwellStart = millis();
        notifySent = false;
      }
    }
  }

  if (millis() - lastTempRequest > 5000) {
    float tempRaw = sensors.getTempCByIndex(0);
    if (tempRaw != -127.0)
      currentTemp = tempRaw;
    sensors.requestTemperatures();
    lastTempRequest = millis();
  }

  //Page 3 NOTIFY: Check 5-second dwell
  if (currentPage == 3 && !notifySent && notifyDwellStart > 0) {
    if (deviceConnected && (millis() - notifyDwellStart >= 5000)) {
      sendNotifyFlag = true;
      notifySent = true;
    }
  }

  if (deviceConnected && millis() - lastBLEUpdate > 1000) {
    lastBLEUpdate = millis();
    StaticJsonDocument<200> doc;

    //Core 1 reads from Core 0's variables safely
    doc["bpm"] = currentBPM;
    doc["spo2"] = currentSpO2;
    doc["temp"] = currentTemp;
    doc["vib"] = currentVib;
    doc["steps"] = currentSteps;

    if (sendNotifyFlag) {
      doc["notify"] = 1;
      sendNotifyFlag = false;
    }

    char payload[200];
    serializeJson(doc, payload);
    pCharacteristic->setValue(payload);
    pCharacteristic->notify();
  }

  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    oldDeviceConnected = deviceConnected;
  }
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }

  if (millis() - lastRefresh > 250) {
    lastRefresh = millis();
    display.clearDisplay();

    if (currentPage == 1) {
      //HOME
      display.setTextSize(1);
      display.setCursor(45, 5);
      display.print("Health");
      display.drawRoundRect(10, 20, 108, 24, 6, SH110X_WHITE);
      display.setTextSize(2);
      display.setCursor(40, 25);
      display.print("HOME");
      if (deviceConnected) {
        display.setTextSize(1);
        display.setCursor(110, 5);
        display.print("BLE");
      }
      if (currentTiltY > 0.5)
        display.fillTriangle(2, 32, 8, 26, 8, 38, SH110X_WHITE);
      if (currentTiltY < -0.5)
        display.fillTriangle(125, 32, 119, 26, 119, 38, SH110X_WHITE);
      display.setTextSize(1);
      display.setCursor(32, 52);
      display.print("Temp & Gyro");
    } else if (currentPage == 0) {
      //HEALTH
      display.setTextSize(1);
      display.setCursor(40, 0);
      display.print("HEALTH");
      display.drawLine(0, 10, 128, 10, SH110X_WHITE);
      display.setTextSize(2);
      display.setCursor(0, 22);
      display.print("BPM: ");
      display.print(currentBPM);
      display.setCursor(0, 46);
      display.print("O2 : ");
      display.print(currentSpO2);
      display.print("%");
    } else if (currentPage == 2) {
      //SYSTEM
      display.setTextSize(1);
      display.setCursor(30, 0);
      display.print("TEMP & GYRO");
      display.drawLine(0, 10, 128, 10, SH110X_WHITE);
      display.setCursor(0, 20);
      display.print("Body T: ");
      display.print(currentTemp, 1);
      display.print(" C");
      display.setCursor(0, 32);
      display.print("Steps: ");
      display.print(currentSteps);
      display.setCursor(0, 44);
      display.print("Vib: ");
      display.print(currentVib, 1);
      display.setCursor(0, 56);
      display.print("Gyro Y: ");
      display.print(currentTiltY, 2);
    } else if (currentPage == 3) {
      //NOTIFY PAGE
      display.setTextSize(1);
      display.setCursor(40, 0);
      display.print("NOTIFY");
      display.drawLine(0, 10, 128, 10, SH110X_WHITE);

      if (!deviceConnected) {
        display.setCursor(10, 28);
        display.print("BLE not connected");
      } else if (notifySent) {
        display.setTextSize(2);
        display.setCursor(20, 22);
        display.print("SENT!");
        display.setTextSize(1);
        display.setCursor(12, 48);
        display.print("Tilt back to reset");
      } else if (notifyDwellStart > 0) {
        unsigned long elapsed = millis() - notifyDwellStart;
        int remaining = 5 - (int)(elapsed / 1000);
        if (remaining < 0)
          remaining = 0;
        display.setTextSize(1);
        display.setCursor(10, 18);
        display.print("Sending alert in:");
        display.setTextSize(3);
        display.setCursor(52, 34);
        display.print(remaining);
      } else {
        display.setCursor(10, 28);
        display.print("Stay here 5 sec");
        display.setCursor(10, 42);
        display.print("to send alert");
      }
    }
    display.display();
  }
}
