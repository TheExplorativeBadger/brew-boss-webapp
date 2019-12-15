//---------------------------------------------------------------------------------------------------------------
// Global Variables
//---------------------------------------------------------------------------------------------------------------
const String VersionNumber = "3.00";

const char* $_Default_Steps = "default";
const char* $_Temp_Units = "F";
int $_Heater_Watts = 1100;
float $_CPKWH = 0.15;
int $_MaximumHeaterPower = 100;
const char* $_BGD_Color = "#000000";
const char* $_BP_Color = "#48B7BC";
const char* $_BS_Color = "#1A9858";
const char* $_TP_Color = "#A485FF";
const char* $_TS_Color = "#6A6F7C";
const char* $_TT_Color = "#D0807A";
const char* $_GAP_Color = "#61A8A9";
const char* $_GAS_Color = "#805080";
const char* $_GTP_Color = "#9CAFFF";
const char* $_GTS_Color = "#A2FF9E";
const char* $_GTT_Color = "#FDFFFE";
float $_Speak_Rate = 1.0;
float $_Speak_Pitch = 1.0;
const char* $_Speak_Voice = "Alex";
const char* $_Update_Interval = "2";
boolean $_Send_Data = false;
const char* $_User_Email = "";
boolean $_Enable_AccuFill = false;
float $_AFIFV = 16.0;
boolean $_Enable_HBC = false;
float $_HBMSCC = 1.5;

unsigned long WEB_APP_MASTER_CLIENT_IDENTITY = 0;
int Non_Master_Ping_Counter = 0;

String HeartbeatReceiveTime;
unsigned long LastHeartbeatTime;

String LastLogReceivedDate = "0";

// Files related to the web app
// ----------------------------
const char* WEB_APP_USER_CONFIG_FILE = "/userwebconfig.json";
const char* WEB_APP_DEFAULT_CONFIG_FILE = "/defaultwebconfig.json";
const char* WEB_APP_SNAPSHOT_FILE = "/brewsessionsnapshot.json";
const char* WEB_APP_CUSTOMJS_FILE = "/custom_js.js";
const char* WEB_APP_INDEX_FILE = "/index.html";
const char* WEB_APP_CUSTOMCSS_FILE = "/custom_css.css";



//---------------------------------------------------------------------------------------------------------------
// Changes to the Setup Routine
//---------------------------------------------------------------------------------------------------------------

void setup() {
  
if (!readConfigFile()) 
  {
    DEBUG_PRINTLN("Failed to read configuration file, using default values");
    //Serial.println("Failed to open config file for writing");
    UseCelsius=false;
    SecurityValue=0;
    SecurityCheckPassed = false;
    PwrS = 75;  //Slow Down Power within DeltaT1 of Setpoint
    PwrL = 50;  //Slow Down LOW Power within DeltaT2 of Setpoint
    PwrM = 25;   //Maintain Temp Power
    PwrB = 63;    //Boil Power
    DeltaT1 = 6;  // DeltaT1 is the number of degrees F below setpoint where we switch to PwrS so we don't overshoot.
    DeltaT2 = 3;  // DeltaT2 is the number of degrees F over setpoint where we use 0% PID
    TempCorrectionFactor=0;
    StrikeTempDelta=2;   //number of degrees above Mash1Temp to heat kettle to before adding grain
    Mash1Temp=152;
    Mash1Time=45;
    Mash2Temp=168;
    Mash2Time=15;
    TotalBoilTime=60;    //this is the total boil time including the aroma hops time.
    AromaHopsTime=10;    //this is the time before the end of the boilr (totalboiltime) that the program pauses to add aroma hops
    BoilDetectTime=9;    //this is the number of minutes/6 (10 second increments) that the temp does not change that we consider boiling commenced (defualt =6/4 = 1.5 minutes)

    
    $_Default_Steps = "default";
    $_Temp_Units = "F";
    $_Heater_Watts = 1100;
    $_CPKWH = 0.15;
    $_MaximumHeaterPower = 100;
    $_BGD_Color = "#000000";
    $_BP_Color = "#48B7BC";
    $_BS_Color = "#1A9858";
    $_TP_Color = "#A485FF";
    $_TS_Color = "#6A6F7C";
    $_TT_Color = "#D0807A";
    $_GAP_Color = "#61A8A9";
    $_GAS_Color = "#805080";
    $_GTP_Color = "#9CAFFF";
    $_GTS_Color = "#A2FF9E";
    $_GTT_Color = "#FDFFFE";
    $_Speak_Rate = 1.0;
    $_Speak_Pitch = 1.0;
    $_Speak_Voice = "Alex";
    $_Update_Interval = "2";
    $_Send_Data = false;
    $_User_Email = " ";
    $_Enable_AccuFill = false;
    $_AFIFV = 16;
    $_Enable_HBC = false;
    $_HBMSCC = 1.5;

    bool result = writeConfigFile();
    DEBUG_PRINTLN("Write Config FileResult: " + result);
  } else 
  {
    DEBUG_PRINT("PwrS:");
    DEBUG_PRINTLN(PwrS);
    DEBUG_PRINT("PwrL:");
    DEBUG_PRINTLN(PwrL);
    DEBUG_PRINT("PwrM:");
    DEBUG_PRINTLN(PwrM);
    DEBUG_PRINT("DeltaT1:");
    DEBUG_PRINTLN(DeltaT1);
    DEBUG_PRINT("DeltaT2:");
    DEBUG_PRINTLN(DeltaT2);
    DEBUG_PRINT("UseCelsius:");
    DEBUG_PRINTLN(UseCelsius);
    DEBUG_PRINT("SecurityValue:");
    DEBUG_PRINTLN(SecurityValue);
    DEBUG_PRINT("TempCorrectionFactor:");
    DEBUG_PRINTLN(TempCorrectionFactor);
    DEBUG_PRINT("StrikeTempDelta:");
    DEBUG_PRINTLN(StrikeTempDelta);
    DEBUG_PRINT("Mash1Temp:");
    DEBUG_PRINTLN(Mash1Temp);
    DEBUG_PRINT("Mash1Time:");
    DEBUG_PRINTLN(Mash1Time);
    DEBUG_PRINT("Mash2Temp:");
    DEBUG_PRINTLN(Mash2Temp);
    DEBUG_PRINT("Mash2Time:");
    DEBUG_PRINTLN(Mash2Time);
    DEBUG_PRINT("TotalBoilTime:");
    DEBUG_PRINTLN(TotalBoilTime);
    DEBUG_PRINT("AromaHopsTime:");
    DEBUG_PRINTLN(AromaHopsTime);
    DEBUG_PRINT("BoilDetectTime:");
    DEBUG_PRINTLN(BoilDetectTime);
  }


  
  
  // -------- HTTP Server Initiation / Endpoint Routing -------------------------------


  // ---- Serve all of the necessary .html, .js, and .css files to the browser ----
  
  //httpserver.serveStatic("/", SPIFFS, "/");
  //httpserver.serveStatic("js/jquery.csv.js", SPIFFS, "/js/jquery.csv.js"); // Not sure if we need this file or not
    
  // -- Serve the JavaScript library dependencies --
  httpserver.serveStatic("jquery-3.3.1.min.js", SPIFFS, "/jquery-3.3.1.min.js");
  httpserver.serveStatic("bootstrap.min.js", SPIFFS, "/bootstrap.min.js");
  //httpserver.serveStatic("jquery.canvasjs.min.js", SPIFFS, "/jquery.canvasjs.min.js");
  httpserver.serveStatic("chart.min.js", SPIFFS, "/chart.min.js");
  httpserver.serveStatic("gauge.min.js", SPIFFS, "/gauge.min.js");
  httpserver.serveStatic("jquery-ui.min.js", SPIFFS, "/jquery-ui.min.js");
  httpserver.serveStatic("custom_js.js", SPIFFS, "/custom_js.js");
  
  // -- Serve the CSS library dependencies --
  httpserver.serveStatic("bootstrap.min.css", SPIFFS, "/bootstrap.css");
  httpserver.serveStatic("open-iconic.min.css", SPIFFS, "/open-iconic.css");
  httpserver.serveStatic("jquery-ui.min.css", SPIFFS, "/jquery-ui.css");
  httpserver.serveStatic("custom_css.css", SPIFFS, "/custom_css.css");
  
  // -- Serve the HTML Webpage and its required content --
  httpserver.serveStatic("BBLogo.jpg", SPIFFS, "/BBLogo.jpg");
  httpserver.serveStatic("BBPLogo.jpg", SPIFFS, "/BBPLogo.jpg");
  httpserver.serveStatic("alarm.mp3", SPIFFS, "/alarm.mp3");
  httpserver.serveStatic("silence.mp3", SPIFFS, "/silence.mp3");
  httpserver.serveStatic("/", SPIFFS, "/index.html"); // Serve the page last
  
  // ---- Define the web server endpoints ----
  
  httpserver.on("/", handleRoot);

  httpserver.on("/restoredefaultsettings", handleRestoreDefaultSettings);
  httpserver.on("/savesettings", handleSaveSettings);
  httpserver.on("/getsettings", handleGetSettings);
  httpserver.on("/savebrewstepsfile", handleSaveBrewStepsFile);
  httpserver.on("/getbrewstepsfile", handleGetBrewStepsFile);
  httpserver.on("/deletebrewstepsfile", handleDeleteBrewStepsFile);
  httpserver.on("/getbrewstepsfilelist", handleGetBrewStepsFileList);
  httpserver.on("/getheartbeat", handleGetHeartbeat);
  httpserver.on("/setpumpstatus", handleSetPumpStatus);
  httpserver.on("/checkforsnapshotfile", handleCheckForSnapshotFile);
  httpserver.on("/savesnapshotfile", handleSaveSnapshotFile);
  httpserver.on("/getsnapshotfile", handleGetSnapshotFile);
  httpserver.on("/deletesnapshotfile", handleDeleteSnapshotFile);
  httpserver.on("/soundalarm", handleSoundAlarm);
  httpserver.on("/initialsessionlog", handleInitialSessionLog);
  httpserver.on("/postsessionlog", handlePostSessionLog);
  httpserver.on("/setheaterpowerlevel", handleSetHeaterPowerLevel);
  httpserver.on("/movehopsfeederposition", handleMoveHopsFeederPosition);
  httpserver.on("/fillvolumeaccufill", handleFillVolumeAccuFill);
  httpserver.on("/resetidentity", handleResetIdentity);

  httpserver.onNotFound(handleNotFound); //Set server all paths are not found so we can handle as per URI
  httpserver.begin(82);

}


