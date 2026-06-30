// HC-SR04 ultrasonic distance sensor + piezo buzzer
// Buzzer beeps slower when far, faster when closer, continuous when very close

const int trigPin = 9;
const int echoPin = 10;
const int buzzerPin = 8;

// Distance thresholds (in cm) - tune these to your use case
const int MAX_RANGE = 100;   // beyond this, no beeping
const int CLOSE_RANGE = 5;   // closer than this, buzzer is continuous

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
}

long readDistanceCM() {
  // Send a 10us pulse to trigger the sensor
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Read the echo pulse duration, with a timeout to avoid blocking forever
  long duration = pulseIn(echoPin, HIGH, 30000); // 30ms timeout (~5m max range)

  if (duration == 0) {
    return -1; // no echo received (out of range or no object)
  }

  // Speed of sound ~343 m/s -> distance (cm) = duration * 0.0343 / 2
  long distance = duration * 0.0343 / 2;
  return distance;
}

void loop() {
  long distance = readDistanceCM();

  if (distance == -1 || distance > MAX_RANGE) {
    // Nothing in range - buzzer off
    noTone(buzzerPin);
    digitalWrite(buzzerPin, LOW);
  }
  else if (distance <= CLOSE_RANGE) {
    // Extremely close - continuous tone
    tone(buzzerPin, 2000); // steady tone, no gaps
  }
  else {
    // Scale beep delay based on distance: closer = shorter delay = faster beeps
    // Maps distance (CLOSE_RANGE..MAX_RANGE) to delay (30ms..400ms)
    int beepDelay = map(distance, CLOSE_RANGE, MAX_RANGE, 30, 400);

    tone(buzzerPin, 2000);
    delay(50);          // short beep duration
    noTone(buzzerPin);
    delay(beepDelay);   // gap between beeps, scaled by distance
  }

  Serial.println(distance);
}