//---------------------------------------------------------------------------------------------------------------
// Changes to existing routines
//---------------------------------------------------------------------------------------------------------------

/*
bool readConfigFile() {
  // this opens the config file in read-mode
  File f = SPIFFS.open(CONFIG_FILE, "r");

  if (!f) {
    DEBUG_PRINTLN("Configuration file not found");
    return false;
  }

  else {
    // we could open the file
    size_t size = f.size();
    // Allocate a buffer to store contents of the file.
    std::unique_ptr<char[]> buf(new char[size]);

    // Read and store file contents in buf
    f.readBytes(buf.get(), size);
    // Closing file
    f.close();
    // Using dynamic JSON buffer which is not the recommended memory model, but anyway
    // See https://github.com/bblanchon/ArduinoJson/wiki/Memory%20model
    DynamicJsonBuffer jsonBuffer;
    // Parse JSON string
    JsonObject& json = jsonBuffer.parseObject(buf.get());
    // Test if parsing succeeds.
    if (!json.success()) {
      DEBUG_PRINTLN("JSON parseObject() failed");
      return false;
    }

#ifdef DEBUG
    json.printTo(Serial);
#endif

    // Parse all config file parameters, override
    // local config variables with parsed values
    if (json.containsKey("PwrS")) {
      PwrS = json["PwrS"];
    }

    if (json.containsKey("PwrL")) {
      PwrL = json["PwrL"];
    }

    if (json.containsKey("PwrM")) {
      PwrM = json["PwrM"];
    }

    if (json.containsKey("PwrB")) {
      PwrB = json["PwrB"];
    }

    if (json.containsKey("DeltaT1")) {
      DeltaT1 = json["DeltaT1"];
    }

    if (json.containsKey("DeltaT2")) {
      DeltaT2 = json["DeltaT2"];
    }

    if (json.containsKey("UseCelsius")) {
      UseCelsius = json["UseCelsius"];
    }

    if (json.containsKey("SecurityValue")) {
      SecurityValue = json["SecurityValue"];
    }

    if (json.containsKey("TempCorrectionFactor")) {
      TempCorrectionFactor = json["TempCorrectionFactor"];
    }

    if (json.containsKey("ProVersion")) {
      ProVersion = json["ProVersion"];
    }

    if (json.containsKey("StrikeTempDelta")) {
      StrikeTempDelta = json["StrikeTempDelta"];
    }

    if (json.containsKey("Mash1Temp")) {
      Mash1Temp = json["Mash1Temp"];
    }

    if (json.containsKey("Mash1Time")) {
      Mash1Time = json["Mash1Time"];
    }

    if (json.containsKey("Mash2Temp")) {
      Mash2Temp = json["Mash2Temp"];
    }

    if (json.containsKey("Mash2Time")) {
      Mash2Time = json["Mash2Time"];
    }

    if (json.containsKey("TotalBoilTime")) {
      TotalBoilTime = json["TotalBoilTime"];
    }

    if (json.containsKey("AromaHopsTime")) {
      AromaHopsTime = json["AromaHopsTime"];
    }

    if (json.containsKey("BoilDetectTime")) {
      BoilDetectTime = json["BoilDetectTime"];
    }

  }
  DEBUG_PRINTLN("\nConfig file was successfully parsed");
  return true;
}
*/

bool readConfigFile() {
  // this opens the config file in read-mode
  File f = SPIFFS.open(WEB_APP_USER_CONFIG_FILE, "r");

  if (!f) {
    DEBUG_PRINTLN("Configuration file not found");
    return false;
  }

  else {
    // we could open the file
    size_t size = f.size();
    // Allocate a buffer to store contents of the file.
    std::unique_ptr<char[]> buf(new char[size]);

    // Read and store file contents in buf
    f.readBytes(buf.get(), size);
    // Closing file
    f.close();
    // Using dynamic JSON buffer which is not the recommended memory model, but anyway
    // See https://github.com/bblanchon/ArduinoJson/wiki/Memory%20model
    DynamicJsonBuffer jsonBuffer;
    // Parse JSON string
    JsonObject& json = jsonBuffer.parseObject(buf.get());
    // Test if parsing succeeds.
    if (!json.success()) {
      DEBUG_PRINTLN("JSON parseObject() failed");
      return false;
    }

#ifdef DEBUG
    json.printTo(Serial);
#endif

    // Parse all config file parameters, override
    // local config variables with parsed values
    if (json.containsKey("PwrS")) {
      PwrS = json["PwrS"];
    }

    if (json.containsKey("PwrL")) {
      PwrL = json["PwrL"];
    }

    if (json.containsKey("PwrM")) {
      PwrM = json["PwrM"];
    }

    if (json.containsKey("PwrB")) {
      PwrB = json["PwrB"];
    }

    if (json.containsKey("DeltaT1")) {
      DeltaT1 = json["DeltaT1"];
    }

    if (json.containsKey("DeltaT2")) {
      DeltaT2 = json["DeltaT2"];
    }

    if (json.containsKey("UseCelsius")) {
      UseCelsius = json["UseCelsius"];
    }

    if (json.containsKey("SecurityValue")) {
      SecurityValue = json["SecurityValue"];
    }

    if (json.containsKey("TempCorrectionFactor")) {
      TempCorrectionFactor = json["TempCorrectionFactor"];
    }

    if (json.containsKey("ProVersion")) {
      ProVersion = json["ProVersion"];
    }

    if (json.containsKey("StrikeTempDelta")) {
      StrikeTempDelta = json["StrikeTempDelta"];
    }

    if (json.containsKey("Mash1Temp")) {
      Mash1Temp = json["Mash1Temp"];
    }

    if (json.containsKey("Mash1Time")) {
      Mash1Time = json["Mash1Time"];
    }

    if (json.containsKey("Mash2Temp")) {
      Mash2Temp = json["Mash2Temp"];
    }

    if (json.containsKey("Mash2Time")) {
      Mash2Time = json["Mash2Time"];
    }

    if (json.containsKey("TotalBoilTime")) {
      TotalBoilTime = json["TotalBoilTime"];
    }

    if (json.containsKey("AromaHopsTime")) {
      AromaHopsTime = json["AromaHopsTime"];
    }

    if (json.containsKey("BoilDetectTime")) {
      BoilDetectTime = json["BoilDetectTime"];
    }

    if (json.containsKey("Default_Steps")) {
      $_Default_Steps = json["Default_Steps"];
    }
    
    if (json.containsKey("Temp_Units")) {
      $_Temp_Units = json["Temp_Units"];
    }
    
    if (json.containsKey("Heater_Watts")) {
      $_Heater_Watts = json["Heater_Watts"];
    }

    if (json.containsKey("CPKWH")) {
      $_CPKWH = json["CPKWH"];
    }

    if (json.containsKey("MaximumHeaterPower")) {
      $_MaximumHeaterPower = json["MaximumHeaterPower"];
    }

    if (json.containsKey("BGD_Color")) {
      $_BGD_Color = json["BGD_Color"];
    }

    if (json.containsKey("BP_Color")) {
      $_BP_Color = json["BP_Color"];
    }

    if (json.containsKey("BS_Color")) {
      $_BS_Color = json["BS_Color"];
    }

    if (json.containsKey("TP_Color")) {
      $_TP_Color = json["TP_Color"];
    }

    if (json.containsKey("TS_Color")) {
      $_TS_Color = json["TS_Color"];
    }

    if (json.containsKey("TT_Color")) {
      $_TT_Color = json["TT_Color"];
    }

    if (json.containsKey("GAP_Color")) {
      $_GAP_Color = json["GAP_Color"];
    }

    if (json.containsKey("GAS_Color")) {
      $_GAS_Color = json["GAS_Color"];
    }

    if (json.containsKey("GTP_Color")) {
      $_GTP_Color = json["GTP_Color"];
    }

    if (json.containsKey("GTS_Color")) {
      $_GTS_Color = json["GTS_Color"];
    }

    if (json.containsKey("GTT_Color")) {
      $_GTT_Color = json["GTT_Color"];
    }

    if (json.containsKey("Speak_Rate")) {
      $_Speak_Rate = json["Speak_Rate"];
    }

    if (json.containsKey("Speak_Pitch")) {
      $_Speak_Pitch = json["Speak_Pitch"];
    }

    if (json.containsKey("Speak_Voice")) {
      $_Speak_Voice = json["Speak_Voice"];
    }

    if (json.containsKey("Update_Interval")) {
      $_Update_Interval = json["Update_Interval"];
    }

    if (json.containsKey("Send_Data")) {
      $_Send_Data = json["Send_Data"];
    }

    if (json.containsKey("User_Email")) {
      $_User_Email = json["User_Email"];
    }

    if (json.containsKey("Enable_AccuFill")) {
      $_Enable_AccuFill = json["Enable_AccuFill"];
    }
    
    if (json.containsKey("AFIFV")) {
      $_AFIFV = json["AFIFV"];
    }
    
    if (json.containsKey("Enable_HBC")) {
      $_Enable_HBC = json["Enable_HBC"];
    }
    if (json.containsKey("HBMSCC")) {
      $_HBMSCC = json["HBMSCC"];
    }

  }
  DEBUG_PRINTLN("\nConfig file was successfully parsed");
  return true;
}

/*
bool writeConfigFile() {
  DEBUG_PRINTLN("Saving config file");
  DynamicJsonBuffer jsonBuffer;
  JsonObject& json = jsonBuffer.createObject();

  // JSONify local configuration parameters
  json["PwrS"] = PwrS;
  json["PwrL"] = PwrL;
  json["PwrM"] = PwrM;
  json["PwrB"] = PwrB;
  json["DeltaT1"] = DeltaT1;
  json["DeltaT2"] = DeltaT2;
  json["UseCelsius"] = UseCelsius;
  json["SecurityValue"] = SecurityValue;
  json["TempCorrectionFactor"] = TempCorrectionFactor;
  json["ProVersion"] = ProVersion;
  json["StrikeTempDelta"] = StrikeTempDelta;
  json["Mash1Temp"] = Mash1Temp;
  json["Mash1Time"] = Mash1Time;
  json["Mash2Temp"] = Mash2Temp;
  json["Mash2Time"] = Mash2Time;
  json["TotalBoilTime"] = TotalBoilTime;
  json["AromaHopsTime"] = AromaHopsTime;
  json["BoilDetectTime"] = BoilDetectTime;

  // Open file for writing
  File f = SPIFFS.open(CONFIG_FILE, "w");
  if (!f) {
    DEBUG_PRINTLN("Failed to open config file for writing");
    //Serial.println("Failed to open config file for writing");
    return false;
  }
#ifdef DEBUG
  json.prettyPrintTo(Serial);
#endif
  // Write data to file and close it
  json.printTo(f);
  f.close();

  DEBUG_PRINTLN("\nConfig file was successfully saved");
  return true;
}
*/

bool writeConfigFile() {
  DEBUG_PRINTLN("Saving config file");
  DynamicJsonBuffer jsonBuffer;
  JsonObject& json = jsonBuffer.createObject();

  json["Default_Steps"] = $_Default_Steps;
  json["Temp_Units"] = $_Temp_Units;
  json["Heater_Watts"] = $_Heater_Watts;
  json["CPKWH"] = $_CPKWH;
  json["MaximumHeaterPower"] = $_MaximumHeaterPower;
  json["BGD_Color"] = $_BGD_Color;
  json["BP_Color"] = $_BP_Color;
  json["BS_Color"] = $_BS_Color;
  json["TP_Color"] = $_TP_Color;
  json["TS_Color"] = $_TS_Color;
  json["TT_Color"] = $_TT_Color;
  json["GAP_Color"] = $_GAP_Color;
  json["GAS_Color"] = $_GAS_Color;
  json["GTP_Color"] = $_GTP_Color;
  json["GTS_Color"] = $_GTS_Color;
  json["GTT_Color"] = $_GTT_Color;
  json["Speak_Rate"] = $_Speak_Rate;
  json["Speak_Pitch"] = $_Speak_Pitch;
  json["Speak_Voice"] = $_Speak_Voice;
  json["Update_Interval"] = $_Update_Interval;
  json["Send_Data"] = $_Send_Data;
  json["User_Email"] = $_User_Email;
  json["Enable_AccuFill"] = $_Enable_AccuFill;
  json["AFIFV"] = $_AFIFV;
  json["Enable_HBC"] = $_Enable_HBC;
  json["HBMSCC"] = $_HBMSCC;

  json["BoilDetectTime"] = BoilDetectTime;
  json["PwrS"] = PwrS;
  json["PwrL"] = PwrL;
  json["PwrM"] = PwrM;
  json["PwrB"] = PwrB;
  json["DeltaT1"] = DeltaT1;
  json["DeltaT2"] = DeltaT2;
  json["UseCelsius"] = UseCelsius;
  
  json["SecurityValue"] = SecurityValue;
  json["TempCorrectionFactor"] = TempCorrectionFactor;
  json["ProVersion"] = ProVersion;
  json["StrikeTempDelta"] = StrikeTempDelta;
  json["Mash1Temp"] = Mash1Temp;
  json["Mash1Time"] = Mash1Time;
  json["Mash2Temp"] = Mash2Temp;
  json["Mash2Time"] = Mash2Time;
  json["TotalBoilTime"] = TotalBoilTime;
  json["AromaHopsTime"] = AromaHopsTime;

  // Open file for writing
  File f = SPIFFS.open(WEB_APP_USER_CONFIG_FILE, "w");
  if (!f) {
    DEBUG_PRINTLN("Failed to open config file for writing");
    //Serial.println("Failed to open config file for writing");
    return false;
  }
#ifdef DEBUG
  json.prettyPrintTo(Serial);
#endif
  // Write data to file and close it
  json.printTo(f);
  f.close();

  DEBUG_PRINTLN("\nConfig file was successfully saved");
  return true;
}


//---------------------------------------------------------------------------------------------------------------
// Additional Routines
//---------------------------------------------------------------------------------------------------------------

//Web Server Routines Start Here
//this taken from page https://diyprojects.io/bootstrap-create-beautiful-web-interface-projects-esp8266/#.WvRa-ogvxPb
//use the link to determine how to send status updates to web site...i.e. temp, current step, etc.
//use bootstrap to a CDN (content delivery network)

// Handler for the default / endpoint
void handleRoot() {
  httpserver.sendHeader("Location", "/index.html",true);   //Redirect to our html web page
  httpserver.send(302, "text/plain","");
}  //end of handle root sub

// Handler for the /restoredefaultsettings endpoint
void handleRestoreDefaultSettings() {
  
  File configFile = SPIFFS.open(WEB_APP_DEFAULT_CONFIG_FILE, "r");

  // Check to make sure the file was opened properly
  if (configFile) {
    DynamicJsonBuffer jsonBuffer;

    // Parse the file into a JsonObject
    JsonObject& configFileJson = jsonBuffer.parseObject(configFile);
  
    // Close the file after we are done parsing it
    configFile.close();

    // If we were unsuccessful in parsing, syntax was wrong
    if (configFileJson.success()) {
      // Create a string representation of the JsonObject to send back to client
      String responseJson;
      configFileJson.printTo(responseJson);
      httpserver.send(200, "application/json", responseJson);
      
    } else {
      DEBUG_PRINTLN("Error retrieving contents of config file while reading");
    }
  } else {
    DEBUG_PRINTLN("Error opening user's configuration file for reading");
    configFile.close();
  }
}

// Handler for the /savesettings endpoint
void handleSaveSettings() {
  DEBUG_PRINTLN("Saving config file");
  DynamicJsonBuffer jsonBuffer1;
  JsonObject& requestJson = jsonBuffer1.parseObject(httpserver.arg("plain"));
  String responseString = "";

  if (requestJson.success()) {
    
    $_Default_Steps = requestJson["Default_Steps"];
    $_Temp_Units = requestJson["Temp_Units"];
    $_Heater_Watts = requestJson["Heater_Watts"];
    $_CPKWH = requestJson["CPKWH"];
    $_MaximumHeaterPower = requestJson["MaximumHeaterPower"];

    $_Enable_AccuFill = requestJson["Enable_AccuFill"];
    $_AFIFV = requestJson["AFIFV"];
    $_Enable_HBC = requestJson["Enable_HBC"];
    $_HBMSCC = requestJson["HBMSCC"];

    $_BGD_Color = requestJson["BGD_Color"];
    $_BP_Color = requestJson["BP_Color"];
    $_BS_Color = requestJson["BS_Color"];
    $_TP_Color = requestJson["TP_Color"];
    $_TS_Color = requestJson["TS_Color"];
    $_TT_Color = requestJson["TT_Color"];
    $_GAP_Color = requestJson["GAP_Color"];
    $_GAS_Color = requestJson["GAS_Color"];
    $_GTP_Color = requestJson["GTP_Color"];
    $_GTS_Color = requestJson["GTS_Color"];
    $_GTT_Color = requestJson["GTT_Color"];
    $_Speak_Rate = requestJson["Speak_Rate"];
    $_Speak_Pitch = requestJson["Speak_Pitch"];
    $_Speak_Voice = requestJson["Speak_Voice"];
    $_Update_Interval = requestJson["Update_Interval"];
    $_Send_Data = requestJson["Send_Data"];
    $_User_Email = requestJson["User_Email"];

    BoilDetectTime = requestJson["BoilDetectTime"];
    PwrS = requestJson["PwrS"];
    PwrL = requestJson["PwrL"];
    PwrM = requestJson["PwrM"];
    PwrB = requestJson["PwrB"];
    DeltaT1 = requestJson["DeltaT1"];
    DeltaT2 = requestJson["DeltaT2"];

    String Temp_Units = requestJson["Temp_Units"];

    if (Temp_Units == "F") {
      UseCelsius = false;
    } else if (Temp_Units == "C") {
      UseCelsius = true;
    }

    bool configWriteResult = writeConfigFile();

    /*  
    DynamicJsonBuffer jsonBuffer;
    JsonObject& json = jsonBuffer.createObject();

    json["Default_Steps"] = Default_Steps;
    json["Temp_Units"] = Temp_Units;
    json["Heater_Watts"] = Heater_Watts;
    json["CPKWH"] = CPKWH;
    json["MaximumHeaterPower"] = MaximumHeaterPower;
    json["BoilDetectTime"] = BoilDetectTime;
    json["PwrS"] = $_PwrS;
    json["PwrL"] = $_PwrL;
    json["PwrM"] = $_PwrM;
    json["PwrB"] = $_PwrB;
    json["DeltaT1"] = $_DeltaT1;
    json["DeltaT2"] = $_DeltaT2;
    json["BGD_Color"] = BGD_Color;
    json["BP_Color"] = BP_Color;
    json["BS_Color"] = BS_Color;
    json["TP_Color"] = TP_Color;
    json["TS_Color"] = TS_Color;
    json["TT_Color"] = TT_Color;
    json["GAP_Color"] = GAP_Color;
    json["GAS_Color"] = GAS_Color;
    json["GTP_Color"] = GTP_Color;
    json["GTS_Color"] = GTS_Color;
    json["GTT_Color"] = GTT_Color;
    json["Speak_Rate"] = Speak_Rate;
    json["Speak_Pitch"] = Speak_Pitch;
    json["Speak_Voice"] = Speak_Voice;
    json["Default_Variable"] = Default_Variable;
    json["Update_Interval"] = Update_Interval;
    json["Send_Data"] = Send_Data;
    json["User_Email"] = User_Email;
    

    File userConfigFile = SPIFFS.open(WEB_APP_USER_CONFIG_FILE, "w");
    if (userConfigFile) {
      
      json.printTo(userConfigFile);
      userConfigFile.close();
      
      String responseJson = "{}";
      httpserver.send(200, "application/json", responseJson);
      
    }
    */

    if (configWriteResult) {
      responseString = "Settings Saved Successfully";
    } else {
      responseString = "Error Writing Config File in SPIFFS, Settings not Saved!";
    }
  } else {
    DEBUG_PRINTLN("Error retrieving body of SaveSettings request");
    responseString = "Error retrieving body of SaveSettings request";
  }

  String responseJson = "{";
  responseJson += "\"ResponseMessage\":\"" + responseString + "\"";
  responseJson += "}";
  httpserver.send(200, "application/json", responseJson);
}

// Handler for the /getsettings endpoint
void handleGetSettings() {

  File configFile = SPIFFS.open(WEB_APP_USER_CONFIG_FILE, "r");

  // Check to make sure the file was opened properly
  if (configFile) {
    DynamicJsonBuffer jsonBuffer;

    // Parse the file into a JsonObject
    JsonObject& configFileJson = jsonBuffer.parseObject(configFile);
  
    // Close the file after we are done parsing it
    configFile.close();

    // If we were unsuccessful in parsing, syntax was wrong
    if (configFileJson.success()) {
      // Create a string representation of the JsonObject to send back to client
      String responseJson;
      configFileJson.printTo(responseJson);
      httpserver.send(200, "application/json", responseJson);
      
    } else {
      DEBUG_PRINTLN("Error retrieving contents of config file while reading");
    }
  } else {
    DEBUG_PRINTLN("Error opening user's configuration file for reading");
    configFile.close();
  }
}



// Handler for the /savebrewstepsfile endpoint
void handleSaveBrewStepsFile() {

  // Declare a JSONBuffer to parse the incoming data
  DynamicJsonBuffer jsonBuffer;

  // Use the buffer to parse the data (store in httpserver.arg("plain")) into a JsonObject
  JsonObject& requestJson = jsonBuffer.parseObject(httpserver.arg("plain"));

  // Make sure the jsonObject was successfully created
  if (!requestJson.success()) {
    DEBUG_PRINTLN("Error retrieving body of SaveBrewStepsFile request");
    // TODO: Handle this error
  }

  String saveType = requestJson["SaveType"];
  String fileName = requestJson["FileName"];
  String responseString;
  String filePath = "/steps_" + fileName + ".json";
  
  if (saveType == "Save") {
    File stepsFile = SPIFFS.open(filePath, "w");

    if (stepsFile) {
      requestJson.printTo(stepsFile);
      stepsFile.close();
      responseString = "Step file successfully saved";
    } else {
      DEBUG_PRINTLN("Error opening " + filePath);
      // TODO: Handle error here

      stepsFile.close();
      responseString = "Error saving step file";
    }
    
  } else if (saveType == "SaveAs") {
    if (SPIFFS.exists(filePath)) { // file exists, update name to include a counter
      int counter = 1;
      boolean foundOne = false;
      
      while (foundOne == false) {
        filePath = "/steps_" + fileName + counter + ".json";
   
        if (!(SPIFFS.exists(filePath))) { // File does not exist, save it
          File stepsFile = SPIFFS.open(filePath, "w");

          if (stepsFile) {
            requestJson.printTo(stepsFile);
            stepsFile.close();
            responseString = "Step file successfully created";
          } else {
            DEBUG_PRINTLN("Error opening " + filePath);
            // TODO: Handle error here

            stepsFile.close();
            responseString = "Error creating step file";
          }
          
          foundOne = true;
        } else { // File exists also, increase counter
          counter += 1;
        }
      }
    } else { // File does not exist, save it
      File stepsFile = SPIFFS.open(filePath, "w");

      if (stepsFile) {
         requestJson.printTo(stepsFile);
         stepsFile.close();
         responseString = "Step file successfully created";
       } else {
         DEBUG_PRINTLN("Error opening " + filePath);
         // TODO: Handle error here

         stepsFile.close();
         responseString = "Error creating step file";
       }
     }
    
  } else { // Save type is not Save or SaveAs, unrecognized command
    DEBUG_PRINTLN("Unrecognized save type");
    responseString = "Unrecognized save type";
  }

  
  String responseJson = "{";
  responseJson += "\"ResponseMessage\":\"" + responseString + "\"";
  responseJson += "}";
  httpserver.send(200, "application/json", responseJson);
}

// Handler for the /getbrewstepsfile endpoint
void handleGetBrewStepsFile() {

  // Declare a JSONBuffer to parse the incoming data
  StaticJsonBuffer<100> jsonBuffer1;

  // Use the buffer to parse the data (store in httpserver.arg("plain")) into a JsonObject
  JsonObject& requestJson = jsonBuffer1.parseObject(httpserver.arg("plain"));

  // Make sure the jsonObject was successfully created
  if (requestJson.success()) {
    String fileName = requestJson["FileName"];

    
    String filePath = "/steps_" + fileName + ".json";

    File stepsFile = SPIFFS.open(filePath, "r");

    if (stepsFile) {
      DynamicJsonBuffer jsonBuffer2;
      JsonObject& stepsFileJson = jsonBuffer2.parseObject(stepsFile);

      stepsFile.close();

      if (stepsFileJson.success()) {
        String responseJson;
        stepsFileJson.printTo(responseJson);
        httpserver.send(200, "application/json", responseJson);
        
      } else {
        DEBUG_PRINTLN("Error accessing the contents of the step file");
      }
    } else {
      DEBUG_PRINTLN("Error opening the requested step file");
      stepsFile.close();
    }
  } else {
    DEBUG_PRINTLN("Error retrieving body of GetBrewStepsFile request");
  }
}

// Handler for the /deletestepsfile endpoint
void handleDeleteBrewStepsFile() {

  String response = "";
  String response2 = "";

  // Declare a JSONBuffer to parse the incoming data
  StaticJsonBuffer<100> jsonBuffer;
  JsonObject& requestJson = jsonBuffer.parseObject(httpserver.arg("plain"));

  if (requestJson.success()) {
    // Craft the path of the steps file
    String fileName = requestJson["FileName"];
    String filePath = "/steps_" + fileName + ".json";
 
    // File exists, delete it
    if (SPIFFS.exists(filePath)) {
      SPIFFS.remove(filePath);
      response = fileName + " removed from Controller";
    } else {
      response = fileName + " not found in Controller to be removed";
    }
    
  } else {
    response = "Error retrieving body of DeleteStepsFile request";
  }

    String responseJson = "{";
    responseJson += "\"ResponseMessage\":\"" + response + "\"";
    responseJson += "}";
    httpserver.send(200, "application/json", responseJson);
}

// Handler for the /getbrewstepsfilelist endpoint
void handleGetBrewStepsFileList() {

  int fileCounter = 0;
  StaticJsonBuffer<400> jsonBuffer;

  JsonObject& jsonObject = jsonBuffer.createObject();

  JsonArray& files = jsonObject.createNestedArray("FileNames");

  Dir stepsDirectory = SPIFFS.openDir("/steps");
  while (stepsDirectory.next()) {

    String filePath = stepsDirectory.fileName();
    int fileLength = filePath.length();
    int endIndex = (fileLength - 5);
    String fileName = filePath.substring(7, endIndex);
    
    files.add(fileName);
    fileCounter += 1;
  }

  jsonObject["Count"] = fileCounter;
  
  String responseJson;
  jsonObject.printTo(responseJson);
  httpserver.send(200, "application/json", responseJson);
}

void handleResetIdentity() {
  // Declare a JSONBuffer to parse the incoming data
  StaticJsonBuffer<200> jsonBuffer1;
  JsonObject& requestJson = jsonBuffer1.parseObject(httpserver.arg("plain"));

  if (!requestJson.success()) { 
    DEBUG_PRINTLN("Error retrieving body of ResetIdentity request");
  } else {
    unsigned long Client_Identity = requestJson["Identity"];

    if (WEB_APP_MASTER_CLIENT_IDENTITY == Client_Identity) {
      WEB_APP_MASTER_CLIENT_IDENTITY = 0;
      Non_Master_Ping_Counter = 0;
    } else {
      
    }
  }

  String responseJson = "{}";
  httpserver.send(200, "application/json", responseJson);
}

// Handler for the /getheartbeat endpoint
void handleGetHeartbeat() {

  // Declare a JSONBuffer to parse the incoming data
  StaticJsonBuffer<200> jsonBuffer1;
  JsonObject& requestJson = jsonBuffer1.parseObject(httpserver.arg("plain"));

  if (!requestJson.success()) {
    DEBUG_PRINTLN("Error retrieving body of GetHeartbeat request");
    HeartbeatReceiveTime = millis();
  } else {
    unsigned long Client_Identity = requestJson["Identity"];
    if (WEB_APP_MASTER_CLIENT_IDENTITY == 0) { // First heartbeat of the session, or the previous master disconnected
      WEB_APP_MASTER_CLIENT_IDENTITY = Client_Identity;
    } else if (WEB_APP_MASTER_CLIENT_IDENTITY == Client_Identity) { // This is a ping from the current master, reset the exchange cou
      Non_Master_Ping_Counter = 0;
    } else { // There is a current master, but this ping came from a different client
      Non_Master_Ping_Counter += 1;
      if (Non_Master_Ping_Counter == 15) {
        WEB_APP_MASTER_CLIENT_IDENTITY = Client_Identity;
        Non_Master_Ping_Counter = 0;
      }
    }
  }

  LastHeartbeatTime = millis();
  String timeSent = requestJson["Time_Sent"];
  HeartbeatReceiveTime = timeSent;
  
  boolean PumpStatus = false;
  if (pcf8574.read(Pump1Pin) == LOW) {
    PumpStatus = true;
  }

  boolean FermentationMode = false;
  if (FermentationTemp != -273) {
    FermentationMode = true;
  }

  int HopsBoss_Position;
  if (HopsBossConnected == true) {
    HopsBoss_Position = HopsBossPosition;
  }


  StaticJsonBuffer<400> jsonBuffer2;
  JsonObject& jsonObject = jsonBuffer2.createObject();

  jsonObject["ProVersion"] = ProVersion;
  jsonObject["KettleTempF"] = KettleTempF;
  jsonObject["HeaterPower"] = HeaterPower;
  jsonObject["PumpStatus"] = PumpStatus;
  jsonObject["FermentationMode"] = FermentationMode;
  jsonObject["HopsBossConnected"] = HopsBossConnected;
  jsonObject["HopsBossPosition"] = HopsBoss_Position;
  jsonObject["AccuFillConnected"] = AccuFillConnected;
  jsonObject["AccuFillCalibrationValue"] = AccuFillCalibrationValue;
  jsonObject["AccuFillFilling"] = Filling;
  jsonObject["GallonsFilled"] = GallonsFilled;
  jsonObject["DesiredFillVolume"] = DesiredFillVolume;

  /*
  String responseJson = "{";
  responseJson += "\"ProVersion\":" +  ProVersion + ","; // boolean
  responseJson += "\"KettleTempF\":" + KettleTempF + ","; // int
  responseJson += "\"HeaterPower\":" + HeaterPower + ","; // int
  responseJson += "\"PumpStatus\":" + PumpStatus + ","; // boolean
  responseJson += "\"FermentationMode\":" + FermentationMode + ","; // boolean
  responseJson += "\"HopsBossConnected\":" + HopsBossConnected + ","; // boolean
  responseJson += "\"HopsBossPosition\":" + HopsBoss_Position + ","; // int
  responseJson += "\"AccuFillConnected\":" + AccuFillConnected + ","; // boolean
  responseJson += "\"AccuFillCalibrationValue\":" + AccuFillCalibrationValue + ","; // int
  responseJson += "\"AccuFillFilling\":" + Filling + ","; // boolean
  responseJson += "\"GallonsFilled\":" + GallonsFilled + ","; // int
  responseJson += "\"DesiredFillVolume\":" + DesiredFillVolume; // int
  responseJson += "}";
  */

  String responseJson;
  jsonObject.printTo(responseJson);

  DEBUG_PRINTLN(responseJson);
  httpserver.send(200, "application/json", responseJson);
}

// Handler for the /setpumpstatus endpoint
void handleSetPumpStatus() {

  // Declare a JSONBuffer to parse the incoming data
  StaticJsonBuffer<200> jsonBuffer;
  JsonObject& requestJson = jsonBuffer.parseObject(httpserver.arg("plain"));

  if (requestJson.success()) {
    int Pump_Status = requestJson["Pump_Status"];

    if (Pump_Status == 0) {
      Pump1Off();
    } else if (Pump_Status == 1) {
      Pump1On();
    }
  
    String responseJson = "{}";
    httpserver.send(200, "application/json", responseJson);
    
  } else {
    DEBUG_PRINTLN("Error retrieving body of SetPumpStatus request");
  }
}

// ---------------------- Checkpoint 1 Above ---------------

void handleCheckForSnapshotFile() {
  boolean snapshotExists = SPIFFS.exists(WEB_APP_SNAPSHOT_FILE);

  String responseJson = "{";
  responseJson += "\"Exists\":";
  responseJson += snapshotExists;
  responseJson += "}";
  httpserver.send(200, "application/json", responseJson);
  
}

void handleSaveSnapshotFile() {

  DynamicJsonBuffer jsonBuffer;
  String responseString = "";

  JsonObject& requestJson = jsonBuffer.parseObject(httpserver.arg("plain"));
  if (requestJson.success()) {

    File snapshotFile = SPIFFS.open(WEB_APP_SNAPSHOT_FILE, "w");
    if (snapshotFile) {
      requestJson.printTo(snapshotFile);
      snapshotFile.close();
      responseString = "Snapshot file saved successfully";
    } else {
      responseString = "Error opening the snapshot file in SPIFFS";
    }
  } else {
    responseString = "Error reading the snapshot file from request";
  }

  String responseJson = "{";
  responseJson += "\"ResponseMessage\":\"" + responseString + "\"";
  responseJson += "}";
  httpserver.send(200, "application/json", responseJson);
  
}

void handleGetSnapshotFile() {

  File snapshotFile = SPIFFS.open(WEB_APP_SNAPSHOT_FILE, "r");

  if (snapshotFile) {
    DynamicJsonBuffer jsonBuffer;

    JsonObject& snapshotFileJson = jsonBuffer.parseObject(snapshotFile);
    snapshotFile.close();

    if (snapshotFileJson.success()) {
      String responseJson;
      snapshotFileJson.printTo(responseJson);
      httpserver.send(200, "application/json", responseJson);
    } else {
      DEBUG_PRINTLN("Error retrieving contents of snapshot file while reading");
    }
  } else {
    DEBUG_PRINTLN("Error opening snapshot file from SPIFFS file for reading");
    snapshotFile.close();
  }
}

void handleDeleteSnapshotFile() {

String response = "";

  if (SPIFFS.exists(WEB_APP_SNAPSHOT_FILE)) {
    SPIFFS.remove(WEB_APP_SNAPSHOT_FILE);
    response = "Snapshot file deleted";
  } else {
    response = "Snapshot file not found in SPIFFS";
  }

  String responseJson = "{";
  responseJson += "\"ResponseMessage\":\"" + response + "\"";
  responseJson += "}";
  httpserver.send(200, "application/json", responseJson);
  
}

void handleSoundAlarm() {
  SoundAlarm();
  String responseJson = "{}";
  httpserver.send(200, "application/json", responseJson);
}

// ---------------------- Checkpoint 2 Above ---------------

// This function will set the Heater power after getting a command from the web app
void handleSetHeaterPowerLevel() {

  // Declare a JSONBuffer to parse the incoming data
  StaticJsonBuffer<100> jsonBuffer;
  JsonObject& requestJson = jsonBuffer.parseObject(httpserver.arg("plain"));

  if (requestJson.success()) {

    HeaterPower = requestJson["Power_Level"];
  
    String responseJson = "{}";
    httpserver.send(200, "application/json", responseJson);
  } else {
    DEBUG_PRINTLN("Error retrieving body of SetHeaterPowerLevel request");
  }
}

// This function will facilitate the passing of the web app command to the Hops Boss Controller
void handleMoveHopsFeederPosition() {

  // Declare a JSONBuffer to parse the incoming data
  StaticJsonBuffer<100> jsonBuffer;
  JsonObject& requestJson = jsonBuffer.parseObject(httpserver.arg("plain"));

  if (requestJson.success()) {
    int Position = requestJson["Position"];
    String sendAlongPacket = "05";
    sendAlongPacket += Position;

    boolean sent = PrintToHopsBoss(sendAlongPacket);
    String responseJson;

    if (sent) {
      responseJson = "{\"Response\": \"Success\",";
      responseJson +="\"Position\":";
      responseJson += Position;
      responseJson += "}";
    } else {
      DEBUG_PRINTLN("Error sending the information to Hops Boss Controller");
      responseJson = "{\"Response\": \"Failure\",";
      responseJson +="\"Position\":";
      responseJson += Position;
      responseJson += "}";
    }
    httpserver.send(200, "application/json", responseJson);
    
  } else {
    DEBUG_PRINTLN("Error retrieving body of MoveHopsFeederPosition request");
  }
}

/// This function will facilitate the passing of the web app command to the AccuFill device
void handleFillVolumeAccuFill() {

  // Declare a JSONBuffer to parse the incoming data
  StaticJsonBuffer<100> jsonBuffer;
  JsonObject& requestJson = jsonBuffer.parseObject(httpserver.arg("plain"));

  if (requestJson.success()) {
    int Volume = requestJson["Gallons"];
    String sendAlongPacket = "06";
    sendAlongPacket += Volume;

    boolean sent = PrintToAccuFill(sendAlongPacket);
    String responseJson;

    if (sent) {
      responseJson = "{\"Response\": \"Success\"}";
    } else {
      DEBUG_PRINTLN("Error sending the information to AccuFill Controller");
      responseJson = "{\"Response\": \"Failure\"}";
    }
    httpserver.send(200, "application/json", responseJson);
    
  } else {
    DEBUG_PRINTLN("Error retrieving body of FillVolumeAccuFill request");
  }
}

//// This function will handle incoming requests to log the initial state of clients that connect to their brew boss web apps
//void handleInitialSessionLog() {
//  DynamicJsonBuffer jsonBuffer;
//  JsonObject& requestJson = jsonBuffer.parseObject(httpserver.arg("plain"));
//  String deviceSsid = String(ESP.getChipId());
//  String logFileContent = "";
//
//  if (requestJson.success()) {
//
//    unsigned long requestIdentity = requestJson["Identity"];
//    if (WEB_APP_MASTER_CLIENT_IDENTITY == requestIdentity) {
//      
//      String Timestamp = requestJson["Timestamp"];
//      String logFileName = deviceSsid + "_" + Timestamp;
//
//      // Add logic to format a string to print to the ftp here
//      requestJson.printTo(logFileContent);
//
//      //TODO: Print the logFileContent string to ftp
//    } else {
//      DEBUG_PRINTLN("Secondary Device Failure");
//    }
//
//  } else {
//    DEBUG_PRINTLN("Error retrieving body of logging request");
//  }
//
//  String responseJson = "{\"Response\": \"" + logFileContent + "\"}";
//  httpserver.send(200, "application/json", responseJson);
//}

// This function will handle incoming requests to log the initial state of clients that connect to their brew boss web apps
void handleInitialSessionLog() {
  DynamicJsonBuffer jsonBuffer;
  JsonObject& requestJson = jsonBuffer.parseObject(httpserver.arg("plain"));
  String LogFileContent = "";
  String ResponseCode = "";

  if (requestJson.success()) {
    //unsigned long Client_Identity = requestJson["Identity"];

    if (WiFi.status() != WL_CONNECTED) { // Not connected to the internet, no way to get the log saved
       DEBUG_PRINTLN("Not connected to internet, cannot proceed with logging");
       ResponseCode = "404";
    } else { // Connected, proceed
      // Name = ChipId_05292019.log
      String deviceSsid = String(ESP.getChipId());
      String Timestamp = requestJson["Timestamp"];
      String LogFileName = deviceSsid + "_" + Timestamp + ".log";
      unsigned long Client_Identity = requestJson["Identity"];
      String WebAppVersion = requestJson["Version"];
      JsonObject& requestSettings = requestJson["Settings"];
      JsonObject& requestBrewSteps = requestJson["BrewSteps"];
      bool FileExists = false;
   
      //requestJson.printTo(LogFileContent);

      // Format the Initial Log Entry Content here
      LogFileContent = "=============== New Client Connected ===============\n";
      // Firmware Version #
      LogFileContent += "Firmware Version: ";
      LogFileContent += VersionNumber;
      LogFileContent += "\n";
      // App Version #
      LogFileContent += "WebApp Version: ";
      LogFileContent += WebAppVersion;
      LogFileContent += "\n";
      // Client_Identity
      LogFileContent += "WebApp Timestamp Identity: ";
      LogFileContent += Client_Identity;
      LogFileContent += "\n";
      // Settings
      LogFileContent += "WebApp Settings: ";
      requestSettings.prettyPrintTo(LogFileContent);
      LogFileContent += "\n";
      // Current Brew Step File
      LogFileContent += "WebApp Step File: ";
      requestBrewSteps.prettyPrintTo(LogFileContent);
      LogFileContent += "\n";

      // Add logic to print the formatted string to the ftp below, according to the given scenario
    
      if (LastLogReceivedDate == "0") {
        // No initial log has been sent for this session, this is the first, check for file presence
        // TODO: Need to check here if the file name already exists
        FileExists = false;
      
        if (FileExists == true) { // If Yes: Append to the ftp file, this means we are the 2+ client to connect for the day on a different session
        
        } else {  // If No: Create the file on ftp and print this log to it to begin the logging for day
        
        }
 
      } else {
        // There has been an initial log sent for this session already, check if new date
        if (Timestamp == LastLogReceivedDate) {
          // The date is the same as previous for the session, must be a new client trying to connect, append to existing file, identity will be different
        
        } else {
          // We are in a new date, in an existing session. This could be a new client connecting later, or same client connecting again for diff date
          // Create new file for the new date
        }
      }

      // Set the date received regardless of same or different, this will be used to check subsequent log files to determine the turn of a new date
      LastLogReceivedDate = Timestamp;
      ResponseCode = "200";
    }
  } else {
    DEBUG_PRINTLN("Error retrieving body of logging request");
    ResponseCode = "400";
  }

  String responseJson = "{\"Response\": \"" + LogFileContent + "\",";
  responseJson += "\"ResponseCode\": \"" + ResponseCode + "\",";
  responseJson += "}";
  httpserver.send(200, "application/json", responseJson);
}

//// This function will handle incoming requests to log events from the master client
//void handlePostSessionLog() {
//  DynamicJsonBuffer jsonBuffer;
//  JsonObject& requestJson = jsonBuffer.parseObject(httpserver.arg("plain"));
//  String deviceSsid = String(ESP.getChipId());
//  String logFileString = "";
//
//  if (requestJson.success()) {
//
//    unsigned long requestIdentity = requestJson["Identity"];
//    if (WEB_APP_MASTER_CLIENT_IDENTITY == requestIdentity) {
//
//      String Timestamp = requestJson["Timestamp"];
//      
//      String logFileName = deviceSsid + "_" + Timestamp;
//      String message = requestJson["LogString"];
//      logFileString += message;
//
//      // TODO: Handle the printing of the logFileString to ftp file here
//    
//    } else {
//      DEBUG_PRINTLN("Secondary device failure");
//    }
//  } else { 
//    DEBUG_PRINTLN("Error retrieving body of logging request");
//  }
//
//  String responseJson = "{\"Response\": \"" + logFileString + "\",}";
//  httpserver.send(200, "application/json", responseJson);
//}

// This function will handle incoming requests to log events from the master client
void handlePostSessionLog() {
  DynamicJsonBuffer jsonBuffer;
  JsonObject& requestJson = jsonBuffer.parseObject(httpserver.arg("plain"));
  String deviceSsid = String(ESP.getChipId());
  String logFileString = "";
  String Timestamp = requestJson["Timestamp"];
  String FileName = deviceSsid + "_" + Timestamp + ".log";
  String responseCode = "";
  String oldLogMessage = "";

  if (requestJson.success()) {
    //unsigned long Client_Identity = requestJson["Identity"];
    
    //if (Client_Identity == WEB_APP_MASTER_CLIENT_IDENTITY) { // We are only going to log the heartbeats / events that come from master

    if (WiFi.status() != WL_CONNECTED) {
      DEBUG_PRINTLN("Not connected to internet, cannot proceed with logging");
      responseCode = "404";
    } else {
      // Check if the Timestamp on the message is equal to LastLogDate
      if (Timestamp == LastLogReceivedDate) { // Routine Log, append it to the bottom, safe to assume the log exists
        responseCode = "1";

        // TODO: Obtain the log file and append the message to the bottom
        String message = requestJson["LogString"];
        logFileString += message;

        // Print the message to the log file
        
      } else {
        if (LastLogReceivedDate == "0") { // We should not get into the first part of this loop
          responseCode = "99";
        } else { // This is the very first message at the turn of a new day, need to create a new log file starting at IntialLogInfo
          responseCode = "2";
          String message = requestJson["LogString"];
          oldLogMessage += message;
        }
      }
    }
      
    //} else { // These events are from another client besides the master client
      // if (WEB_APP_MASTER_CLIENT_IDENTITY == 0) {
       //}
    //}

  } else { 
    DEBUG_PRINTLN("Error retrieving body of logging request");
    responseCode = "400";
  }

  String responseJson = "{\"Response\": \"" + logFileString + "\",";
  responseJson += "\"ResponseCode\": \"" + responseCode + "\",";
  responseJson += "\"OldMessage\": \"" + oldLogMessage + "\"";
  responseJson += "}";
  httpserver.send(200, "application/json", responseJson);
}


// This function triggers when a request is made against the ESP8266 that is not explicitely defined as a valid command
void handleNotFound() {
  if (loadFromSpiffs(httpserver.uri())) return;
  String message = "File Not Detected\n\n";
  message += "URI: ";
  message += httpserver.uri();
  message += "\nMethod: ";
  message += (httpserver.method() == HTTP_GET)?"GET":"POST";
  message += "\nArguments: ";
  message += httpserver.args();
  message += "\n";
  for (uint8_t i=0; i<httpserver.args(); i++) {
    message += " NAME:"+httpserver.argName(i) + "\n VALUE:" + httpserver.arg(i) + "\n";
  }
  httpserver.send(404, "text/plain", message);
  //Serial.println(message);
}



// ---- Accessory Functions ----

bool loadFromSpiffs(String path) {
  String dataType = "text/plain";
  if (path.endsWith("/")) path += "index.htm";

  if (path.endsWith(".src")) path = path.substring(0, path.lastIndexOf("."));
  else if (path.endsWith(".html")) dataType = "text/html";
  else if (path.endsWith(".htm")) dataType = "text/html";
  else if (path.endsWith(".css")) dataType = "text/css";
  else if (path.endsWith(".js")) dataType = "application/javascript";
  else if (path.endsWith(".png")) dataType = "image/png";
  else if (path.endsWith(".gif")) dataType = "image/gif";
  else if (path.endsWith(".jpg")) dataType = "image/jpeg";
  else if (path.endsWith(".ico")) dataType = "image/x-icon";
  else if (path.endsWith(".xml")) dataType = "text/xml";
  else if (path.endsWith(".pdf")) dataType = "application/pdf";
  else if (path.endsWith(".zip")) dataType = "application/zip";
  File dataFile = SPIFFS.open(path.c_str(), "r");
  if (httpserver.hasArg("download")) dataType = "application/octet-stream";
  if (httpserver.streamFile(dataFile, dataType) != dataFile.size()) {
  }

  dataFile.close();
  return true;
}

boolean PrintToHopsBoss(String message) {
  if (HopsBossConnected == true) {     //only do if connected
      Serial.println(message);   //send the change position command (echo) to the Hops-Boss controller
      DEBUG_PRINTLN("Message sent to HopsBoss Controller");
      return true;
    } else {
      DEBUG_PRINTLN("Hops Boss Controller not connected, message not sent");
      return false;
    }
}

boolean PrintToAccuFill(String message) {
  if (AccuFillConnected == true) {     //only do if connected
      Serial.println(message);   //send the change position command (echo) to the Hops-Boss controller
      DEBUG_PRINTLN("Message sent to AccuFill device");
      return true;
    } else {
      DEBUG_PRINTLN("AccuFill device not connected, message not sent");
      return false;
    }
}





