//This function loads the document, and performs the following functions when various
//actions are taken in the webpage
$(document).ready(function() {

    //Declare variables needed to store data for webpage
    var $TABLE = $("#table");
    var $ALARM = document.getElementById("AlarmAudio");
    var CumulativeKWH = 0;
    var TotalSessionCost = 0;
    var COST = 0;

    // All of these are for in step 3
    var StartHeatingTemp = 0;
    var StartHeatingTime = 0;
    var AutoPowerReduction = false;
    var BoilDetectTime = 600;
    var HotBreakOccurring = false;
    var HeatToBoilStartTemperature = 0;
    var HeatToBoilStartTime = 0;
    var LastMaxTempReachedTime = 0;
    var MaxTempReached = 0;
    var MaxTempReachedIncreaseTime = 0;
    var PwrMWasUsed = false;

    var AccuFillConnected = false;
    var AccuFillStartedFillingAutomatically = false;
    var AccuFillFilling = 0;
    var HopsBossConnected = false;

    // Step 4
    var SavedPwrM = 0;
    var BoilStartTime = 0;

    //MaintainTemp
    var CalculatedPowerSetting = 0;

    var HeatingToBoil = false;

    var FermentationControlActive = false;

    var RequestControllerDataTimer = false;
    var BoilTemp = 0;
    var TimerExpireTime = 0;

    var toLog = "";

    var InitialLogSent = false;
    var InitialLogBundleSent = false;

    var RestoringSnapshotSession = false;

    var MaintainTemperatureManually = false;
    var ManualTimerEnabled = false;
    var ManualTimerExpireTime = 0;

    // -------- Variables for verified brew session ---------
    var BrewSessionSteps;
    var NumberBrewSessionSteps = 0;
    var CurrentStepNumber = 0;
    var CurrentlyBrewing = false;
    var BrewingStartTime = 0;
    var WaitingForStartKey = false;
    var StartKeyPressed = false;
    var HoldingBoil = false;
    var CurrentHopsFeederPos = 0;
    var SetPoint = 0;
    var SavedSetpoint = 0;
    var UserChangedHeaterPower = false;
    var MaintainTemperatureTimerEnabled = false;
    var BrewStepExecutionFlag = true;

    var Step1Timer = 0;
    var Step2Timer = 0;
    var Step3Timer = 0;
    var Step4Timer = 0;
    var Step5Timer = 0;
    var Step6Timer = 0;

    var AudioInitialized = false;

    // -------- Variables for importing Beer.xml ---------
    var StartingWaterAmount = 0;
    var StartingWaterAmountUnits = "";
    var BoilTempAsString = "";

    // For determining whether to ask the user for data sharing permissions on first time
    var FirstTimeUser = false;

    var Current_BrewSteps_FileName = ""; //To be populated on LoadBrewSteps() and at start
    var Default_BrewSteps_FileName = ""; //To be populated on Load_Settings(), and Save_settings
    var Default_Temperature_Units = "F"; // To be populated on Load_Settings(), reflects on front page dropdowns/displays, graph, and brew steps
    var CurrentTemperature = "-";
    var Current_F = 0;
    var Current_C = 0;
    var CurrentFileUOM = "F";
    var Pro_Version = false;

    var IDENTITY = new Date().getTime();
    var VERSION = "1.0.0";

    var MainInterval; //The main js Interval set at 1000 ms to control the most fundamental program flow
    var Main_Chart;
    //var Time_Remaining_Gauge;
    var Temperature_Gauge;
    var AccuFillProgressBar;
    var dps_F = [];
    var dps_C = [];
    var dps = [];
    var dps_2 = [
        [],
        [],
        []
    ];
    var Graphing_Flag = false;
    var GetHeaterbeatFlag = true;
    var BrewingIntervalTimeIndex = 2;
    var BrewingIntervalTime = 5; // Will determine the time interval between chart updates. Used for pause / resume flow.
    var Graphing_Counter = 10; // Will determine when UpdateChart fires, while graphing, based on the BrewingIntervalTime
    var Chart_Background_Color = "#000000";
    var Chart_Primary_Axis_Color = "#000000";
    var Chart_Secondary_Axis_Color = "#000000";
    var Chart_Primary_Text_Color = "#000000";
    var Chart_Secondary_Text_Color = "#000000";
    var Chart_Tertiary_Text_Color = "#000000";
    var X_Axis_Index = 1;
    var Y_Axis_Index = "0"; // Get this from settings
    var BrewingIntervalTimeArray = [5, 10, 20, 30, 60];
    var Default_Voice_Name = "Samantha";
    var MinMaxArray_F = [
        ["Temperature", 0, 225, 25, "F"] //Min_Max_Interval for Temperature graph when F is selected
    ];
    var MinMaxArray_C = [
        ["Temperature", 0, 120, 15, "C"] //Min_Max_Interval for Temperature graph when C is selected
    ];
    var logArray = [];

    //-------------------------- Function Declarations Start Here -------------------------
    //-------------------------------------------------------------------------------------    

    //------------------------- Brew Session ---------------------------------
    //------------------------------------------------------------------------

    /*
     * The ExecuteBrewingSession function acts as the main driver for brew session functionality.
     * The function is called when the Start button is pressed, and ends when the last step has finished
     * or if the user presses the Stop button.
     */
    function ExecuteBrewingSession() {

        BrewStepExecutionFlag = false;


        // If we are at the last step, or if the step = 0, end the loop
        if (CurrentStepNumber > NumberBrewSessionSteps || CurrentStepNumber == 0) {
            StopBrewing();
        }

        // Get the step type and process the proper step
        if (CurrentStepNumber > 0) {
            var CurrentStep = BrewSessionSteps[(CurrentStepNumber - 1)];
            var Features = CurrentStep.getElementsByTagName('td');

            var CurrentStep_Type = Features[0].getElementsByTagName('select')[0].value;
            var CurrentStep_Prompt = Features[1].innerHTML;
            var CurrentStep_Setpoint = Features[2].getElementsByTagName('select')[0].value;
            var CurrentStep_StepTimer = Features[3].getElementsByTagName('select')[0].value;
            var CurrentStep_FillVolume = Features[4].innerHTML;
            var CurrentStep_HopsPos = Features[5].getElementsByTagName('select')[0].value;
            var CurrentStep_BoilFlag = Features[6].getElementsByTagName('input')[0].checked;
            var CurrentStep_PumpFlag = Features[7].getElementsByTagName('input')[0].checked;
            var CurrentStep_SpeakFlag = Features[8].getElementsByTagName('input')[0].checked;
            var CurrentStep_AlarmFlag = Features[9].getElementsByTagName('input')[0].checked;

            switch (CurrentStep_Type) {
                case "1":
                    ProcessBrewingStep1(CurrentStep_Prompt, CurrentStep_Setpoint,
                        CurrentStep_StepTimer, CurrentStep_FillVolume, CurrentStep_HopsPos,
                        CurrentStep_BoilFlag, CurrentStep_PumpFlag, CurrentStep_SpeakFlag, CurrentStep_AlarmFlag);
                    break;
                case "2":
                    ProcessBrewingStep2(CurrentStep_Prompt, CurrentStep_Setpoint,
                        CurrentStep_StepTimer, CurrentStep_FillVolume, CurrentStep_HopsPos,
                        CurrentStep_BoilFlag, CurrentStep_PumpFlag, CurrentStep_SpeakFlag, CurrentStep_AlarmFlag);
                    break;
                case "3":
                    ProcessBrewingStep3(CurrentStep_Prompt, CurrentStep_Setpoint,
                        CurrentStep_StepTimer, CurrentStep_FillVolume, CurrentStep_HopsPos,
                        CurrentStep_BoilFlag, CurrentStep_PumpFlag, CurrentStep_SpeakFlag, CurrentStep_AlarmFlag);
                    break;
                case "4":
                    // TODO: Do we need another flag here?
                    // See lines 2001 - 2003
                    if (HoldingBoil == true) {
                        CurrentStep_Setpoint = BoilTemp;
                    }

                    ProcessBrewingStep4(CurrentStep_Prompt, CurrentStep_Setpoint,
                        CurrentStep_StepTimer, CurrentStep_FillVolume, CurrentStep_HopsPos,
                        CurrentStep_BoilFlag, CurrentStep_PumpFlag, CurrentStep_SpeakFlag, CurrentStep_AlarmFlag);
                    break;
                case "5":
                    ProcessBrewingStep5(CurrentStep_Prompt, CurrentStep_Setpoint,
                        CurrentStep_StepTimer, CurrentStep_FillVolume, CurrentStep_HopsPos,
                        CurrentStep_BoilFlag, CurrentStep_PumpFlag, CurrentStep_SpeakFlag, CurrentStep_AlarmFlag);
                    break;
                case "6":
                    ProcessBrewingStep6(CurrentStep_Prompt, CurrentStep_Setpoint,
                        CurrentStep_StepTimer, CurrentStep_FillVolume, CurrentStep_HopsPos,
                        CurrentStep_BoilFlag, CurrentStep_PumpFlag, CurrentStep_SpeakFlag, CurrentStep_AlarmFlag);
                    break;
            }
        }

        // TODO: Call the maintain temp routine to determine the proper power setting
        // If not in fermentation mode; Controller does it automatically
        if (FermentationControlActive == false) {
            MaintainTemperature(); // 
        }

        // The only place this variable gets set is in step 4 - maintain temp
        if (MaintainTemperatureTimerEnabled == true) {
            UpdateTimer();
        } else {
            if (CurrentStep_Type != 3) { // Do not clear the time remaining if we are estimating time to reach temp in step 3
                // Clear the time remaining box on main UI Console if Timer is not enabled
                //document.getElementById("Time_Remaining").innerHTML = "0:00:00";
                if (ManualTimerExpireTime <= 0) {
                    document.getElementById("HR_Value_Span").innerHTML = "00";
                    document.getElementById("MIN_Value_Span").innerHTML = "00";
                    document.getElementById("SEC_Value_Span").innerHTML = "00";
                } else { // We know we are not in a maintaintemptimer, ad we know we have an exisiting manual timer value
                    UpdateManualTimer();
                }
            }
        }

        BrewStepExecutionFlag = true;

    }

    /*
     * The UpdateTimer function is used to update the programmatic timer during the course of a brew session.
     */
    function UpdateTimer() {
        var TimeRemaining = new Date((TimerExpireTime - (new Date().getTime())));
        var hours = TimeRemaining.getHours() - 18;
        var hoursString = "";
        if (hours < 10) {
            hoursString = "0" + hours.toString();
        } else {
            hoursString = hours.toString();
        }

        var minutes = TimeRemaining.getMinutes();
        var minutesString = "";
        if (minutes < 10) {
            minutesString = "0" + minutes.toString();
        } else {
            minutesString = minutes.toString();
        }

        var seconds = TimeRemaining.getSeconds();
        var secondsString = "";
        var partialMinute = (seconds / 60);
        if (seconds < 10) {
            secondsString = "0" + seconds.toString();
        } else {
            secondsString = seconds.toString();
        }

        // Format this in HrMinSec
        var formattedTime = hoursString + ":" + minutesString + ":" + secondsString;

        //Time_Remaining_Gauge.value = minutes + partialMinute;

        // Set the value on main UI console 
        //document.getElementById("Time_Remaining").innerHTML = formattedTime;
        document.getElementById("HR_Value_Span").innerHTML = hoursString;
        document.getElementById("MIN_Value_Span").innerHTML = minutesString;
        document.getElementById("SEC_Value_Span").innerHTML = secondsString;

        if (TimeRemaining <= 0) {
            MaintainTemperatureTimerEnabled = false;
            SoundAlarm();
            setTimeout(function() {
                TTSSpeak("Maintain temperature timer has expired");
            }, 3000);
        }
    }

    /*
     * The UpdateManualTimer function is used to update the timer manually set by user, not for the brew session timer.
     */
    function UpdateManualTimer() {
        var TimeRemaining = ManualTimerExpireTime;

        var numberHours = Math.floor(TimeRemaining / 3600); // 3600 sec per hour
        var NewTimeRemaining = TimeRemaining - (numberHours * 3600);

        var numberMinutes = Math.floor(NewTimeRemaining / 60);
        var NewNewTimeRemaining = NewTimeRemaining - (numberMinutes * 60);

        var numberSeconds = NewNewTimeRemaining;

        var hoursString = "";
        if (numberHours < 10) {
            hoursString = "0" + numberHours.toString();
        } else {
            hoursString = numberHours.toString();
        }

        var minutesString = "";
        if (numberMinutes < 10) {
            minutesString = "0" + numberMinutes.toString();
        } else {
            minutesString = numberMinutes.toString();
        }

        var secondsString = "";
        if (numberSeconds < 10) {
            secondsString = "0" + numberSeconds.toString();
        } else {
            secondsString = numberSeconds.toString();
        }

        // Format this in HrMinSec
        var formattedTime = hoursString + ":" + minutesString + ":" + secondsString;

        //Time_Remaining_Gauge.value = minutes + partialMinute;

        // Set the value on main UI console 
        //document.getElementById("Time_Remaining").innerHTML = formattedTime;
        document.getElementById("HR_Value_Span").innerHTML = hoursString;
        document.getElementById("MIN_Value_Span").innerHTML = minutesString;
        document.getElementById("SEC_Value_Span").innerHTML = secondsString;

        if (ManualTimerEnabled == true) {
            if (TimeRemaining <= 0) {
                ManualTimerEnabled = false;
                SoundAlarm();
                setTimeout(function() {
                    //$("#Trigger_Me").click();
                    TTSSpeak("Manual timer has expired");
                }, 3000);
            }
        }
    }

    // Step Type 1: Prompt user action with user confirmation
    // This subroutine will be called when processing a brew step with Step Type = 1
    function ProcessBrewingStep1(Prompt, TargetTemp, StepTime, FillVolume, HopsPos, BoilFlag, PumpFlag, SpeakFlag, AlarmFlag) {

        // Always reset the HoldingBoil variable if BoilFlag not set
        if (HoldingBoil == true && BoilFlag == false) {
            HoldingBoil = false;
        }

        if (WaitingForStartKey == false) {
            if (Step1Timer == 0) {
                HeatingToBoil = false;

                Prompt += " press the start button when finished";
                document.getElementById("Current_Brew_Session_Container_Prompt_Window").innerHTML = Prompt;

                if (PumpFlag == true) {
                    TurnPumpOn();
                } else {
                    TurnPumpOff();
                }

                // Check and adjust the HopsPos feeder as needed
                if (CurrentHopsFeederPos != HopsPos) {
                    if (HopsBossConnected == true) {
                        MoveHopsFeederPosition(HopsPos);
                    }
                }

                if (BoilFlag == true) {
                    SetPoint = BoilTemp
                } else {
                    SetPoint = TargetTemp
                }

                SavedSetpoint = SetPoint;
                //document.getElementById("Step_Setpoint").innerHTML = SavedSetpoint + " " + Default_Temperature_Units;
                if (SavedSetpoint == 0) {
                    Temperature_Gauge.update({
                        valueText: '-'
                    });
                } else {
                    Temperature_Gauge.update({
                        valueText: SavedSetpoint + '°' + Default_Temperature_Units
                    });
                }


                if (AlarmFlag == true) {
                    SoundAlarm();
                } else {
                    Step1Timer = 2;
                }
            }

            if (Step1Timer == 3) {
                if (SpeakFlag == true) {
                    TTSSpeak((Prompt + " press the start button when finished"));
                }

                toLog = "Starting step " + CurrentStepNumber + "...Prompt to user = " + Prompt;
                LogEvent(toLog);

                // Set the relevant program control flags
                WaitingForStartKey = true;
                StartKeyPressed = false;

                //UserChangedHeaterPower = false;
                MaintainTemperatureTimerEnabled = false;
                SaveSnapshotFile();
            }

            Step1Timer += 1;

        }
        // WaitingForStartKey = true, so we are on 2+ pass, and waiting for user to press start to advance
        else {
            // Advance to next step
            if (StartKeyPressed == true) {
                StartKeyPressed = false;
                WaitingForStartKey = false;
                //UserChangedHeaterPower = false;

                toLog = "End of step " + CurrentStepNumber + "... user pressed start";
                LogEvent(toLog);

                document.getElementById("Current_Brew_Session_Container_Prompt_Window").innerHTML = "-";

                // We will always be in 'Auto Brew Mode'; advance step
                CurrentStepNumber += 1;
                document.getElementById("Step_To_Start_Select").value = CurrentStepNumber;
                SavedSetpoint = 0; // To ensure Step Type 3 behaves properly on first pass
                Temperature_Gauge.update({
                    valueText: '-'
                });
                Step1Timer = 0;
                SaveSnapshotFile();
            }
        }
    }

    // Step Type 2: Prompt user action without user confirmation
    // This subroutine will be executed when processing a brew step with Step Type = 2
    function ProcessBrewingStep2(Prompt, TargetTemp, StepTime, FillVolume, HopsPos, BoilFlag, PumpFlag, SpeakFlag, AlarmFlag) {

        if (Step2Timer == 0) {
            // Always reset the HoldingBoil variable if BoilFlag not set
            if (HoldingBoil == true && BoilFlag == false) {
                HoldingBoil = false;
            }

            document.getElementById("Current_Brew_Session_Container_Prompt_Window").innerHTML = Prompt;
            HeatingToBoil = false;

            if (PumpFlag == true) {
                TurnPumpOn();
            } else {
                TurnPumpOff();
            }

            // Set the setpoint and savedsetpoint
            // TODO: Do we need this if?
            // Old = SetPoint = TargetTemp
            if (BoilFlag == true) {
                SetPoint = BoilTemp
            } else {
                SetPoint = TargetTemp
            }

            SavedSetpoint = SetPoint;
            //document.getElementById("Step_Setpoint").innerHTML = SavedSetpoint + " " + Default_Temperature_Units;
            if (SavedSetpoint == 0) {
                Temperature_Gauge.update({
                    valueText: '-'
                });
            } else {
                Temperature_Gauge.update({
                    valueText: SavedSetpoint + '°' + Default_Temperature_Units
                });
            }

            // Check and adjust the HopsPos feeder as needed
            if (CurrentHopsFeederPos != HopsPos) {
                if (HopsBossConnected == true) {
                    MoveHopsFeederPosition(HopsPos);
                }
            }

            if (AlarmFlag == true) {
                SoundAlarm();
            }
        }

        if (Step2Timer == 3) {
            if (SpeakFlag == true) {
                TTSSpeak(Prompt);
            }
        }

        if (Step2Timer == 10) {
            toLog = "Prompt user: " + Prompt;
            LogEvent(toLog);
            Step2Timer = 0;
            SavedSetpoint = 0; // To ensure Step Type 3 behaves properly on first pass
            Temperature_Gauge.update({
                valueText: '-'
            });
            CurrentStepNumber += 1;
            document.getElementById("Step_To_Start_Select").value = CurrentStepNumber;
            //UserChangedHeaterPower = false;
            SaveSnapshotFile();
        } else {
            Step2Timer += 1;
        }

    }

    // Step Type 3: Heat to specified temperature
    // This subroutine will be executed when processing a brew step with Step Type = 3
    function ProcessBrewingStep3(Prompt, TargetTemp, StepTime, FillVolume, HopsPos, BoilFlag, PumpFlag, SpeakFlag, AlarmFlag) {

        // Always reset the HoldingBoil variable if BoilFlag not set
        if (HoldingBoil == true && BoilFlag == false) {
            HoldingBoil = false;
        }

        // only start the heater on the 1st time through...we don't have a saved setpoint yet so this is 1st time
        if (SavedSetpoint == 0) {

            // Check and adjust the HopsPos feeder as needed
            if (CurrentHopsFeederPos != HopsPos) {
                if (HopsBossConnected == true) {
                    MoveHopsFeederPosition(HopsPos);
                }
            }

            StartHeatingTemp = CurrentTemperature;
            StartHeatingTime = new Date().getTime();

            AutoPowerReduction = false;

            // set the heating to boil flag and timers if our desied destination is boiling
            if (BoilFlag == true) {

                // if we are heating to boil, make sure to set the proper flags, setpoint, and boil detect timer
                // If heating to boil not set, we are just starting this Step, so we do the following 1st time through this routine
                if (HeatingToBoil == false) {
                    HeatingToBoil = true;
                    BoilTemp = TargetTemp; // TODO: Remove this from here, BoilTemp will be a constant depending on ssettings
                    BoilDetectTime = 600; // force a large time value (10 minutes = 600 seconds) 1st time through temperature change 
                    HotBreakOccurring = false; // Reset this flag so the heater comes on initially

                    HeatToBoilStartTemperature = CurrentTemperature;
                    HeatToBoilStartTime = new Date().getTime();
                    LastMaxTempReachedTime = HeatToBoilStartTime;

                    if (document.getElementById('Temp_F_Radio').checked) {
                        BoilTemp = 220;
                    } else if (document.getElementById('Temp_C_Radio').checked) {
                        BoilTemp = 105;
                    }

                    SetPoint = BoilTemp // set the boil temperature to a very high number
                    SavedSetpoint = SetPoint;
                    //document.getElementById("Step_Setpoint").innerHTML = SavedSetpoint + " " + Default_Temperature_Units;
                    if (SavedSetpoint == 0) {
                        Temperature_Gauge.update({
                            valueText: '-'
                        });
                    } else {
                        Temperature_Gauge.update({
                            valueText: SavedSetpoint + '°' + Default_Temperature_Units
                        });
                    }

                    // set the lasttemp variable To zero - to auto determine boiltemp   
                    // set this to zero so the first temp sets our current temp
                    MaxTempReached = 0;
                    MaxTempReachedIncreaseTime = new Date().getTime();

                    if (Prompt.length == 0) {
                        Prompt = "Starting Step " + CurrentStepNumber + ": Heating to boil";
                    }

                    toLog = Prompt;
                    LogEvent(toLog);

                }

            } else { // not heating to boil so set regular setpoints

                HeatingToBoil = false;

                // set the MashTemp[n] temp set points
                SetPoint = TargetTemp;
                SavedSetpoint = SetPoint;
                //document.getElementById("Step_Setpoint").innerHTML = SavedSetpoint + " " + Default_Temperature_Units;
                if (SavedSetpoint == 0) {
                    Temperature_Gauge.update({
                        valueText: '-'
                    });
                } else {
                    Temperature_Gauge.update({
                        valueText: SavedSetpoint + '°' + Default_Temperature_Units
                    });
                }

                // added to allow estimating time kettle will reach targe temp
                // set the lasttemp variable To zero - new For version 3.0 To auto determine boiltemp
                MaxTempReached = CurrentTemperature; //set this to current temperature
                MaxTempReachedIncreaseTime = new Date().getTime();


                if (Prompt.length == 0) {
                    Prompt = "Starting Step " + CurrentStepNumber + ": Heating kettle to " + SetPoint + " degrees";
                    if (PumpFlag == true) {
                        Prompt = Prompt + " while recirculating";
                    }
                }

                toLog = Prompt;
                LogEvent(toLog);

            }

            if (PumpFlag == true) {
                TurnPumpOn();
            } else {
                TurnPumpOff();
            }

            document.getElementById("Current_Brew_Session_Container_Prompt_Window").innerHTML = Prompt;

            if (SpeakFlag == true) {
                TTSSpeak(Prompt);
            }

            toLog = Prompt;
            LogEvent(toLog);
            SaveSnapshotFile();
            //UserChangedHeaterPower = false;

        }

        // Monitor heat to get to target temp
        // normal heating so use normal power settings and normal determination of end of this step
        if (BoilFlag == false) {
            // the time it take to change 1 degree is the inverse of the slope or minutes per degree (min/degree)

            if (StartHeatingTemp == 0) {
                StartHeatingTemp = CurrentTemperature; // for restarts with snapshot thsi will not have been recorder yet so set to current
            }

            // this should be degrees/minute
            var TempChangesSlope = Number(((CurrentTemperature - StartHeatingTemp) / ((new Date().getTime() - StartHeatingTime) / 60000)));

            toLog = "Slope = " + TempChangesSlope + " degrees/min";
            LogEvent(toLog);

            var DegreesRemaining = Number(SavedSetpoint - Number(CurrentTemperature));
            //LogEvent(DegreesRemaining);
            var MinutesToGetToSetpoint = Number(DegreesRemaining / TempChangesSlope);

            if (ManualTimerExpireTime <= 0) {
                if (MinutesToGetToSetpoint <= 180) { // only display the time if the time is reasonable < 3 hours
                    var TimeRemaining = new Date(MinutesToGetToSetpoint * 60000);

                    var hours = TimeRemaining.getHours() - 18;
                    if (hours < 0) {
                        //document.getElementById("Time_Remaining").innerHTML = "-"
                        document.getElementById("HR_Value_Span").innerHTML = "00";
                        document.getElementById("MIN_Value_Span").innerHTML = "00";
                        document.getElementById("SEC_Value_Span").innerHTML = "00";
                    } else {
                        var hoursString = "";
                        if (hours < 10) {
                            hoursString = "0" + hours.toString();
                        } else {
                            hoursString = hours.toString();
                        }

                        var minutes = TimeRemaining.getMinutes();
                        var minutesString = "";
                        if (minutes < 10) {
                            minutesString = "0" + minutes.toString();
                        } else {
                            minutesString = minutes.toString();
                        }

                        var seconds = TimeRemaining.getSeconds();
                        var secondsString = "";
                        if (seconds < 10) {
                            secondsString = "0" + seconds.toString();
                        } else {
                            secondsString = seconds.toString();
                        }

                        // Format this in HrMinSec
                        var formattedTime = hoursString + ":" + minutesString + ":" + secondsString;
                        //document.getElementById("Time_Remaining").innerHTML = formattedTime;
                        document.getElementById("HR_Value_Span").innerHTML = hoursString;
                        document.getElementById("MIN_Value_Span").innerHTML = minutesString;
                        document.getElementById("SEC_Value_Span").innerHTML = secondsString;
                    }

                } else {
                    //document.getElementById("Time_Remaining").innerHTML = "-";
                    document.getElementById("HR_Value_Span").innerHTML = "00";
                    document.getElementById("MIN_Value_Span").innerHTML = "00";
                    document.getElementById("SEC_Value_Span").innerHTML = "00";
                }
            } else {
                UpdateManualTimer();
            }

            if (CurrentTemperature >= SavedSetpoint) { // strike temp reached ..maintain temp
                Prompt = "Kettle at target temperature";

                document.getElementById("Current_Brew_Session_Container_Prompt_Window").innerHTML = Prompt;

                toLog = "End of step " + CurrentStepNumber;
                toLog += ": " + Prompt;
                LogEvent(toLog);

                document.getElementById("Current_Brew_Session_Container_Prompt_Window").innerHTML = "-";

                PwrMWasUsed = false;

                CurrentStepNumber += 1;
                document.getElementById("Step_To_Start_Select").value = CurrentStepNumber;
                SaveSnapshotFile();
                SavedSetpoint = 0;
                Temperature_Gauge.update({
                    valueText: '-'
                });
                //UserChangedHeaterPower = false;
            }

        } else { // BoilFlag = true so we are heating to boil, so we need to use different ,logic to know when we have reached boil where maxtemp stays same for boil detect time

            // automatially determine boil temperature by determining if max temp reaced stays the same for boildetecttime
            // see If our temperature has increased by a degree
            // TODO: See if this is compatible as a number
            //CurrentTemperature = document.getElementById("Current_Temperature").innerHTML; // added this as even though it is a global it was not correct when debugging

            // check to see if max temp reached is zero as this is the 1st time through here so we need to set a basis temperature for the slope calc as we may just have been at the verge of a
            // temperature rise and this would reveal an inaccurate slope (e.g) temp rise of 1 degree in 1ms!  This makes boil detect fail too quickly
            var Slope = 0;

            if ((CurrentTemperature > MaxTempReached) && (MaxTempReached == 0)) {
                MaxTempReached = CurrentTemperature;
                LastMaxTempReachedTime = MaxTempReachedIncreaseTime; // save this so we can calulate how long it took to go up 1 degree
                MaxTempReachedIncreaseTime = new Date().getTime();
                return;
            } else if (CurrentTemperature > MaxTempReached) {
                // temp increased, so save the time this occurred AND set the new MaxTempReached
                MaxTempReached = CurrentTemperature;
                LastMaxTempReachedTime = MaxTempReachedIncreaseTime; // save this so we can calulate how long it took to go up 1 degree
                MaxTempReachedIncreaseTime = new Date().getTime();

                // we just had an increase in temperature...calculate how long it took from the last one, 
                // this is the slope degrees/minute, only do this if within 5% of boiling (85C or 185F)
                if (((document.getElementById("Temp_F_Radio").checked) && (CurrentTemperature >= 185)) || ((document.getElementById("Temp_C_Radio").checked) && (CurrentTemperature >= 85))) {

                    // slope is degrees/second = DeltaT/Deltat  where T = Temperature and t = time (in seconds)
                    // this gives us the slope of the entire heating curve from the endpoints rather than the slope of only the last degree change 
                    Slope = 1 / ((MaxTempReachedIncreaseTime - LastMaxTempReachedTime) / 1000);

                    toLog = "Slope = " + Slope.toFixed(2) + " degrees/sec";
                    LogEvent(toLog);

                    // the time it takes to change 1 degree is the inverse of the slope or minutes per degree (seconds/degree) which is the boil detect time!
                    // so we invert the slope and add 10% minutes to be safe as the integer value could be zero
                    // decrease the time base to seconds so we add 33.3% to be sure we have enough
                    var SecondsToIncreaseOneDegree = ((1 / Slope) / 0.6666);

                    // now use boildetecttime as additional time in seconds to add to calculated slope derived time
                    // TODO: Add this parameter
                    var SecondsToAdd = document.getElementById("Boil_Detect_Time").value;

                    toLog = "Seconds to increase one degree = " + SecondsToIncreaseOneDegree.toFixed(2) + " seconds";
                    //LogEvent(toLog);

                    // check if slope is valid as the 1st time through it will be wrong
                    if (SecondsToIncreaseOneDegree > 15) { // any valid degree change will be >15 seconds
                        BoilDetectTime = SecondsToIncreaseOneDegree + SecondsToAdd;
                    } else { // force the value to a high number so we don't inadvertantly think we have reached boil
                        BoilDetectTime = 600;
                    }

                    toLog = "Auto set of BoilDetectTime to: " + BoilDetectTime + " seconds";
                    //LogEvent(toLog);


                } else { // not in boil temp range temp so boildetecttime must be set very high
                    BoilDetectTime = 600; // set to 10 minutes (600 seconds) so it does not activate inadvertantly
                }

            }

            // now see If we have had the same temp For MaxTempTime, which means this Is the boil temperature!
            var SecondsSinceLastTempChange = ((new Date().getTime() - MaxTempReachedIncreaseTime) / 1000);

            if (SecondsSinceLastTempChange >= BoilDetectTime) { // updated to 1000 vs 60000 when swithc boil detect from minutes to seconds
                // we must be at boil, hold this temperature by making it the boiltemp
                BoilTemp = CurrentTemperature;
                SetPoint = BoilTemp;
                SavedSetpoint = SetPoint;
                //document.getElementById("Step_Setpoint").innerHTML = SavedSetpoint + " " + Default_Temperature_Units;
                if (SavedSetpoint == 0) {
                    Temperature_Gauge.update({
                        valueText: '-'
                    });
                } else {
                    Temperature_Gauge.update({
                        valueText: SavedSetpoint + '°' + Default_Temperature_Units
                    });
                }

                BoilStartTime = new Date().getTime();
            } else { // we are still timing the last temperature change and we have not exceeded the BoilDetectTime so update the progress bar
                // update the progress bar with the proper percent complete
                var ProgBarValue = (SecondsSinceLastTempChange / BoilDetectTime) * 100;

                if (ProgBarValue >= 0 && ProgBarValue <= 100) {

                    toLog = "Boil detect slope = " + (1 / Slope) + " sec/deg";
                    LogEvent(toLog);
                } else {

                }

            }

            if (StartHeatingTemp == 0) {
                StartHeatingTemp = CurrentTemperature; // for restarts with snapshot thsi will not have been recorder yet so set to current
            }

            // this should be degrees/minute
            var TempChangesSlope = Number(((CurrentTemperature - StartHeatingTemp) / ((new Date().getTime() - StartHeatingTime) / 60000)));

            toLog = "Slope = " + TempChangesSlope + " degrees/min";
            LogEvent(toLog);

            var DegreesRemaining = Number(SavedSetpoint - Number(CurrentTemperature));
            //LogEvent(DegreesRemaining);
            var MinutesToGetToSetpoint = Number(DegreesRemaining / TempChangesSlope);

            if (ManualTimerExpireTime <= 0) {
                if (MinutesToGetToSetpoint <= 180) { // only display the time if the time is reasonable < 3 hours
                    var TimeRemaining = new Date(MinutesToGetToSetpoint * 60000);

                    var hours = TimeRemaining.getHours() - 18;
                    if (hours < 0) {
                        //document.getElementById("Time_Remaining").innerHTML = "-"
                        document.getElementById("HR_Value_Span").innerHTML = "00";
                        document.getElementById("MIN_Value_Span").innerHTML = "00";
                        document.getElementById("SEC_Value_Span").innerHTML = "00";
                    } else {
                        var hoursString = "";
                        if (hours < 10) {
                            hoursString = "0" + hours.toString();
                        } else {
                            hoursString = hours.toString();
                        }

                        var minutes = TimeRemaining.getMinutes();
                        var minutesString = "";
                        if (minutes < 10) {
                            minutesString = "0" + minutes.toString();
                        } else {
                            minutesString = minutes.toString();
                        }

                        var seconds = TimeRemaining.getSeconds();
                        var secondsString = "";
                        if (seconds < 10) {
                            secondsString = "0" + seconds.toString();
                        } else {
                            secondsString = seconds.toString();
                        }

                        // Format this in HrMinSec
                        var formattedTime = hoursString + ":" + minutesString + ":" + secondsString;
                        //document.getElementById("Time_Remaining").innerHTML = formattedTime;
                        document.getElementById("HR_Value_Span").innerHTML = hoursString;
                        document.getElementById("MIN_Value_Span").innerHTML = minutesString;
                        document.getElementById("SEC_Value_Span").innerHTML = secondsString;
                    }

                } else {
                    //document.getElementById("Time_Remaining").innerHTML = "-";
                    document.getElementById("HR_Value_Span").innerHTML = "00";
                    document.getElementById("MIN_Value_Span").innerHTML = "00";
                    document.getElementById("SEC_Value_Span").innerHTML = "00";
                }
            } else {
                UpdateManualTimer();
            }

            // Monitor heat To get To Boil temp Then we are done with this Step
            if (CurrentTemperature >= SavedSetpoint) { // Boil temp reached

                BoilTemp = MaxTempReached;
                SetPoint = BoilTemp;
                SavedSetpoint = SetPoint;
                //document.getElementById("Step_Setpoint").innerHTML = SavedSetpoint + " " + Default_Temperature_Units;
                if (SavedSetpoint == 0) {
                    Temperature_Gauge.update({
                        valueText: '-'
                    });
                } else {
                    Temperature_Gauge.update({
                        valueText: SavedSetpoint + '°' + Default_Temperature_Units
                    });
                }
                HoldingBoil = true; // this forces maitain temp routine to use PwrB all the time

                toLog = "End of step " + CurrentStepNumber + "...heat to boiling";
                LogEvent(toLog);

                HeatingToBoil = false;
                WaitingForStartKey = false;
                MaxTempReached = 0;

                // TODO: Turn off the Boil Detect progress bar and labels

                // UserChangedHeaterPower = false;
                CurrentStepNumber += 1;
                document.getElementById("Step_To_Start_Select").value = CurrentStepNumber;
                SaveSnapshotFile();

            }

        }

    }

    // Step Type 4: Maintain specified temperature
    // This subroutine will be executed when processing a brew step with Step Type = 4
    function ProcessBrewingStep4(Prompt, TargetTemp, StepTime, FillVolume, HopsPos, BoilFlag, PumpFlag, SpeakFlag, AlarmFlag) {

        // Always reset the HoldingBoil variable if BoilFlag not set
        if (HoldingBoil == true && BoilFlag == false) {
            HoldingBoil = false;
        }

        //First time through the function on this pass, start a timer
        if (MaintainTemperatureTimerEnabled == false) {
            AutoPowerReduction = false;
            HeatingToBoil = false;

            // TODO:
            // Add logic to restore the value of PwrM to its starting value,
            // as it could have been lowered by other steps too low

            var OldPwrM = document.getElementById("PwrM").value;
            document.getElementById("PwrM").value = SavedPwrM;

            // Check and adjust the HopsPos feeder as needed
            if (CurrentHopsFeederPos != HopsPos) {
                if (HopsBossConnected == true) {
                    MoveHopsFeederPosition(HopsPos);
                }
            }

            if (Prompt.length == 0) {
                Prompt = "Starting step " + CurrentStepNumber + ": Maintaining temperature of " + SetPoint + " degrees";
                if (PumpFlag == true) {
                    Prompt += " while recirculating";
                }
            }

            toLog = Prompt;

            document.getElementById("Current_Brew_Session_Container_Prompt_Window").innerHTML = Prompt;

            if (SpeakFlag == true) {
                TTSSpeak(Prompt);
            }


            // Set the setpoint
            if (BoilFlag == true) {
                // Possible this is called without the heat to boil being called
                // Thus there would be no boiltemp determined, so use 220 and 105
                // TODO: Move the initialization of this variable to session initialization
                if (MaxTempReached == 0) {
                    if (document.getElementById('Temp_F_Radio').checked) {
                        BoilTemp = 220;
                    } else if (document.getElementById('Temp_C_Radio').checked) {
                        BoilTemp = 105;
                    }
                }
                SetPoint = BoilTemp
            } else {
                SetPoint = TargetTemp
            }

            SavedSetpoint = SetPoint;
            //document.getElementById("Step_Setpoint").innerHTML = SavedSetpoint + " " + Default_Temperature_Units;
            if (SavedSetpoint == 0) {
                Temperature_Gauge.update({
                    valueText: '-'
                });
            } else {
                Temperature_Gauge.update({
                    valueText: SavedSetpoint + '°' + Default_Temperature_Units
                });
            }

            // Turn pump on if needed
            if (PumpFlag == true) {
                TurnPumpOn();
            } else {
                TurnPumpOff();
            }

            if (RestoringSnapshotSession == false) {


                if (BoilDetectTime != 600 && BoilFlag == true) {

                    //TimerExpireTime = BoilStartTime + (StepTime * 60000); // TODO: Check this logic
                    BoilDetectTime = 600;

                } else {

                    //TimerExpireTime = new Date().getTime() + (StepTime * 60000);

                }

                TimerExpireTime = new Date().getTime() + (StepTime * 60000);

                //Adjust the maximum tick value and set the current value of gauge to be the max
                var maxTen = Math.ceil(StepTime / 10) * 10;
                if (maxTen > 60) {
                    var newMajorTicksArray = [];
                    for (var i = 0; i <= maxTen; i += 10) {
                        newMajorTicksArray.push(i);
                    }
                }

                //Time_Remaining_Gauge.value = StepTime;

            } else { // We are restoring a session, if boil flag is true we need to set holding boil
                if (BoilFlag == true) {

                    HoldingBoil = true;
                }

            }


            toLog = Prompt;
            LogEvent(toLog);
            // Enable the timer
            MaintainTemperatureTimerEnabled = true;
            SaveSnapshotFile();
        }

        // Check if timer is expired so we can start the next step
        if (MaintainTemperatureTimerEnabled == true) {
            if (new Date().getTime() >= TimerExpireTime) {

                MaintainTemperatureTimerEnabled = false;

                toLog = "End of step " + CurrentStepNumber + "...timer expired";
                LogEvent(toLog);

                PwrMWasUsed = false;
                BoilStartTime = 0; // Make sure BoilStartTime is only used once

                //UserChangedHeaterPower = false;
                CurrentStepNumber += 1;
                document.getElementById("Step_To_Start_Select").value = CurrentStepNumber;
                SavedSetpoint = 0;
                Temperature_Gauge.update({
                    valueText: '-'
                });
                SaveSnapshotFile();

            }
        }
    }

    // Step Type 5: Cool to specified temperature
    // This subroutine will be executed when processing a brew step with Step Type = 5
    function ProcessBrewingStep5(Prompt, TargetTemp, StepTime, FillVolume, HopsPos, BoilFlag, PumpFlag, SpeakFlag, AlarmFlag) {

        // Always reset the HoldingBoil variable if BoilFlag not set
        if (HoldingBoil == true && BoilFlag == false) {
            HoldingBoil = false;
        }

        // only start cooling on the 1st time through...we don't have a saved setpoint yet so this is 1st time
        if (SavedSetpoint == 0) {

            // Check and adjust the HopsPos feeder as needed
            if (CurrentHopsFeederPos != HopsPos) {
                if (HopsBossConnected == true) {
                    MoveHopsFeederPosition(HopsPos);
                }
            }

            // Set the heating to boil flag and timers if our desired destination is boiling
            HeatingToBoil = false;
            SetPoint = TargetTemp;
            SavedSetpoint = SetPoint;
            //document.getElementById("Step_Setpoint").innerHTML = SavedSetpoint + " " + Default_Temperature_Units;
            if (SavedSetpoint == 0) {
                Temperature_Gauge.update({
                    valueText: '-'
                });
            } else {
                Temperature_Gauge.update({
                    valueText: SavedSetpoint + '°' + Default_Temperature_Units
                });
            }

            if (Prompt.length == 0) {
                Prompt = "Starting step " + CurrentStepNumber + ": Cooling kettle to " + SetPoint + " degrees";
                if (PumpFlag == true) {
                    Prompt += " while recirculating";
                }
            }

            toLog = Prompt;
            LogEvent(toLog);

            // We never heat while cooling
            // Have our SetPoint, so turn heater off
            TurnHeaterOff();

            if (PumpFlag == true) {
                TurnPumpOn();
            } else {
                TurnPumpOff();
            }

            document.getElementById("Current_Brew_Session_Container_Prompt_Window").innerHTML = Prompt;

            if (SpeakFlag == true) {
                TTSSpeak(Prompt);
            }

            toLog = "Waiting for kettle to get to desired chill temp...";
            LogEvent(toLog);
            SaveSnapshotFile();
            //UserChangedHeaterPower = false;

        }

        //see if we are at the desired chill temperature
        //cooling temp reached end step
        if (CurrentTemperature <= SavedSetpoint) {
            Prompt = "Kettle at Target Cooling Temperature";
            document.getElementById("Current_Brew_Session_Container_Prompt_Window").innerHTML = Prompt;

            toLog = Prompt;
            LogEvent(toLog);

            if (Step5Timer == 0) {
                if (AlarmFlag == true) {
                    SoundAlarm();
                }

                if (SpeakFlag == true) {
                    TTSSpeak(Prompt);
                }
            } else if (Step5Timer == 3) {
                toLog = "End of step " + CurrentStepNumber + "...chill to temp";
                LogEvent(toLog);

                document.getElementById("Current_Brew_Session_Container_Prompt_Window").innerHTML = "-";

                // Turn heater off
                TurnHeaterOff();
                // Turn pump off
                TurnPumpOff();
                // Set the SetPoint to 0 so we do not heat
                SetPoint = 0;
                // For proper control in other steps
                SavedSetpoint = 0;
                //document.getElementById("Step_Setpoint").innerHTML = SavedSetpoint + " " + Default_Temperature_Units;
                Temperature_Gauge.update({
                    valueText: '-'
                });
                // For proper control in other steps
                WaitingForStartKey = false;
                // Advance the step number
                CurrentStepNumber += 1;
                //UserChangedHeaterPower = false;
                document.getElementById("Step_To_Start_Select").value = CurrentStepNumber;
                SaveSnapshotFile();
            } else {
                Step5timer += 1;
            }
        }
    }

    // Step Type 6: Fill Kettle using AccuFill Device
    // This subroutine will be executed when processing a brew step with Step Type = 6
    function ProcessBrewingStep6(Prompt, TargetTemp, StepTime, FillVolume, HopsPos, BoilFlag, PumpFlag, SpeakFlag, AlarmFlag) {

        // Always reset the HoldingBoil variable if BoilFlag not set
        if (HoldingBoil == true && BoilFlag == false) {
            HoldingBoil = false;
        }

        // This step should always be preceded by a step 1 prompting the user to
        // install the filler and tur water on, as well as purge hose of air.

        if (AccuFillConnected == false) {
            //alert("The AccuFill device is not connected. Please connect it to proceed with this step.");
            document.getElementById("AlertMessageBoxText").innerHTML = "The AccuFill device is not connected. Please connect it to proceed with this step.";
            $("#AlertMessageBox").dialog("open");
            return;
        }

        var FillAmount = 0;
        var StartingWaterAmount_String = "";

        if (AccuFillStartedFillingAutomatically == false) {
            if (Prompt.length == 0) {
                if (document.getElementById('Temp_F_Radio').checked == true) {
                    FillAmount = FillVolume / 10;
                    StartingWaterAmount_String = FillAmount + " gallons";
                } else {
                    FillAmount = FillVolume / 10;
                    StartingWaterAmount_String = FillAmount + " liters";
                }

                Prompt = "Starting Step " + CurrentStepNumber + ": Filling kettle to " + StartingWaterAmount_String;
                if (PumpFlag == true) {
                    Prompt = Prompt + " while recirculating";
                }
            }

            toLog = Prompt;
            LogEvent(toLog);

            document.getElementById("Current_Brew_Session_Container_Prompt_Window").innerHTML = NewPromptString;

            if (SpeakFlag == true) {
                TTSSpeak(Prompt);
            }
        }

        // ok, we have an AccuFill connected, so start filling if we are not already - AccuFillFilling flag gets set by heartbeat response
        if ((AccuFillFilling == 0) && (AccuFillStartedFillingAutomatically == false)) {

            var FillVolInGallons = 0;

            // FillVolume is set in gallons or liters * 10.  If in liters, we need to convert to gallons as the AccuFill only takes gallons *10
            if (document.getElementById('Temp_F_Radio').checked == true) {
                FillVolInGallons = FillVolume;
            } else {
                FillVolInGallons = FillVolume * 0.264172; // liters
            }

            PostFillVolToAccuFill(FillVolInGallons);
            AccuFillFilling = 1;
            AccuFillStartedFillingAutomatically = true;
            //TODO: Delay(1500)
            if (PumpFlag == true) {
                setTimeout(function() {
                    TurnPumpOn();
                }, 1500);
            }

            return;
        }

        // Monitor fill to see when we are full and complete step
        if ((AccuFillFilling == 0) && (AccuFillStartedFillingAutomatically == true)) {
            toLog = "End of step " + CurrentStepNumber + "...fill kettle";
            LogEvent(toLog);
            AccuFillStartedFillingAutomatically = false;
            WaitingForStartKey = false;
            CurrentStepNumber += 1;
            document.getElementById("Step_To_Start_Select").value = CurrentStepNumber;
            //UserChangedHeaterPower = false;
            SaveSnapshotFile();
        }

    }

    /*
     * The MaintainTemperature function is called programmatically during brew sessions to make
     * automatic adjustments to the heater power level depending on target / current temperatures.
     */
    function MaintainTemperature() {

        // The purpose of this function is to set the heater power % value on the controller based on the current setpoint / target temp
        if (UserChangedHeaterPower == false) {
            if ((SetPoint > 0 && CurrentTemperature == -63) || (SetPoint > 0 && CurrentTemperature == -52)) {

                CalculatedPowerSetting = 0;
                TurnHeaterOff();

                toLog = "Probe not connected with setpoint active - setting power to zero";
                LogEvent(toLog);

                return;
            }

            if (SetPoint == 0) {

                if (CurrentStepNumber > 0) {
                    toLog = "SetPoint = zero when current step > zero";
                    LogEvent(toLog);
                }

                if (UserChangedHeaterPower == true) {

                    document.getElementById("Target_Temperature_Select").value = "none_selected"; //added v1.20 as heater did not turn off for prompt step

                } else {
                    //Pwr = 0;
                    document.getElementById("Target_Temperature_Select").value = "none_selected";

                    if ($("#Heater_Power_Slider").slider("option", "value") > 0) {
                        TurnHeaterOff();
                    }
                }

                return; // No Setpoint == no maintain temp
            }

            if (HeatingToBoil == true && HotBreakOccurring == true) {

                CalculatedPowerSetting = 0;
                toLog = "Pwr = 0% to avoid hot break boilover";
                LogEvent(toLog);
            } else if (CurrentTemperature < (SetPoint - Number(document.getElementById("DeltaT1").value))) {

                if (HoldingBoil == true) {
                    CalculatedPowerSetting = Number(document.getElementById("PwrB").value);
                    toLog = "Pwr = PwrB";
                    LogEvent(toLog);
                } else {
                    CalculatedPowerSetting = Number(document.getElementById("MaximumHeaterPower").value);
                    toLog = "Pwr limited to Max instead of PwrB. Pwr = " + CalculatedPowerSetting + "%";
                    LogEvent(toLog);
                }
            } else if ((CurrentTemperature >= (SetPoint - Number(document.getElementById("DeltaT1").value))) && (CurrentTemperature < (SetPoint - Number(document.getElementById("DeltaT2").value)))) {

                if (Number(document.getElementById("MaximumHeaterPower").value) < Number(document.getElementById("PwrS").value)) {
                    CalculatedPowerSetting = Number(document.getElementById("MaximumHeaterPower").value);
                    toLog = "Pwr limited to Max instead of PwrS. PwrS = " + CalculatedPowerSetting;
                    LogEvent(toLog);
                } else {
                    CalculatedPowerSetting = Number(document.getElementById("PwrS").value)
                    toLog = "Pwr = PwrS";
                    LogEvent(toLog);
                }
            } else if ((CurrentTemperature >= (SetPoint - Number(document.getElementById("DeltaT2").value))) && (CurrentTemperature < SetPoint)) {

                if (HoldingBoil == true) {

                    if (Number(document.getElementById("MaximumHeaterPower").value) < Number(document.getElementById("PwrB").value)) {
                        CalculatedPowerSetting = Number(document.getElementById("MaximumHeaterPower").value);
                        toLog = "Pwr limited to Max instead of PwrB. PwrB = " + CalculatedPowerSetting;
                        LogEvent(toLog);
                    } else {
                        CalculatedPowerSetting = Number(document.getElementById("PwrB").value);
                        toLog = "Pwr = PwrB";
                        LogEvent(toLog);
                    }
                } else {

                    if (PwrMWasUsed == true) {
                        PwrMWasUsed = false;
                        AutoPowerReduction = false;
                        document.getElementById("PwrM").value += 1;
                        if (Number(document.getElementById("PwrM").value) > 100) {
                            document.getElementById("PwrM").value = 100;
                        }
                        toLog = "Increased PwrM automatically to " + document.getElementById("PwrM").value;
                        LogEvent(toLog);
                    }

                    if (Number(document.getElementById("MaximumHeaterPower").value) < Number(document.getElementById("PwrL").value)) {
                        CalculatedPowerSetting = document.getElementById("MaximumHeaterPower").value;
                        toLog = "Pwr limited to Max instead of PwrL. PwrL = " + CalculatedPowerSetting;
                        LogEvent(toLog);
                    } else {
                        CalculatedPowerSetting = document.getElementById("PwrL").value;
                        toLog = "Pwr = PwrL";
                        LogEvent(toLog);
                    }
                }
            } else if (CurrentTemperature == SetPoint) {

                AutoPowerReduction = false;

                if (HoldingBoil == true) {
                    if (Number(document.getElementById("MaximumHeaterPower").value) < Number(document.getElementById("PwrB").value)) {
                        CalculatedPowerSetting = document.getElementById("MaximumHeaterPower").value;
                        toLog = "Pwr limited to Max instead of PwrB. PwrB = " + CalculatedPowerSetting;
                        LogEvent(toLog);
                    } else {
                        CalculatedPowerSetting = document.getElementById("PwrB").value;
                        toLog = "Pwr = PwrB";
                        LogEvent(toLog);
                    }
                } else {
                    if (SetPoint > 0) {
                        if (Number(document.getElementById("MaximumHeaterPower").value) < Number(document.getElementById("PwrM").value)) {
                            CalculatedPowerSetting = document.getElementById("MaximumHeaterPower").value;
                            toLog = "Pwr limited to Max instead of PwrM. PwrM = " + CalculatedPowerSetting;
                            LogEvent(toLog);
                        } else {
                            CalculatedPowerSetting = document.getElementById("PwrM").value;
                            toLog = "Pwr = PwrM";
                            LogEvent(toLog);
                        }

                    } else if (SetPoint == 0) {
                        CalculatedPowerSetting = 0;
                        toLog = "Pwr = 0";
                        LogEvent(toLog);
                    }
                }
            } else if ((CurrentTemperature > SetPoint) && (SetPoint > 0)) {

                if (AutoPowerReduction == false) {
                    AutoPowerReduction = true; // set this so if we get to PwrL again, we increase temp by 1%
                    document.getElementById("PwrM").value -= 1;

                    if (Number(document.getElementById("PwrM").value) < 5) {
                        document.getElementById("PwrM").value = 5;
                        toLog = "Restricted PwrM to 5";
                        LogEvent(toLog);
                    } else {
                        toLog = "Decreased PwrM automatically to " + document.getElementById("PwrM").value;
                        LogEvent(toLog);
                    }
                }

                CalculatedPowerSetting = 0;
                toLog = "Pwr = 0";
                LogEvent(toLog);
            }

            // We now have the desired power level
            // Update the controller with the new power setting only if it changed from last time
            // The user may have overridden us by turning the heater off or changing the power
            // In that case, UserChangedHeaterPower = true

            if ((CalculatedPowerSetting != $("#Heater_Power_Slider").slider("option", "value"))) {
                TurnHeaterOn(CalculatedPowerSetting);
                $("#Heater_Power_Slider").slider("value", CalculatedPowerSetting);
            } else {
                CalculatedPowerSetting = $("#Heater_Power_Slider").slider("option", "value");
            }

            if (SetPoint > 0) {
                document.getElementById("Target_Temperature_Select").value = SetPoint;
            }

            if (CurrentStepNumber > 0) {
                SaveSnapshotFile();
            }
        } else {
            // In this case, the user changed the heater power. We want them to now control for remainder of step

        }


    }

    //---------------------- End Brew Session -------------------------------
    //------------------------------------------------------------------------

    //----------------------- Charts & Graph -------------------------------
    //----------------------------------------------------------------------

    /*
     * The InitializeChart function is used to create a blank Temperature chart and initialize values.
     */
    function InitializeChart(Y_Axis_MinMax_Array) {

        //dps = [];
        dps_F = [];
        dps_C = [];

        if (Y_Axis_MinMax_Array[Y_Axis_Index][4] == "F") {
            Main_Chart = new Chart(document.getElementById("Temperature_Chart"), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        data: dps_F,
                        showLine: true,
                        //pointBackgroundColor: 'white',
                        borderColor: 'white',
                        pointRadius: 0
                    }]
                },
                options: {
                    title: {
                        fontSize: 24,
                        display: true,
                        text: Y_Axis_MinMax_Array[Y_Axis_Index][0] + " over Time",
                        fontColor: 'white'
                    },
                    layout: {
                        padding: {
                            right: 25
                        }
                    },
                    legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [{
                            type: 'linear',
                            scaleLabel: {
                                display: true,
                                labelString: 'Minutes',
                                fontSize: 16,
                                fontColor: 'white'
                            },
                            gridLines: {
                                display: true,
                                tickMarkLength: 5,
                                zeroLineColor: 'white'
                            },
                            ticks: {
                                beginAtZero: true,
                                fontColor: 'white'
                            }
                        }],
                        yAxes: [{
                            type: 'linear',
                            scaleLabel: {
                                display: true,
                                labelString: Y_Axis_MinMax_Array[Y_Axis_Index][0],
                                fontSize: 16,
                                fontColor: 'white'
                            },
                            gridLines: {
                                display: true,
                                zeroLineColor: 'white',
                                tickMarkLength: 5
                            },
                            ticks: {
                                min: Y_Axis_MinMax_Array[Y_Axis_Index][1],
                                max: Y_Axis_MinMax_Array[Y_Axis_Index][2],
                                stepSize: Y_Axis_MinMax_Array[Y_Axis_Index][3],
                                fontColor: 'white'
                            }
                        }]
                    },
                    maintainAspectRatio: false
                }
            });
        } else {
            Main_Chart = new Chart(document.getElementById("Temperature_Chart"), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        data: dps_C,
                        showLine: true,
                        //pointBackgroundColor: 'white',
                        borderColor: 'white',
                        pointRadius: 0
                    }]
                },
                options: {
                    title: {
                        fontSize: 24,
                        display: true,
                        text: Y_Axis_MinMax_Array[Y_Axis_Index][0] + " over Time",
                        fontColor: 'white'
                    },
                    layout: {
                        padding: {
                            right: 25
                        }
                    },
                    legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [{
                            type: 'linear',
                            scaleLabel: {
                                display: true,
                                labelString: 'Minutes',
                                fontSize: 16,
                                fontColor: 'white'
                            },
                            gridLines: {
                                display: true,
                                tickMarkLength: 5,
                                zeroLineColor: 'white'
                            },
                            ticks: {
                                beginAtZero: true,
                                fontColor: 'white'
                            }
                        }],
                        yAxes: [{
                            type: 'linear',
                            scaleLabel: {
                                display: true,
                                labelString: Y_Axis_MinMax_Array[Y_Axis_Index][0],
                                fontSize: 16,
                                fontColor: 'white'
                            },
                            gridLines: {
                                display: true,
                                zeroLineColor: 'white',
                                tickMarkLength: 5
                            },
                            ticks: {
                                min: Y_Axis_MinMax_Array[Y_Axis_Index][1],
                                max: Y_Axis_MinMax_Array[Y_Axis_Index][2],
                                stepSize: Y_Axis_MinMax_Array[Y_Axis_Index][3],
                                fontColor: 'white'
                            }
                        }]
                    },
                    maintainAspectRatio: false
                }
            });
        }
    }

    /*
     * The InitializeTemperatureGauge_F function is used to create a new Temp Gauge with settings that
     * correlate to a App session using F as its temperature unit value.
     */
    function InitializeTemperatureGauge_F() {
        Temperature_Gauge = new RadialGauge({
            renderTo: document.getElementById("Temperature_Canvas"),
            width: 220,
            height: 220,
            startAngle: 45,
            ticksAngle: 270,
            minValue: 50,
            maxValue: 225,
            title: '°' + Default_Temperature_Units,
            colorTitle: 'white',
            units: 'Setpoint',
            majorTicks: [
                '50', '75', '100', '125', '150', '175', '200', '225'
            ],
            minorTicks: 5,
            highlights: [
                { from: 50, to: 220, color: 'black' }
            ],
            colorPlate: '#000000',
            colorBorderOuter: '#000000',
            colorBorderMiddle: '#000000',
            colorBorderInner: '#000000',
            colorBorderOuterEnd: '#000000',
            colorBorderMiddleEnd: '#000000',
            colorBorderInnerEnd: '#000000',
            colorBorderShadow: '#000000',
            colorMajorTicks: 'red',
            colorMinorTicks: 'white',
            colorUnits: 'white',
            colorNumbers: 'white',
            colorNeedleStart: 'white',
            colorNeedleEnd: 'white',
            valueBox: true,
            value: 50,
            valueText: '-'
        });

        Temperature_Gauge.draw();
    }

    /*
     * The InitializeTemperatureGauge_C function is used to create a new Temp Gauge with settings that
     * correlate to a App session using C as its temperature unit value.
     */
    function InitializeTemperatureGauge_C() {
        Temperature_Gauge = new RadialGauge({
            renderTo: document.getElementById("Temperature_Canvas"),
            width: 220,
            height: 220,
            startAngle: 45,
            ticksAngle: 270,
            minValue: 10,
            maxValue: 110,
            title: '°' + Default_Temperature_Units,
            colorTitle: 'white',
            units: 'Setpoint',
            majorTicks: [
                '10', '20', '30', '40', '50', '60', '70', '80', '90', '100', '110'
            ],
            minorTicks: 2,
            highlights: [
                { from: 10, to: 110, color: 'black' }
            ],
            colorPlate: '#000000',
            colorBorderOuter: '#000000',
            colorBorderMiddle: '#000000',
            colorBorderInner: '#000000',
            colorBorderOuterEnd: '#000000',
            colorBorderMiddleEnd: '#000000',
            colorBorderInnerEnd: '#000000',
            colorBorderShadow: '#000000',
            colorMajorTicks: 'red',
            colorMinorTicks: 'white',
            colorUnits: 'white',
            colorNumbers: 'white',
            colorNeedleStart: 'white',
            colorNeedleEnd: 'white',
            valueBox: true,
            value: 10,
            valueText: '-'
        });

        Temperature_Gauge.draw();
    }

    /*
     * The UpdateChart function is used to add points onto the temperature graph during application runtime.
     */
    function UpdateChart() {

        var yVar_F = 0;
        var lastTime_F = 0;
        var curLength_F = dps_F.length;

        yVar_F = Current_F;

        if (curLength_F > 0) {
            lastTime_F = dps_F[curLength_F - 1].x;
            dps_F.push({
                x: lastTime_F + (BrewingIntervalTimeArray[BrewingIntervalTimeIndex] / 60),
                y: yVar_F
            });
        } else {
            lastTime_F = 0;

            dps_F.push({
                x: 0,
                y: yVar_F
            });
        }

        var yVar_C = 0;
        var lastTime_C = 0;
        var curLength_C = dps_C.length;

        yVar_C = Current_C

        if (curLength_C > 0) {
            lastTime_C = dps_C[curLength_F - 1].x;
            dps_C.push({
                x: lastTime_C + (BrewingIntervalTimeArray[BrewingIntervalTimeIndex] / 60),
                y: yVar_C
            });
        } else {
            lastTime_C = 0;

            dps_C.push({
                x: 0,
                y: yVar_C
            });
        }

        Main_Chart.update();

    }

    //--------------------- End Charts & Graph -----------------------------
    //----------------------------------------------------------------------

    // ----------------- AJAX Handlers ----------------------
    // ------------------------------------------------------

    // Ajax handler for all outgoing calls to BBC
    function SendToBrewBossController(pathUrl, bodyData, successCallback) {

        // Disable timer that controls the Heartbeat requests
        // We can only have 1 request go to the bbc at once, so that is the
        // other possible source aside from handler functions
        GetHeaterbeatFlag = false;

        // Problem: What if we are here due to a heartbeat?
        // Soln idea: Use a seperate ajax caller for heartbeat?

        $.ajax({
            type: 'post',
            url: pathUrl,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: bodyData,
            success: successCallback
        });

        // Enable the timer that controls the Heartbeat requests
        GetHeaterbeatFlag = true;
    }

    // Ajax handler for all outgoing calls to BBC with a onComplete function callback
    function SendToBrewBossController_WithComplete(pathUrl, bodyData, successCallback, completeCallback) {

        // Disable timer that controls the Heartbeat requests
        // We can only have 1 request go to the bbc at once, so that is the
        // other possible source aside from handler functions
        GetHeaterbeatFlag = false;

        // Problem: What if we are here due to a heartbeat?
        // Soln idea: Use a seperate ajax caller for heartbeat?

        $.ajax({
            type: 'post',
            url: pathUrl,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: bodyData,
            success: successCallback,
            complete: completeCallback
        });

        // Enable the timer that controls the Heartbeat requests
        GetHeaterbeatFlag = true;
    }

    // Ajax handler for all outgoing calls to HBC
    function SendToHopsBossController(pathUrl, bodyData, successCallback) {

        // Disable timer that controls the Heartbeat requests
        // We can only have 1 request go to the bbc at once, so that is the
        // other possible source aside from handler functions
        GetHeaterbeatFlag = false;

        // Problem: What if we are here due to a heartbeat?
        // Soln idea: Use a seperate ajax caller for heartbeat?

        $.ajax({
            type: 'post',
            url: pathUrl,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: bodyData,
            success: successCallback //ParseControllerResponse
        });

        // Enable the timer that controls the Heartbeat requests
        GetHeaterbeatFlag = true;
    }

    //--------------- BrewBoss HTTP Request Handlers ------------------------------
    // ----------------------------------------------------------------------------

    function SoundAlarm() {

        $ALARM.play();

        var url = "/soundalarm";
        var successCallback = VoidResponseHandler;

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        toLog = "Called SoundAlarm";
        // LogEvent(toLog);

    }

    function GetHeartbeat() {
        var url = "/getheartbeat";
        var successCallback = ParseHeartbeatResponse;
        var timeSent = new Date().getTime();

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY,
            Time_Sent: timeSent
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

    }

    function RestoreDefaultSettings() {
        var url = "/restoredefaultsettings";
        var successCallback = ParseSettingsResponse;
        var completeCallback = SaveSettings;

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController_WithComplete(url, messageBodyString, successCallback, completeCallback);

        toLog = "Resetting Settings to Default Values";
        LogEvent(toLog);
    }

    function SaveSettings() {
        var url = "/savesettings";
        var successCallback = AlertScreenResponseHandler;

        // Need to determine which string to save for Default
        //var Default_Select = document.getElementById("Default_BrewSteps_Select");
        //var New_Default_Step_FileName = Default_Select.value;
        var New_Default_Step_FileName = document.getElementById("DefaultStepFile").value;
        document.getElementById("DefaultStepFile").innerHTML = New_Default_Step_FileName;

        // Need to determine which Temperature Units to save
        var TempUnits = "";
        if (document.getElementById('Temp_F_Radio').checked) {
            TempUnits = "F";
        } else if (document.getElementById('Temp_C_Radio').checked) {
            TempUnits = "C";
        }

        //Default_Voice_Name = document.getElementById("Voice_Select").selectedOptions[0].getAttribute('data-name');
        Default_Voice_Name = "Samantha";

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY,
            Default_Steps: New_Default_Step_FileName,
            Temp_Units: TempUnits,
            Heater_Watts: document.getElementById("Heater_Watts").value,
            CPKWH: document.getElementById("CPKWH").value,
            Enable_AccuFill: document.getElementById("AccuFill_Enabled").checked,
            AFIFV: document.getElementById("Accufill_Initial_Fill_Volume").value,
            Enable_HBC: document.getElementById("Enable_HBC").checked,
            HBMSCC: document.getElementById("HBMSCC").value,
            MaximumHeaterPower: document.getElementById("MaximumHeaterPower").value,
            BoilDetectTime: document.getElementById("BoilDetectTime").value,
            PwrS: document.getElementById("PwrS").value,
            PwrL: document.getElementById("PwrL").value,
            PwrM: document.getElementById("PwrM").value,
            PwrB: document.getElementById("PwrB").value,
            DeltaT1: document.getElementById("DeltaT1").value,
            DeltaT2: document.getElementById("DeltaT2").value,
            BGD_Color: "#000000",
            //BGD_Color: document.getElementById("Background_Color").value,
            BP_Color: document.getElementById("Border_Primary_Color").value,
            BS_Color: document.getElementById("Border_Secondary_Color").value,
            TP_Color: document.getElementById("Text_Primary_Color").value,
            TS_Color: document.getElementById("Text_Secondary_Color").value,
            TT_Color: document.getElementById("Text_Tertiary_Color").value,
            GAP_Color: document.getElementById("Graph_Axis_Primary_Color").value,
            GAS_Color: document.getElementById("Graph_Axis_Secondary_Color").value,
            GTP_Color: document.getElementById("Graph_Text_Primary_Color").value,
            GTS_Color: document.getElementById("Graph_Text_Secondary_Color").value,
            GTT_Color: document.getElementById("Graph_Text_Tertiary_Color").value,
            Speak_Rate: $("#Voice_Rate_Slider").slider("option", "value"),
            Speak_Pitch: $("#Voice_Pitch_Slider").slider("option", "value"),
            Speak_Voice: Default_Voice_Name,
            Update_Interval: document.getElementById("Update_Interval_Select").value
                //Send_Data: document.getElementById("Data_Sharing_Checkbox").checked,
                //User_Email: document.getElementById("UserEmail").value
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        toLog = "User Saved Settings";
        LogEvent(toLog);
        LogSettings();
    }

    function GetSettings() {
        var url = "/getsettings";
        var successCallback = ParseSettingsResponse;
        var completeCallback = CheckForSnapshotFile;

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController_WithComplete(url, messageBodyString, successCallback, completeCallback);

        toLog = "Called GetSettings";
        // LogEvent(toLog);
    }

    function SaveBrewSteps(type, fileName) {

        var url = "/savebrewstepsfile";
        var successCallback = AlertScreenResponseHandler;

        var numSteps = $("#Brewing_Steps_Table tbody tr.removeRow").length;
        var $_table = document.getElementById("Brewing_Steps_Table");
        var rows = $_table.getElementsByClassName("removeRow");

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY,
            SaveType: type,
            FileName: fileName,
            NumberSteps: numSteps,
            UOM: CurrentFileUOM,
            Steps: []
        };

        // Dynamically generate the Steps array given current table
        for (var i = 0; i < rows.length; i++) {
            // cols is going to be a collection of 10 relevant data pieces + 2 irrelevant
            var cols = rows[i].getElementsByTagName('td');

            // Generate a JS Object represeting the current step
            var newStepJSObj = {
                STy: cols[0].getElementsByTagName('select')[0].value,
                P: cols[1].innerHTML,
                SP: cols[2].getElementsByTagName('select')[0].value,
                STi: cols[3].getElementsByTagName('select')[0].value,
                FV: cols[4].innerHTML,
                HPos: cols[5].getElementsByTagName('select')[0].value,
                BF: cols[6].getElementsByTagName('input')[0].checked,
                PF: cols[7].getElementsByTagName('input')[0].checked,
                S: cols[8].getElementsByTagName('input')[0].checked,
                AF: cols[9].getElementsByTagName('input')[0].checked
            }

            messageBodyJSObj.Steps[i] = newStepJSObj;

        }

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        toLog = "Called SaveBrewSteps with file " + fileName;
        // LogEvent(toLog);
    }

    function GetBrewSteps(fileName) {
        var url = "/getbrewstepsfile";
        var successCallback = ParseBrewStepsResponse;

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY,
            FileName: fileName
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        toLog = "Called GetBrewSteps for file " + fileName;
        LogEvent(toLog);
    }

    function GetBrewSteps_WithComplete(fileName) {
        var url = "/getbrewstepsfile";
        var successCallback = ParseBrewStepsResponse;
        var completeCallback = StartSnapshotSession;


        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY,
            FileName: fileName
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController_WithComplete(url, messageBodyString, successCallback, completeCallback);

        toLog = "Called GetBrewSteps for file " + fileName;
        LogEvent(toLog);
    }

    function DeleteStepsFile(fileName) {
        var url = "/deletebrewstepsfile";
        var successCallback = AlertScreenResponseHandler;

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY,
            FileName: fileName
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        toLog = "Called DeleteStepsFile with file " + fileName;
        LogEvent(toLog);
    }

    function GetStepsList() {
        var url = "/getbrewstepsfilelist";
        var successCallback = ParseBrewStepsListResponse;

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        toLog = "Called GetStepsList";
        LogEvent(toLog);
    }

    //-------------- Pump --------------
    //----------------------------------

    function TurnPumpOn() {
        var url = "/setpumpstatus";
        var successCallback = VoidResponseHandler;

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY,
            Pump_Status: 1
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        toLog = "Turned Pump On";
        LogEvent(toLog);

    }

    function TurnPumpOff() {
        var url = "/setpumpstatus";
        var successCallback = VoidResponseHandler;

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY,
            Pump_Status: 0
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        toLog = "Turned Pump Off";
        LogEvent(toLog);

    }
    //----------------------- End Pump ----------------------
    //-------------------------------------------------------

    //-------------------------- Heater ----------------------------
    //--------------------------------------------------------------

    function TurnHeaterOn(power) {
        Heater_Indicator = 1;
        $("#Heater_Power_Slider").slider("value", power);

        toLog = "Turned Heater On";
        LogEvent(toLog);
    }

    function TurnHeaterOff() {
        Heater_Indicator = 0;
        $("#Heater_Power_Slider").slider("value", 0);
        document.getElementById("Heater_Switch_Checkbox").checked = false;

        toLog = "Turned Heater Off";
        LogEvent(toLog);
    }

    function PostHeaterPowerLevel() {
        var url = "/setheaterpowerlevel";
        var power_level = $("#Heater_Power_Slider").slider("option", "value");

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY,
            Power_Level: power_level
        };
        var successCallback = VoidResponseHandler;

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        toLog = "Heater status changed";
        LogEvent(toLog);
    }

    //------------------------ End Heater --------------------------
    //--------------------------------------------------------------

    //-------------- Snapshot ------------
    //------------------------------------

    function CheckForSnapshotFile() {
        var url = "/checkforsnapshotfile";
        var successCallback = ParseCheckSnapshotResponse;

        var messageBodyJSObj = {
            Identity: IDENTITY
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        toLog = "Checking for Snapshot file";
        // LogEvent(toLog);
    }

    function SaveSnapshotFile() {
        var url = "/savesnapshotfile";
        var successCallback = VoidResponseHandler;

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY,
            StepFileName: Current_BrewSteps_FileName,
            CurrentStepNumber: CurrentStepNumber,
            SavedSetpoint: SavedSetpoint,
            MaintainTemperatureTimerEnabled: MaintainTemperatureTimerEnabled,
            TimerExpireTime: TimerExpireTime,
            ManualTimerEnabled: ManualTimerEnabled,
            ManualTimerExpireTime: ManualTimerExpireTime,
            BrewingStartTime: BrewingStartTime,
            CumulativeKWH: CumulativeKWH,
            HoldingBoil: HoldingBoil,
            BoilTemp: BoilTemp
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        RestoringSession = false;

        toLog = "Saving snapshot file";
        // LogEvent(toLog);
    }

    function GetSnapshotFile() {
        var url = "/getsnapshotfile";
        var successCallback = ParseGetSnapshotResponse;

        var messageBodyJSObj = {
            Identity: IDENTITY
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        toLog = "Retrieving snapshot file";
        // LogEvent(toLog);
    }

    function DeleteSnapshotFile() {
        var url = "/deletesnapshotfile";
        var successCallback = VoidResponseHandler;

        var messageBodyJSObj = {
            Identity: IDENTITY
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        toLog = "Deleting snapshot file";
        // LogEvent(toLog);
    }

    function StartSnapshotSession() {
        LockInBrewSteps();

        document.getElementById("Step_To_Start_Select").value = CurrentStepNumber.toString();
        //document.getElementById("Elapsed_Brew_Time_Span").innerHTML = "0 s";
        CurrentlyBrewing = true;
        Graphing_Flag = true;
        UserChangedHeaterPower = false;
        //$("#button_w2").hide("fast");
        $("#button_w3").hide("fast");
        $("#New_Graph_Button").hide("fast");
        $("#StepToStartDiv").hide("fast");
        $("#Stop_Brewing_Button").show("fast");
        $("#CurrentStepNumberDiv").show("fast");
    }

    //------------ End Snapshot ----------
    //------------------------------------

    //------------ Logging -------------
    //----------------------------------

    function SendInitialInformationLog() {
        var url = "/initialsessionlog";
        var successCallback = InitialInformationLogAcknowledger();

        // Need to determine which string to save for Default
        var New_Default_Step_FileName = document.getElementById("DefaultStepFile").value;
        // Need to determine which Temperature Units to save
        var TempUnits = "";
        if (document.getElementById('Temp_F_Radio').checked) {
            TempUnits = "F";
        } else if (document.getElementById('Temp_C_Radio').checked) {
            TempUnits = "C";
        }
        // Generate a JS Object representing the JSON request
        var SettingsJSObj = {
            Default_Steps: New_Default_Step_FileName,
            Temp_Units: TempUnits,
            Heater_Watts: document.getElementById("Heater_Watts").value,
            CPKWH: document.getElementById("CPKWH").value,
            Enable_HBC: document.getElementById("Enable_HBC").checked,
            HBMSCC: document.getElementById("HBMSCC").value,
            MaximumHeaterPower: document.getElementById("MaximumHeaterPower").value,
            BoilDetectTime: document.getElementById("BoilDetectTime").value,
            PwrS: document.getElementById("PwrS").value,
            PwrL: document.getElementById("PwrL").value,
            PwrM: document.getElementById("PwrM").value,
            PwrB: document.getElementById("PwrB").value,
            DeltaT1: document.getElementById("DeltaT1").value,
            DeltaT2: document.getElementById("DeltaT2").value,
            BGD_Color: "#000000",
            BP_Color: document.getElementById("Border_Primary_Color").value,
            BS_Color: document.getElementById("Border_Secondary_Color").value,
            TP_Color: document.getElementById("Text_Primary_Color").value,
            TS_Color: document.getElementById("Text_Secondary_Color").value,
            TT_Color: document.getElementById("Text_Tertiary_Color").value,
            GAP_Color: document.getElementById("Graph_Axis_Primary_Color").value,
            GAS_Color: document.getElementById("Graph_Axis_Secondary_Color").value,
            GTP_Color: document.getElementById("Graph_Text_Primary_Color").value,
            GTS_Color: document.getElementById("Graph_Text_Secondary_Color").value,
            GTT_Color: document.getElementById("Graph_Text_Tertiary_Color").value,
            Speak_Rate: $("#Voice_Rate_Slider").slider("option", "value"),
            Speak_Pitch: $("#Voice_Pitch_Slider").slider("option", "value"),
            //Speak_Voice: document.getElementById("Voice_Select").selectedOptions[0].getAttribute('data-name'),
            Update_Interval: document.getElementById("Update_Interval_Select").value,
            //Send_Data: document.getElementById("Data_Sharing_Checkbox").checked,
            //User_Email: document.getElementById("UserEmail").value
        };

        var numSteps = $("#Brewing_Steps_Table tbody tr.removeRow").length;
        var fileName = document.getElementById("")
        var $_table = document.getElementById("Brewing_Steps_Table");
        var rows = $_table.getElementsByClassName("removeRow");
        // Generate a JS Object representing the JSON request
        var InitialStepFileJSObj = {
            FileName: New_Default_Step_FileName,
            NumberSteps: numSteps,
            UOM: CurrentFileUOM,
            Steps: []
        };
        // Dynamically generate the Steps array given current table
        for (var i = 0; i < rows.length; i++) {
            // cols is going to be a collection of 10 relevant data pieces + 2 irrelevant
            var cols = rows[i].getElementsByTagName('td');
            // Generate a JS Object represeting the current step
            var newStepJSObj = {
                STy: cols[0].getElementsByTagName('select')[0].value,
                P: cols[1].innerHTML,
                SP: cols[2].getElementsByTagName('select')[0].value,
                STi: cols[3].getElementsByTagName('select')[0].value,
                FV: cols[4].innerHTML,
                HPos: cols[5].getElementsByTagName('select')[0].value,
                BF: cols[6].getElementsByTagName('input')[0].checked,
                PF: cols[7].getElementsByTagName('input')[0].checked,
                S: cols[8].getElementsByTagName('input')[0].checked,
                AF: cols[9].getElementsByTagName('input')[0].checked
            }
            InitialStepFileJSObj.Steps[i] = newStepJSObj;
        }

        var curDate = new Date();
        var Timestamp = String(curDate.getMonth()) + String(curDate.getDate()) + String(curDate.getFullYear()); //+ "-" + String(curDate.getHours()) + String(curDate.getMinutes()) + String(curDate.getSeconds());

        var messageBodyJSObj = {
            Version: VERSION,
            Identity: IDENTITY,
            Timestamp: Timestamp,
            Settings: SettingsJSObj,
            BrewSteps: InitialStepFileJSObj
        }

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        toLog = "Called SendInitialSessionLog";
        // LogEvent(toLog);

    }

    function SendLogEntry(logMessage) {
        var url = "/postsessionlog";
        var successCallback = RoutineLoggingResponseHandler;

        var curTime = new Date();

        var curDate = curTime.getDate();
        var curMonth = curTime.getMonth();
        var curYear = curTime.getFullYear();

        var FormattedTime = String(curMonth) + "" + String(curDate) + "" + String(curYear);

        var curLine = logMessage.Timestamp + logMessage.Message;
        var runningLogString = IDENTITY + ": " + curLine + "\r\n";

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY,
            Timestamp: FormattedTime,
            LogString: runningLogString
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);
    }

    function SendLogFile(logMessageArray) {
        var url = "/postsessionlog";
        var successCallback = RoutineLoggingResponseHandler;
        var numMessages = logMessageArray.length;

        var curTime = new Date();

        var curDate = curTime.getDate();
        var curMonth = curTime.getMonth();
        var curYear = curTime.getFullYear();

        var FormattedTime = String(curMonth) + "" + String(curDate) + "" + String(curYear);

        var runningLogString = "";

        // Need to craft the log string here
        for (var i = 0; i < logMessageArray.length; i++) {
            var curObject = logMessageArray[i];
            var curLine = curObject.Timestamp + curObject.Message;
            runningLogString += IDENTITY + ": " + curLine + "\r\n";
        }

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY,
            Timestamp: FormattedTime,
            LogString: runningLogString
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);
    }

    //---------- End Logging -----------
    //----------------------------------

    //----------- Misc. Controllers --------
    //--------------------------------------

    function PostFillVolToAccuFill(gallons) {
        var url = "/fillvolumeaccufill";

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY,
            Gallons: gallons
        };
        var successCallback = VoidResponseHandler;

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        toLog = "Posting fill volume to accufill: " + gallons + " gallons";
        LogEvent(toLog);
    }

    // This one is a little more tricky - requires Hops Boss controller
    function MoveHopsFeederPosition(position) {
        var url = "/movehopsfeederposition";
        var successCallback = HopsFeederPositionChangeHandler;

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY,
            Position: position
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Set program control variables
        SendToHopsBoss05ACK = true;
        LastHopsPositionSentToHopsBoss = position;
        HopsBossMoveToPositionSendTime = new Date().getTime();

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        toLog = "Changing HopsFeeder Position: " + position;
        LogEvent(toLog);
    }

    //------------- End BrewBoss HTTP Request Handlers ------------------
    //-------------------------------------------------------------------

    // ---------- Callback Handler Functions ------------
    // --------------------------------------------------

    function VoidResponseHandler(responseText) {}

    function InitialInformationLogAcknowledger() {
        InitialLogSent = true;
    }

    function AlertScreenResponseHandler(responseText) {
        //alert("Response: " + responseText.ResponseMessage);
        document.getElementById("AlertMessageBoxText").innerHTML = "Response: " + responseText.ResponseMessage;
        $("#AlertMessageBox").dialog("open");
    }

    function ParseHeartbeatResponse(responseText) {

        // Log the Heartbeat
        var logString = "";

        var KettleTempF = responseText.KettleTempF;
        var KettleTempC = (((KettleTempF - 32) * 5) / 9);
        Current_F = KettleTempF;
        Current_C = KettleTempC;

        var PumpStatus = responseText.PumpStatus;

        var ProVersion = responseText.ProVersion;
        if (ProVersion == 1) {
            document.getElementById("BrewBossLogo").src = "media/BBPLogo.jpg";
            Pro_Version = true;
            if (document.getElementById("HBMSCC").value == 0) {
                document.getElementById("HBMSCC").value = 7.5;
            }
            logString += "1_";
        } else if (ProVersion == 0) {
            document.getElementById("BrewBossLogo").src = "BBLogo.jpg";
            Pro_Version = false;
            if (document.getElementById("HBMSCC").value == 0) {
                document.getElementById("HBMSCC").value = 1.5;
            }
            logString += "0_";
        }

        if (document.getElementById("Temp_F_Radio").checked) {
            CurrentTemperature = Number(KettleTempF.toFixed(0));
            logString += "F";
            logString += CurrentTemperature + "_";
        } else {
            CurrentTemperature = Number(KettleTempC.toFixed(0));
            logString += "C";
            logString += CurrentTemperature + "_";
        }

        if (PumpStatus == true) {
            if (document.getElementById("Pump_Switch_Checkbox").checked == false) {
                document.getElementById("Pump_Switch_Checkbox").checked = true
            }
            logString += "T_";
        } else if (PumpStatus == false) {
            if (document.getElementById("Pump_Switch_Checkbox").checked == true) {
                document.getElementById("Pump_Switch_Checkbox").checked = false
            }
            logString += "F_";
        }

        var HeaterPower = responseText.HeaterPower;
        if (HeaterPower == $("#Heater_Power_Slider").slider("option", "value")) {
            // Do nothing, the heater power has not changed at all
        } else {
            //$("#Heater_Power_Slider").slider("value", HeaterPower);
            //UserChangedHeaterPower = true;
        }
        logString += HeaterPower + "_";

        HopsBossConnected = responseText.HopsBossConnected;
        AccuFillConnected = responseText.AccuFillConnected;
        if (HopsBossConnected == true) {
            var HopsBossPosition = responseText.HopsBossPosition;
            document.getElementById("HopsBossPosition").innerHTML = HopsBossPosition;
            document.getElementById("HopsBossCurrentPosition").innerHTML = HopsBossPosition;
            $("#None_Accessory_List").hide("fast");
            $("#AccuFill_Accessory_List").hide("fast");
            $("#Hops_Boss_Accessory_List").show("fast");

            logString += "HB_" + HopsBossPosition;

        } else if (AccuFillConnected == true) {
            var AccuFillCalibrationValue = responseText.AccuFillCalibrationValue;

            // In Gallons * 10 always from accufill
            var GallonsFilled = (Number(responseText.GallonsFilled) / 10);
            var DesiredFillVolume = (Number(responseText.DesiredFillVolume) / 10);
            AccuFillFilling = responseText.AccuFillFilling;

            if (document.getElementById("Temp_C_Radio").checked) {
                GallonsFilled = GallonsFilled * 3.78541;
                DesiredFillVolume = DesiredFillVolume * 3.78541;
            }

            document.getElementById("AccuFillCalibrationValue").innerHTML = AccuFillCalibrationValue;
            document.getElementById("AccuFillDesiredFillVolumeValue").innerHTML = DesiredFillVolume;
            document.getElementById("AccuFillVolumeFilledValue").innerHTML = GallonsFilled;

            logString += "AF_";

            if (AccuFillFilling == 1) {
                document.getElementById("AccuFillStatusValue").innerHTML = "Filling";
                var PercentFilled = (Number(GallonsFilled) / Number(DesiredFillVolume));
                document.getElementById("AccuFillFillPercentage").innerHTML = PercentFilled.toFixed(0) + "%";
                $("#AccuFillProgressBar").progressbar({
                    max: DesiredFillVolume,
                    value: GallonsFilled
                });

                logString += "F_" + (Number(GallonsFilled));
                logString += "_" + (Number(DesiredFillVolume));
            } else {
                document.getElementById("AccuFillStatusValue").innerHTML = "Connected";
                //document.getElementById("AccuFillDesiredFillVolumeValue").innerHTML = "0.00";
                document.getElementById("AccuFillFillPercentage").innerHTML = "0%";
                $("#AccuFillProgressBar").progressbar({
                    max: 1,
                    value: 0
                });

                logString += "C";

            }
            $("#None_Accessory_List").hide("fast");
            $("#Hops_Boss_Accessory_List").hide("fast");
            $("#AccuFill_Accessory_List").show("fast");

        } else {
            $("#AccuFill_Accessory_List").hide("fast");
            $("#Hops_Boss_Accessory_List").hide("fast");
            $("#None_Accessory_List").show("fast");

            logString += "NA";
        }

        LogEvent(logString);

    }

    function ParseCheckSnapshotResponse(responseText) {
        if (responseText.Exists == 1) { // Snapshot exists => Session got interrupted
            if (confirm("Looks like your last brew session got interrupted.\nWould you like to continue brewing?")) {
                GetSnapshotFile();
            } else { // Snapshot existed, but user chose to reset the session
                DeleteSnapshotFile();
                GetBrewSteps(document.getElementById("DefaultStepFile").value);
                //SendInitialInformationLog();
            }
        } else { // Snapshot did not exist, proceed with normal setup
            GetBrewSteps(document.getElementById("DefaultStepFile").value);
            //SendInitialInformationLog();
        }
    }

    function ParseGetSnapshotResponse(responseText) {
        var snapshot_PreviousFile = responseText.StepFileName;
        var snapshot_CurrentStepNumber = responseText.CurrentStepNumber;
        var snapshot_SavedSetpoint = responseText.SavedSetpoint;

        var snapshot_MaintainTemperatureTimerEnabled = responseText.MaintainTemperatureTimerEnabled;
        var snapshot_TimerExpireTime = responseText.TimerExpireTime;
        var snapshot_ManualTimerEnabled = responseText.ManualTimerEnabled;
        var snapshot_ManualTimerExpireTime = responseText.ManualTimerExpireTime;

        var snapshot_BrewingStartTime = responseText.BrewingStartTime;
        var snapshot_CumulativeKWH = responseText.CumulativeKWH;
        var snapshot_HoldingBoil = responseText.HoldingBoil;
        var snapshot_BoilTemp = responseText.BoilTemp;

        SavedSetpoint = snapshot_SavedSetpoint;
        Setpoint = SavedSetpoint;
        document.getElementById("Target_Temperature_Select").value = Setpoint;
        Temperature_Gauge.update({
            valueText: '°' + Default_Temperature_Units
        });

        HoldingBoil = snapshot_HoldingBoil;
        BoilTemp = snapshot_BoilTemp

        if (snapshot_MaintainTemperatureTimerEnabled == true) {
            TimerExpireTime = snapshot_TimerExpireTime;
            MaintainTemperatureTimerEnabled = true;
            ManualTimerExpireTime = snapshot_ManualTimerExpireTime;
            ManualTimerEnabled = snapshot_ManualTimerEnabled;
        } else if (snapshot_ManualTimerEnabled == true) {
            TimerExpireTime = 0;
            MaintainTemperatureTimerEnabled = false;
            ManualTimerEnabled = true;
            ManualTimerExpireTime = snapshot_ManualTimerExpireTime;
        } else {
            TimerExpireTime = 0;
            MaintainTemperatureTimerEnabled = false;
            ManualTimerExpireTime = snapshot_ManualTimerExpireTime;
            ManualTimerEnabled = false;
        }

        CumulativeKWH = snapshot_CumulativeKWH
        document.getElementById("Total_KWH_Used_Span").innerHTML = CumulativeKWH.toFixed(2);

        var CostPerHour = Number(document.getElementById("CPKWH").value);
        var CumulativeCost = Number(CostPerHour * CumulativeKWH);
        document.getElementById("Total_Brewing_Cost_Span") = "$" + CumulativeCost.toFixed(2);

        BrewingStartTime = snapshot_BrewingStartTime;
        var curTime = new Date().getTime();
        var brewTimeSec = (Number(curTime - BrewingStartTime) / 1000);
        document.getElementById("Elapsed_Brew_Time_Span").innerHTML = brewTimeSec.toFixed(0) + " s";

        CurrentStepNumber = snapshot_CurrentStepNumber;
        document.getElementById("Step_To_Start_Select").value = CurrentStepNumber.toString();

        GetBrewSteps_WithComplete(snapshot_PreviousFile);
        //SendInitialInformationLog();

        //document.getElementById("Start_Graphing_Button").innerHTML = "Pause Graph";
        //$("#Start_Graphing_Button").css("class", "btn btn-warning");
        toLog = "Brew Session Started";
        LogEvent(toLog);

    }

    function HopsFeederPositionChangeHandler(responseText) {

        var position = responseText.Position;
        //document.getElementById("HopsBoss_Pos").innerHTML = " " + position;

        // TODO: handle the HB05ACK logic here?
    }

    /*
     * The ParseSettingsResponse function is used to parse a well-formed JSON string, sent
     * from the server, into a JSON object, and then populate the session settings
     */
    function ParseSettingsResponse(responseText) {

        var BrewSteps_FileName = responseText.Default_Steps;
        document.getElementById("DefaultStepFile").value = BrewSteps_FileName;
        document.getElementById("DefaultStepFile").innerHTML = BrewSteps_FileName;
        //document.getElementById("Default_BrewSteps_Select").value = BrewSteps_FileName;

        //document.getElementById("Default_Graph_Y_Axis_Select").value = responseText.Default_Variable;
        //Y_Axis_Index = document.getElementById("Default_Graph_Y_Axis_Select").value;
        Y_Axis_Index = 0;
        document.getElementById("Update_Interval_Select").value = responseText.Update_Interval;
        BrewingIntervalTimeIndex = document.getElementById("Update_Interval_Select").value;

        //document.getElementById("Graph_Y_Axis_Select").value = responseText.Default_Variable;

        Graphing_Counter = BrewingIntervalTimeArray[BrewingIntervalTimeIndex];

        var TempUnits = responseText.Temp_Units;
        if (TempUnits == "F") {
            Default_Temperature_Units = "F"
            document.getElementById('Temp_F_Radio').checked = true;
            InitializeChart(MinMaxArray_F);
            InitializeTemperatureGauge_F();
            PopulateTargetTemperatureSelect_F();
            BoilTemp = 220;
            document.getElementById("SetpointUnits").innerHTML = "(°F)";
            document.getElementById("FillVolUnits").innerHTML = "(G)";
        } else if (TempUnits == "C") {
            Default_Temperature_Units = "C";
            document.getElementById('Temp_C_Radio').checked = true;
            InitializeChart(MinMaxArray_C);
            InitializeTemperatureGauge_C();
            PopulateTargetTemperatureSelect_C();
            BoilTemp = 105;
            document.getElementById("SetpointUnits").innerHTML = "(°C)";
            document.getElementById("FillVolUnits").innerHTML = "(L)";
        }

        ChangeBackgroundColor(responseText.BGD_Color);
        ChangePrimaryBorderColor(responseText.BP_Color);
        ChangeSecondaryBorderColor(responseText.BS_Color);
        ChangePrimaryTextColor(responseText.TP_Color);
        ChangeSecondaryTextColor(responseText.TS_Color);
        ChangeTertiaryTextColor(responseText.TT_Color);
        ChangeGraphPrimaryBorderColor(responseText.GAP_Color);
        ChangeGraphSecondaryBorderColor(responseText.GAS_Color);
        ChangeGraphPrimaryTextColor(responseText.GTP_Color);
        ChangeGraphSecondaryTextColor(responseText.GTS_Color);
        ChangeGraphTertiaryTextColor(responseText.GTT_Color);

        document.getElementById("Current_Brew_Session_Container_Prompt_Window").innerHTML = "-";

        document.getElementById("Heater_Watts").value = responseText.Heater_Watts;
        document.getElementById("CPKWH").value = responseText.CPKWH;

        document.getElementById("MaximumHeaterPower").value = responseText.MaximumHeaterPower;
        document.getElementById("BoilDetectTime").value = responseText.BoilDetectTime;
        document.getElementById("PwrS").value = responseText.PwrS;
        document.getElementById("PwrL").value = responseText.PwrL;
        document.getElementById("PwrM").value = responseText.PwrM;
        document.getElementById("PwrB").value = responseText.PwrB;
        document.getElementById("DeltaT1").value = responseText.DeltaT1;
        document.getElementById("DeltaT2").value = responseText.DeltaT2;

        //document.getElementById("Background_Color").value = responseText.BGD_Color;
        document.getElementById("Border_Primary_Color").value = responseText.BP_Color;
        document.getElementById("Border_Secondary_Color").value = responseText.BS_Color;
        document.getElementById("Text_Primary_Color").value = responseText.TP_Color;
        document.getElementById("Text_Secondary_Color").value = responseText.TS_Color;
        document.getElementById("Text_Tertiary_Color").value = responseText.TT_Color;
        document.getElementById("Graph_Axis_Primary_Color").value = responseText.GAP_Color;
        document.getElementById("Graph_Axis_Secondary_Color").value = responseText.GAS_Color;
        document.getElementById("Graph_Text_Primary_Color").value = responseText.GTP_Color;
        document.getElementById("Graph_Text_Secondary_Color").value = responseText.GTS_Color;
        document.getElementById("Graph_Text_Tertiary_Color").value = responseText.GTT_Color;

        $("#Voice_Rate_Slider").slider("value", responseText.Speak_Rate);
        $("#Voice_Pitch_Slider").slider("value", responseText.Speak_Pitch);
        Default_Voice_Name = responseText.Speak_Voice;

        //document.getElementById("Data_Sharing_Checkbox").checked = responseText.Send_Data;
        //document.getElementById("UserEmail").value = responseText.User_Email;

        document.getElementById("AccuFill_Enabled").checked = responseText.Enable_AccuFill;
        if (responseText.AFIFV == 0) {
            document.getElementById("Accufill_Initial_Fill_Volume").value = 16;
        } else {
            document.getElementById("Accufill_Initial_Fill_Volume").value = responseText.AFIFV;
        }

        document.getElementById("Enable_HBC").checked = responseText.Enable_HBC;
        if (responseText.HBMSCC == 0) {
            if (Pro_Version == true) {
                document.getElementById("HBMSCC").value = 7.5;
            } else {
                document.getElementById("HBMSCC").value = 1.5;
            }
        } else {
            document.getElementById("HBMSCC").value = responseText.HBMSCC;
        }
    }

    /*
     * The ParseBrewStepsResponse function is responsible for parsing the response from
     * the request of a brew steps file. This function will create a new entry for
     * each step in the file, delete the old steps from the table, then put the newly
     * formed steps into the table.
     */
    function ParseBrewStepsResponse(responseText) {

        var fileName = responseText.FileName;
        Current_BrewSteps_FileName = fileName;
        document.getElementById("Current_Step_File").innerHTML = fileName;
        document.getElementById("DefaultStepFile").value = fileName;
        document.getElementById("DefaultStepFile").innerHTML = fileName;

        CurrentFileUOM = responseText.UOM;

        var numSteps = responseText.NumberSteps;
        var html = '';
        var html_StepToStart = '';

        for (var i = 0; i < numSteps; i++) {
            var curStep = responseText.Steps[i];
            html += '<tr class="removeRow">\r\n';
            html += '<td class="StepTypeSelectCell">\r\n';

            html += '<select class="StepTypeSelect">\r\n';
            html += '<option value="none_selected">-</option>\r\n';

            var curStepType = curStep.STy;

            if (curStepType == 1) {
                html += '<option value="1" selected="selected">1 – Prompt User with User Confirmation Required.</option>\r\n';
            } else {
                html += '<option value="1">1 – Prompt User with User Confirmation Required.</option>\r\n';
            }

            if (curStepType == 2) {
                html += '<option value="2" selected="selected">2 – Prompt User Without Confirmation</option>\r\n';
            } else {
                html += '<option value="2">2 – Prompt User Without Confirmation</option>\r\n';
            }

            if (curStepType == 3) {
                html += '<option value="3" selected="selected">3 – Heat Kettle to Specified Setpoint</option>\r\n';
            } else {
                html += '<option value="3">3 – Heat Kettle to Specified Setpoint</option>\r\n';
            }

            if (curStepType == 4) {
                html += '<option value="4" selected="selected">4 – Maintain Temperature for Specified Time</option>\r\n';
            } else {
                html += '<option value="4">4 – Maintain Temperature for Specified Time</option>\r\n';
            }

            if (curStepType == 5) {
                html += '<option value="5" selected="selected">5 – Cool Kettle to Specified Setpoint</option>\r\n';
            } else {
                html += '<option value="5">5 – Cool Kettle to Specified Setpoint</option>\r\n';
            }

            if (curStepType == 6) {
                html += '<option value="6" selected="selected">6 - Fill Kettle with AccuFill</option>\r\n';
            } else {
                html += '<option value="6">6 - Fill Kettle with AccuFill</option>\r\n';
            }

            html += '</select>\r\n';
            html += '</td>\r\n';

            html += '<td contenteditable="true">' + curStep.P + '</td>\r\n';

            //html += '<td contenteditable="true">' + curStep.SP + '</td>\r\n';
            var curStepSetpoint = Number(curStep.SP);
            html += '<td>\r\n';
            html += '<select class="StepSetpointSelect">\r\n';
            if (CurrentFileUOM == "F") {
                if (curStepSetpoint == 0) {
                    html += '<option value="0" selected="selected">0</option>\r\n';
                } else {
                    html += '<option value="0">0</option>\r\n';
                }
                for (var j = 32; j < 221; j++) {
                    if (curStepSetpoint == j) {
                        html += '<option value="' + j + '" selected="selected">' + j + '</option>\r\n';
                    } else {
                        html += '<option value="' + j + '">' + j + '</option>\r\n';
                    }
                }
            } else {
                for (var j = 0; j < 106; j++) {
                    if (curStepSetpoint == j) {
                        html += '<option value="' + j + '" selected="selected">' + j + '</option>\r\n';
                    } else {
                        html += '<option value="' + j + '">' + j + '</option>\r\n';
                    }
                }
            }
            html += '</select>\r\n';
            html += '</td>\r\n';

            //html += '<td contenteditable="true">' + curStep.STi + '</td>\r\n';
            html += '<td>\r\n';
            html += '<select class="StepTimerSelect">\r\n';
            var curStepTimer = curStep.STi;
            for (var j = 0; j < 181; j++) {
                if (curStepTimer == j) {
                    if (j == 0) {
                        html += '<option value="' + j + '" selected="selected">-</option>\r\n';
                    } else {
                        html += '<option value="' + j + '" selected="selected">' + j + '</option>\r\n';
                    }
                } else {
                    html += '<option value="' + j + '">' + j + '</option>\r\n';
                }
            }
            html += '</select>\r\n';
            html += '</td>\r\n';

            html += '<td contenteditable="true">' + curStep.FV + '</td>\r\n';

            html += '<td>\r\n';
            html += '<select class="HopsPosSelect">\r\n';
            html += '<option value="none_selected">-</option>\r\n';
            var curHopsPos = curStep.HPos;
            if (curHopsPos == 0) {
                html += '<option value="0" selected="selected">Home</option>\r\n';
            } else {
                html += '<option value="0">Home</option>\r\n';
            }
            for (var k = 1; k < 8; k++) {
                if (curHopsPos == k) {
                    html += '<option value="' + k + '" selected="selected">' + k + '</option>\r\n';
                } else {
                    html += '<option value="' + k + '">' + k + '</option>\r\n';
                }
            }
            html += '</select>\r\n';
            html += '</td>\r\n';

            if (curStep.BF == true) {
                html += '<td><input type="checkbox" name="BoilFlagCheckbox" class="BrewStepsCheckbox" checked /></td>\r\n';
            } else {
                html += '<td><input type="checkbox" name="BoilFlagCheckbox" class="BrewStepsCheckbox"/></td>\r\n';
            }

            if (curStep.PF == true) {
                html += '<td><input type="checkbox" name="PumpFlagCheckbox" class="BrewStepsCheckbox" checked /></td>\r\n';
            } else {
                html += '<td><input type="checkbox" name="PumpFlagCheckbox" class="BrewStepsCheckbox"/></td>\r\n';
            }

            if (curStep.S == true) {
                html += '<td><input type="checkbox" name="SpeakFlagCheckbox" class="BrewStepsCheckbox" checked /></td>\r\n';
            } else {
                html += '<td><input type="checkbox" name="SpeakFlagCheckbox" class="BrewStepsCheckbox"/></td>\r\n';
            }

            if (curStep.AF == true) {
                html += '<td><input type="checkbox" name="AlarmFlagCheckbox" class="BrewStepsCheckbox" checked /></td>\r\n';
            } else {
                html += '<td><input type="checkbox" name="AlarmFlagCheckbox" class="BrewStepsCheckbox"/></td>\r\n';
            }

            html += '<td class="IconDataCol_X"><span class="table-remove oi oi-x"></span></td>\r\n';
            html += '<td class="IconDataCol"><span class="table-up oi oi-arrow-thick-top"></span><span class="table-down oi oi-arrow-thick-bottom"></span></td>\r\n';

            html += '</tr>\r\n';

            html_StepToStart += '<option class="removeStep" value="';
            html_StepToStart += (i + 1);
            html_StepToStart += '">';
            html_StepToStart += (i + 1);
            html_StepToStart += '-';
            html_StepToStart += (curStep.P).substring(0, 23) + '</option>\r\n';
        }

        $('.removeRow').remove();
        $('#Brewing_Steps_Table tr:last').before(html);
        $("#Brewing_Steps_Table td").css('border-bottom', "1px solid " + document.getElementById("Border_Secondary_Color").value);
        $("#Brewing_Steps_Table td").css('color', document.getElementById("Text_Tertiary_Color").value);

        $('.removeStep').remove();
        $('#Step_To_Start_Select option:first').after(html_StepToStart);
        if (document.getElementById("Temp_F_Radio").checked) {
            ConvertBrewStepsFileUOM("F");
        } else {
            ConvertBrewStepsFileUOM("C");
        }

        LogStepFile();
    }

    /*
     * The ParseBrewStepList function is responsible for creating the drop down menus for
     * the widgets on the Brew Steps tab. Updates the list of files to choose to 
     * load or delete.
     */
    function ParseBrewStepsListResponse(responseText) {
        //var responseJSON = JSON.parse(responseText);

        var Count = responseText.Count;

        // Will include the DEFAULT original, as this is available for loading and setting as default preference
        var html1 = '';
        var html2 = '';
        for (var i = 0; i < Count; i++) {
            html1 += '<option class="removeFile" value="' + responseText.FileNames[i] + '">' + responseText.FileNames[i] + '</option>\r\n';
            if (responseText.FileNames[i] == document.getElementById("DefaultStepFile").value) {
                html2 += '<option class="removeFile" value="' + responseText.FileNames[i] + '" selected="selected" >' + responseText.FileNames[i] + '</option>\r\n';
            } else {
                html2 += '<option class="removeFile" value="' + responseText.FileNames[i] + '">' + responseText.FileNames[i] + '</option>\r\n';
            }
        }

        $('.removeFile').remove();

        $('#Load_Steps_File_List option:first').after(html1);
        //$('#Default_BrewSteps_Select').append(html1);
        //document.getElementById("Default_BrewSteps_Select").value = document.getElementById("DefaultStepFile").value;
        $('#Delete_Steps_File_List option:first').after(html1);
    }

    function RoutineLoggingResponseHandler(responseText) {
        if (responseText.ResponseCode == "2") {
            // Getting inside this loop means it is a different day, send a new initial log and then send the old message log
            InitialLogSent = false;
            InitialLogBundleSent = false;
            var oldMessage = responseText.OldMessage;

            SendInitialInformationLog();
            LogEvent(oldMessage)
        }
    }

    // ---------- End Callback Handler Functions --------
    // --------------------------------------------------

    //-------------------- Accessory Functions -------------------------

    function UpdateAllColors() {

        ChangeBackgroundColor(document.getElementById("Background_Color").value);
        ChangePrimaryBorderColor(document.getElementById("Border_Primary_Color").value);
        ChangeSecondaryBorderColor(document.getElementById("Border_Secondary_Color").value);
        ChangePrimaryTextColor(document.getElementById("Text_Primary_Color").value);
        ChangeSecondaryTextColor(document.getElementById("Text_Secondary_Color").value);
        ChangeTertiaryTextColor(document.getElementById("Text_Tertiary_Color").value);
        ChangeGraphPrimaryBorderColor(document.getElementById("Graph_Axis_Primary_Color").value);
        ChangeGraphSecondaryBorderColor(document.getElementById("Graph_Axis_Secondary_Color").value);
        ChangeGraphPrimaryTextColor(document.getElementById("Graph_Text_Primary_Color").value);
        ChangeGraphSecondaryTextColor(document.getElementById("Graph_Text_Secondary_Color").value);
        ChangeGraphTertiaryTextColor(document.getElementById("Graph_Text_Tertiary_Color").value);

    }

    /*
     * The ConvertBrewStepsFileUOM function takes a parameter, "C" or "F" to determine which unit to convert to.
     * The function will convert the step file currently held by document to the intended Unit of Measure
     */
    function ConvertBrewStepsFileUOM(destinationUOM) {
        var $_table = document.getElementById("Brewing_Steps_Table");
        var $_rows = $_table.getElementsByClassName("removeRow");

        for (var i = 0; i < $_rows.length; i++) {
            // cols is going to be a collection of 10 relevant data pieces + 2 irrelevant
            var $_cols = $_rows[i].getElementsByTagName('td');

            if (destinationUOM == CurrentFileUOM) {
                // Do nothing, you are converting from one type, to the same type
            } else { // By getting here, you have established that there is a difference, now convert
                if (destinationUOM == "C") {
                    var $_StepType = $_cols[0].getElementsByTagName('select')[0].value;
                    var $_StepTimer = $_cols[3].getElementsByTagName('select')[0].value;
                    var StepSetpointSelect = $_cols[2].getElementsByTagName('select')[0];
                    var $_StepSetpoint = Number(StepSetpointSelect.value); // F --> C

                    if ($_StepSetpoint == 0) {
                        // If the Setpoint is 0, do nothing

                        // Need to replace the select right here, value = 0
                        var numberOptions = StepSetpointSelect.length;
                        for (var j = 0; j < numberOptions; j++) {
                            StepSetpointSelect.remove(0);
                        }

                        for (var j = 0; j < 106; j++) {
                            var newOption = document.createElement("option");
                            newOption.value = j;
                            newOption.text = j;
                            StepSetpointSelect.add(newOption);
                        }

                        StepSetpointSelect.value = "0";

                    } else {
                        var newSetpointC = ((($_StepSetpoint - 32) * 5) / 9);

                        // Need to replace the select right here, value = newSetpointC
                        var numberOptions = StepSetpointSelect.length;
                        for (var j = 0; j < numberOptions; j++) {
                            StepSetpointSelect.remove(0);
                        }

                        for (var j = 0; j < 106; j++) {
                            var newOption = document.createElement("option");
                            newOption.value = j;
                            newOption.text = j;
                            StepSetpointSelect.add(newOption);
                        }

                        StepSetpointSelect.value = newSetpointC.toFixed(0);
                    }

                    var $_StepFillVolume = Number($_cols[4].innerHTML); // G --> L
                    if ($_StepFillVolume == 0) {
                        // If the fill volume is 0, do nothing
                    } else {
                        var newFillVolumeL = ($_StepFillVolume * 3.78541);
                        $_cols[4].innerHTML = newFillVolumeL.toFixed(2);
                    }

                    switch ($_StepType) {
                        case "3":
                            var newPrompt = "Heating to " + newSetpointC.toFixed(0) + " degrees C";
                            $_cols[1].innerHTML = newPrompt;
                            break;
                        case "4":
                            var newPrompt = "Maintaining " + newSetpointC.toFixed(0) + " degrees C for " + $_StepTimer + " minutes";
                            $_cols[1].innerHTML = newPrompt;
                            break;
                        case "5":
                            var newPrompt = "Cooling to " + newSetpointC.toFixed(0) + " degrees C";
                            $_cols[1].innerHTML = newPrompt;
                            break;
                    }
                } else { //destinationUOM = "F"
                    var $_StepType = $_cols[0].getElementsByTagName('select')[0].value;
                    var $_StepTimer = $_cols[3].getElementsByTagName('select')[0].value;
                    var StepSetpointSelect = $_cols[2].getElementsByTagName('select')[0];
                    var $_StepSetpoint = Number(StepSetpointSelect.value); // C --> F

                    if ($_StepSetpoint == 0) {
                        // If the Setpoint is 0, do nothing

                        // Need to replace the select right here, value = newSetpointC
                        var numberOptions = StepSetpointSelect.length;
                        for (var j = 0; j < numberOptions; j++) {
                            StepSetpointSelect.remove(0);
                        }

                        var firstOption = document.createElement("option");
                        firstOption.value = 0;
                        firstOption.text = 0;
                        StepSetpointSelect.add(firstOption);
                        for (var j = 32; j < 221; j++) {
                            var newOption = document.createElement("option");
                            newOption.value = j;
                            newOption.text = j;
                            StepSetpointSelect.add(newOption);
                        }

                        StepSetpointSelect.value = "0";

                    } else {
                        var newSetpointF = ((($_StepSetpoint * 9) / 5) + 32);

                        // Need to replace the select right here, value = newSetpointC
                        var numberOptions = StepSetpointSelect.length;
                        for (var j = 0; j < numberOptions; j++) {
                            StepSetpointSelect.remove(0);
                        }

                        var firstOption = document.createElement("option");
                        firstOption.value = 0;
                        firstOption.text = 0;
                        StepSetpointSelect.add(firstOption);
                        for (var j = 32; j < 221; j++) {
                            var newOption = document.createElement("option");
                            newOption.value = j;
                            newOption.text = j;
                            StepSetpointSelect.add(newOption);
                        }

                        StepSetpointSelect.value = newSetpointF.toFixed(0);
                    }

                    var $_StepFillVolume = Number($_cols[4].innerHTML); // L --> G
                    if ($_StepFillVolume == 0) {
                        // If the fill volume is 0, do nothing
                    } else {
                        var newFillVolumeG = ($_StepFillVolume * 0.264172);
                        $_cols[4].innerHTML = newFillVolumeG.toFixed(2);
                    }

                    switch ($_StepType) {
                        case "3":
                            var newPrompt = "Heating to " + newSetpointF.toFixed(0) + " degrees F";
                            $_cols[1].innerHTML = newPrompt;
                            break;
                        case "4":
                            var newPrompt = "Maintaining " + newSetpointF.toFixed(0) + " degrees F for " + $_StepTimer + " minutes";
                            $_cols[1].innerHTML = newPrompt;
                            break;
                        case "5":
                            var newPrompt = "Cooling to " + newSetpointF.toFixed(0) + " degrees F";
                            $_cols[1].innerHTML = newPrompt;
                            break;
                    }
                }
            }
        }

        CurrentFileUOM = destinationUOM;
        PopulateStepToStartList();
    }

    /*
     * The DisplayHeaterPower function is responsible for updating the HTML display
     * value for the Heater_Power_Slider when the slider is moved, a seperate function
     * will handle the distribution of the new value to controller
     */
    function DisplayHeaterPower() {

        var curValue = $("#Heater_Power_Slider").slider("option", "value");
        document.getElementById("Heater_Power_Display").value = curValue;
        UserChangedHeaterPower = true;
        if (curValue == 0) {
            //document.getElementById("Heater_Switch_Checkbox").checked = false;
            $("#Override_Span").hide("fast");
        } else {
            document.getElementById("Heater_Switch_Checkbox").checked = true;
            $("#Override_Span").show("fast");
        }
    }

    /*
     * The UpdateHeaterPower is responsebile for handling change events to the Heater slider element
     */
    function UpdateHeaterPower() {

        var curValue = $("#Heater_Power_Slider").slider("option", "value");
        document.getElementById("Heater_Power_Display").value = curValue;
        if (curValue == 0) {
            //document.getElementById("Heater_Switch_Checkbox").checked = false;
        } else {
            document.getElementById("Heater_Switch_Checkbox").checked = true;
        }
        PostHeaterPowerLevel(curValue);
        Graphing_Flag = true;
    }

    /*
     * This function sets some variables related to the start of a brew session
     */
    function LockInBrewSteps() {
        BrewSessionSteps = document.getElementsByClassName("removeRow");
        NumberBrewSessionSteps = BrewSessionSteps.length;
    }

    /*
     * Updates the Target_Temp dropdown on page 1 with F values 32 - 220
     */
    function PopulateTargetTemperatureSelect_F() {

        var html = '';
        for (var i = 50; i < 221; i++) {
            html += '<option class="removeTemperature" value="' + i + '">' + i + '</option>\r\n';
        }

        $('.removeTemperature').remove();
        $('#Target_Temperature_Select option:first').after(html);
    }

    /*
     * Updates the Target_Temp dropdown on page 1 with C values 0 - 110
     */
    function PopulateTargetTemperatureSelect_C() {

        var html = '';
        for (var i = 10; i < 106; i++) {
            html += '<option class="removeTemperature" value="' + i + '">' + i + '</option>\r\n';
        }

        $('.removeTemperature').remove();
        $('#Target_Temperature_Select option:first').after(html);
    }

    /*
     * Takes the current brew step table, and populates the dropdown on page 1 with all step prompts
     */
    function PopulateStepToStartList() {

        var StepList = document.getElementsByClassName("removeRow");
        var numSteps = StepList.length;

        var html = '';
        for (var i = 0; i < numSteps; i++) {

            var curStepPrompt = StepList[i].getElementsByTagName('td').item(1).textContent;

            if (curStepPrompt.length > 23) {
                html += '<option class="removeStep" value="' + (i + 1) + '">' + (i + 1) + ' - ' + curStepPrompt.substring(0, 23) + '...' + '</option>\r\n';
            } else {
                html += '<option class="removeStep" value="' + (i + 1) + '">' + (i + 1) + ' - ' + curStepPrompt + '</option>\r\n';
            }


        }

        $('.removeStep').remove();
        $('#Step_To_Start_Select option:first').after(html);
    }

    /*
     * Pupulates the dropdown list of voices in the settings tab
     */
    function PopulateVoiceList() {

        for (var i = document.getElementById("Voice_Select").options.length - 1; i >= 0; i--) {
            document.getElementById("Voice_Select").remove(i);
        }

        var voices = window.speechSynthesis.getVoices();

        for (var i = 0; i < voices.length; i++) {
            var option = document.createElement('option');
            option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
            option.value = voices[i].name;

            if (voices[i].name == Default_Voice_Name) {
                option.textContent += ' -- DEFAULT';
                option.selected = true;
                document.getElementById("Voice_Select").value = Default_Voice_Name;
            }

            option.setAttribute('data-lang', voices[i].lang);
            option.setAttribute('data-name', voices[i].name);
            document.getElementById("Voice_Select").appendChild(option);
        }
    }

    function TTSSpeak(Prompt) {

        var pitch = $("#Voice_Pitch_Slider").slider("option", "value");
        var rate = $("#Voice_Rate_Slider").slider("option", "value");
        var selectedVoiceOption = Default_Voice_Name;
        //var selectedVoiceOption = document.getElementById("Voice_Select").value;
        var utterance = new SpeechSynthesisUtterance(Prompt);

        var voices = window.speechSynthesis.getVoices();
        for (var i = 0; i < voices.length; i++) {
            if (voices[i].name == selectedVoiceOption) {
                utterance.voice = voices[i];
            }

        }

        utterance.pitch = pitch;
        utterance.rate = rate;

        if (window.speechSynthesis.speaking) {
            return;
        }

        if (Prompt.length > 0) {
            window.speechSynthesis.speak(utterance);
        }
    }

    function UpdateSessionCalculations() {
        var KWHUsedLastSecond = 0;
        var HeaterWatts = Number(document.getElementById("Heater_Watts").value);
        var Heater_Power = Number($("#Heater_Power_Slider").slider("option", "value"));

        KWHUsedLastSecond = (((HeaterWatts / 1000) * (Heater_Power / 100)) * (1 / 3600));

        // Check to see if the pump is on, if so, add 161 watts for the second
        if (document.getElementById("Pump_Switch_Checkbox").checked == "true") {
            KWHUsedLastSecond += ((161 / 1000) * (1 / 3600));
        }

        CumulativeKWH += KWHUsedLastSecond;

        var CostPerKWHour = Number(document.getElementById("CPKWH").value);

        TotalSessionCost = CumulativeKWH * CostPerKWHour;

        document.getElementById("Total_KWH_Used_Span").innerHTML = CumulativeKWH.toFixed(2);
        document.getElementById("Total_Brewing_Cost_Span").innerHtml = "$" + TotalSessionCost.toFixed(2);

    }

    function LogSettings() {
        // Need to determine which string to save for Default
        var New_Default_Step_FileName = document.getElementById("DefaultStepFile").value;
        // Need to determine which Temperature Units to save
        var TempUnits = "";
        if (document.getElementById('Temp_F_Radio').checked) {
            TempUnits = "F";
        } else if (document.getElementById('Temp_C_Radio').checked) {
            TempUnits = "C";
        }
        // Generate a JS Object representing the JSON request
        var SettingsJSObj = {
            Default_Steps: New_Default_Step_FileName,
            Temp_Units: TempUnits,
            Heater_Watts: document.getElementById("Heater_Watts").value,
            CPKWH: document.getElementById("CPKWH").value,
            Enable_HBC: document.getElementById("Enable_HBC").checked,
            HBMSCC: document.getElementById("HBMSCC").value,
            MaximumHeaterPower: document.getElementById("MaximumHeaterPower").value,
            BoilDetectTime: document.getElementById("BoilDetectTime").value,
            PwrS: document.getElementById("PwrS").value,
            PwrL: document.getElementById("PwrL").value,
            PwrM: document.getElementById("PwrM").value,
            PwrB: document.getElementById("PwrB").value,
            DeltaT1: document.getElementById("DeltaT1").value,
            DeltaT2: document.getElementById("DeltaT2").value,
            BGD_Color: "#000000",
            BP_Color: document.getElementById("Border_Primary_Color").value,
            BS_Color: document.getElementById("Border_Secondary_Color").value,
            TP_Color: document.getElementById("Text_Primary_Color").value,
            TS_Color: document.getElementById("Text_Secondary_Color").value,
            TT_Color: document.getElementById("Text_Tertiary_Color").value,
            GAP_Color: document.getElementById("Graph_Axis_Primary_Color").value,
            GAS_Color: document.getElementById("Graph_Axis_Secondary_Color").value,
            GTP_Color: document.getElementById("Graph_Text_Primary_Color").value,
            GTS_Color: document.getElementById("Graph_Text_Secondary_Color").value,
            GTT_Color: document.getElementById("Graph_Text_Tertiary_Color").value,
            Speak_Rate: $("#Voice_Rate_Slider").slider("option", "value"),
            Speak_Pitch: $("#Voice_Pitch_Slider").slider("option", "value"),
            //Speak_Voice: document.getElementById("Voice_Select").selectedOptions[0].getAttribute('data-name'),
            Update_Interval: document.getElementById("Update_Interval_Select").value,
            //Send_Data: document.getElementById("Data_Sharing_Checkbox").checked,
            //User_Email: document.getElementById("UserEmail").value
        };

        var messageBodyString = JSON.stringify(SettingsJSObj);
        LogEvent(messageBodyString);

    }

    function LogStepFile() {
        var New_Default_Step_FileName = document.getElementById("DefaultStepFile").value;
        var numSteps = $("#Brewing_Steps_Table tbody tr.removeRow").length;
        var fileName = document.getElementById("")
        var $_table = document.getElementById("Brewing_Steps_Table");
        var rows = $_table.getElementsByClassName("removeRow");
        // Generate a JS Object representing the JSON request
        var InitialStepFileJSObj = {
            FileName: New_Default_Step_FileName,
            NumberSteps: numSteps,
            UOM: CurrentFileUOM,
            Steps: []
        };
        // Dynamically generate the Steps array given current table
        for (var i = 0; i < rows.length; i++) {
            // cols is going to be a collection of 10 relevant data pieces + 2 irrelevant
            var cols = rows[i].getElementsByTagName('td');
            // Generate a JS Object represeting the current step
            var newStepJSObj = {
                STy: cols[0].getElementsByTagName('select')[0].value,
                P: cols[1].innerHTML,
                SP: cols[2].getElementsByTagName('select')[0].value,
                STi: cols[3].getElementsByTagName('select')[0].value,
                FV: cols[4].innerHTML,
                HPos: cols[5].getElementsByTagName('select')[0].value,
                BF: cols[6].getElementsByTagName('input')[0].checked,
                PF: cols[7].getElementsByTagName('input')[0].checked,
                S: cols[8].getElementsByTagName('input')[0].checked,
                AF: cols[9].getElementsByTagName('input')[0].checked
            }
            InitialStepFileJSObj.Steps[i] = newStepJSObj;
        }

        var messageBodyString = JSON.stringify(InitialStepFileJSObj);
        LogEvent(messageBodyString);
    }

    function LogEvent(Prompt) {
        //console.log(Prompt);

        var curTime = new Date();

        var curHours = curTime.getHours();
        var curMinutes = curTime.getMinutes();
        var curSeconds = curTime.getSeconds();
        var FormattedTime = String(curHours) + ":" + String(curMinutes) + ":" + String(curSeconds) + " - ";

        // Format the current time here so that it can be used by arduino

        var curLogEntry = {
            Timestamp: FormattedTime,
            Message: Prompt
        }

        if (InitialLogSent == true) {
            if (InitialLogBundleSent == true) {
                SendLogEntry(curLogEntry)
            } else {
                SendLogFile(logArray);
                logArray = [];
                InitialLogBundleSent = true;
            }
        } else {
            logArray.push(curLogEntry);
        }
    }

    /*
     * The ParseBeerXML will parse a Beer XML File from the user's file system, and turn it ito a list of steps
     * These steps will be saved in SPIFFS and will be available for the user to interact with in this Web App.
     */
    function ParseBeerXML(xmlData) {
        // LogEvent(xmlData.length);
        var KGToOunces = 35.274;

        if (window.DOMParser) {
            var parser = new DOMParser();
            xmlDoc = parser.parseFromString(xmlData, "application/xml");
        } else // Internet Explorer
        {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            xmlDoc.loadXML(xmlData);
        }

        // Include logic here to extract each of the recipes, and convert multiple per file.
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(xmlData, "application/xml");

        // LogEvent(xmlDoc);

        var Recipes = xmlDoc.getElementsByTagName("RECIPES");
        // LogEvent(Recipes);

        var recipeList = Recipes[0].getElementsByTagName("RECIPE");
        var RecipeCount = recipeList.length;
        // LogEvent(RecipeCount);
        // LogEvent(recipeList)

        for (var i = 0; i < RecipeCount; i++) {

            // Get the main NAME
            var curRecipe = recipeList[i];
            var DocumentName = curRecipe.getElementsByTagName("NAME")[0].childNodes[0].nodeValue.toString();
            if (DocumentName.length >= 17) {
                DocumentName = DocumentName.substring(0, 16); // Name can only be 17 chars max
            }
            // LogEvent(DocumentName);

            // Get the main BOIL TIME
            var BoilTime = curRecipe.getElementsByTagName("BOIL_TIME")[0].childNodes[0].nodeValue;

            // Get the main BOIL SIZE
            var BoilVolume = curRecipe.getElementsByTagName("BOIL_SIZE")[0].childNodes[0].nodeValue;

            var Hops = curRecipe.getElementsByTagName("HOPS");

            var HopList = Hops[0].getElementsByTagName("HOP");
            var numberHops = HopList.length;

            var HopsArray = [];

            for (var j = 0; j < numberHops; j++) {

                var curHopsUse = HopList[j].getElementsByTagName("USE")[0].childNodes[0].nodeValue;

                if (curHopsUse == "Boil") {
                    var curName = HopList[j].getElementsByTagName("NAME")[0].childNodes[0].nodeValue;
                    var curAmount = HopList[j].getElementsByTagName("AMOUNT")[0].childNodes[0].nodeValue;
                    var curTime = HopList[j].getElementsByTagName("TIME")[0].childNodes[0].nodeValue;
                    var curDescription = "";

                    var newCurName = curName.replace(/,/g, " ");

                    var curHopsArrayRow = {
                        Name: newCurName,
                        Amount: curAmount,
                        Time: curTime,
                        Desc: curDescription
                    };
                    HopsArray[j] = curHopsArrayRow;
                } else {

                }
            }

            // Sort the Hops Array by Time from High to Low
            HopsArray.sort(function(a, b) {
                return parseInt(b.Time) - parseInt(a.Time);
            });

            // Get info about all of the mash steps

            var Mash = curRecipe.getElementsByTagName("MASH");
            var MashSteps = Mash[0].getElementsByTagName("MASH_STEPS")[0].getElementsByTagName("MASH_STEP");
            var numberMashSteps = MashSteps.length;

            var MashStepsArray = [];
            for (var j = 0; j < numberMashSteps; j++) {
                // Need to get the NAME, STEP_TIME, STEP_TEMP of the current HOP
                var curName = MashSteps[j].getElementsByTagName("NAME")[0].childNodes[0].nodeValue;
                var curTime = MashSteps[j].getElementsByTagName("STEP_TIME")[0].childNodes[0].nodeValue;
                var curTemp = MashSteps[j].getElementsByTagName("STEP_TEMP")[0].childNodes[0].nodeValue;
                var curInfuseAmount = MashSteps[j].getElementsByTagName("INFUSE_AMOUNT")[0].childNodes[0].nodeValue;
                if (StartingWaterAmount == 0) {
                    StartingWaterAmount = curInfuseAmount;
                }

                var curMashStepArrayRow = {
                    Name: curName,
                    Time: curTime,
                    Temp: curTemp
                };

                MashStepsArray[j] = curMashStepArrayRow;

            }

            // ---------- Calculate Hops Additions ---------------
            var HopsAdditions = [];

            var TotalHopsAdditions = 0;

            if (HopsArray.length > 0) {

                if (document.getElementById('Temp_F_Radio').checked) {

                    var firstEntryOunces = HopsArray[0].Amount * KGToOunces;
                    var firstDescription = "" + firstEntryOunces.toFixed(2) + " ounces of " + HopsArray[0].Name + " hops";
                    var firstTime = HopsArray[0].Time;
                    var firstHopsAdditionsEntry = {
                        Desc: firstDescription,
                        Time: firstTime,
                        Weight: firstEntryOunces,
                        HighestCupNo: 0,
                        BoilTimeAfterThisAddition: 0
                    };
                    HopsAdditions.push(firstHopsAdditionsEntry);
                    TotalHopsAdditions += 1;

                    for (var k = 1; k < HopsArray.length; k++) {
                        if (HopsArray[k].Time != HopsArray[k - 1].Time) { // Not the same time as last addition

                            var ounces = HopsArray[k].Amount * KGToOunces;
                            var curDescription = "" + ounces.toFixed(2) + " ounces of " + HopsArray[k].Name + " hops";

                            var curTime = HopsArray[k].Time;

                            var HopsAdditionsEntry = {
                                Desc: curDescription,
                                Time: curTime,
                                Weight: ounces,
                                HighestCupNo: 0,
                                BoilTimeAfterThisAddition: 0
                            };
                            HopsAdditions[TotalHopsAdditions] = HopsAdditionsEntry;

                            TotalHopsAdditions += 1;

                        } else { // The two additions have the same time, update the entry

                            var ounces = HopsArray[k].Amount * KGToOunces;
                            var curDescription = HopsAdditions[TotalHopsAdditions - 1].Desc + " and " + ounces.toFixed(2) + " ounces of " + HopsArray[k].Name + " hops";

                            HopsAdditions[TotalHopsAdditions - 1].Desc = curDescription;
                            HopsAdditions[TotalHopsAdditions - 1].Weight += ounces;

                        }
                    }

                    // TODO: Determine how many cups required for each
                    var cupCapacity = Number(document.getElementById("HBMSCC").value);

                    for (var k = 0; k < TotalHopsAdditions; k++) {

                        var CupsReq = (HopsAdditions[k].Weight / cupCapacity) + 1;
                        if (k == 0) {
                            HopsAdditions[k].HighestCupNo = CupsReq;
                        } else {
                            HopsAdditions[k].HighestCupNo = HopsAdditions[k - 1].HighestCupNo + CupsReq;
                        }
                    }
                } else if (document.getElementById('Temp_C_Radio').checked) {

                    var firstEntryOunces = HopsArray[0].Amount * KGToOunces;
                    var firstDescription = "" + (HopsArray[0].Amount * 1000).toFixed(2) + " grams of " + HopsArray[0].Name + " hops";
                    var firstTime = HopsArray[0].Time;
                    var firstHopsAdditionsEntry = {
                        Desc: firstDescription,
                        Time: firstTime,
                        Weight: firstEntryOunces,
                        HighestCupNo: 0,
                        BoilTimeAfterThisAddition: 0
                    };
                    HopsAdditions.push(firstHopsAdditionsEntry);
                    TotalHopsAdditions += 1;

                    for (var k = 1; k < HopsArray.length; k++) {
                        if (HopsArray[k].Time != HopsArray[k - 1].Time) { // Not the same time as last addition

                            var ounces = HopsArray[k].Amount * KGToOunces;
                            var curDescription = "" + (HopsArray[k].Amount * 1000).toFixed(2) + " grams of " + HopsArray[k].Name + " hops";

                            var curTime = HopsArray[k].Time;

                            var HopsAdditionsEntry = {
                                Desc: curDescription,
                                Time: curTime,
                                Weight: ounces,
                                HighestCupNo: 0,
                                BoilTimeAfterThisAddition: 0
                            };
                            HopsAdditions[TotalHopsAdditions] = HopsAdditionsEntry;

                            TotalHopsAdditions += 1;
                        } else { // The two additions have the same time, update the entry

                            var ounces = HopsArray[k].Amount * KGToOunces;
                            var curDescription = HopsAdditions[TotalHopsAdditions - 1].Desc + " and " + (HopsArray[k].Amount * 1000).toFixed(2) + " grams of " + HopsArray[k].Name + " hops";

                            HopsAdditions[TotalHopsAdditions - 1].Desc = curDescription;
                            HopsAdditions[TotalHopsAdditions - 1].Weight += ounces;
                        }
                    }

                    // TODO: Determine how many cups required for each
                    var cupCapacity = Number(document.getElementById("HBMSCC").value);

                    for (var k = 0; k < TotalHopsAdditions; k++) {

                        var CupsReq = (HopsAdditions[k].Weight / cupCapacity) + 1;
                        if (k == 0) {
                            HopsAdditions[k].HighestCupNo = CupsReq;
                        } else {
                            HopsAdditions[k].HighestCupNo = HopsAdditions[k - 1].HighestCupNo + CupsReq;
                        }
                    }

                }

                //TODO: Logging here for all the hops

                // We now have all the hops additions
                // Check if the first HopAddition time is equal to boil time, if not, add a fake Hop to the beginning
                if (HopsAdditions[0].Time < BoilTime) {
                    var fakeHopsAdditionsEntry = {
                        Desc: "",
                        Time: BoilTime,
                        Weight: 0,
                        HighestCupNo: 0,
                        BoilTimeAfterThisAddition: 0
                    };
                    HopsAdditions.unshift(fakeHopsAdditionsEntry); // Adds new element to beginning of array
                    TotalHopsAdditions += 1;
                }

                // Determine the hops addition times based on Boil Time
                // Setting of the time after this addition to set the timer until next step
                for (var k = 0; k < TotalHopsAdditions; k++) {
                    if (k == 0) {
                        if (TotalHopsAdditions > 1) {
                            HopsAdditions[k].BoilTimeAfterThisAddition = BoilTime - HopsAdditions[1].Time;
                        } else {
                            HopsAdditions[k].BoilTimeAfterThisAddition = BoilTime;
                        }
                    } else if (k == (TotalHopsAdditions - 1)) {
                        HopsAdditions[k].BoilTimeAfterThisAddition = HopsAdditions[k].Time;
                    } else {
                        HopsAdditions[k].BoilTimeAfterThisAddition = HopsAdditions[k].Time - HopsAdditions[k + 1].Time;
                    }
                }

            } // End of Hops Additions Calculations

            var fileUOM = "F";
            if (document.getElementById("Temp_C_Radio").checked) {
                fileUOM = "C";
            }

            // Generate a JS Object representing the Step File to be saved
            var messageBodyJSObj = {
                Identity: IDENTITY,
                SaveType: "SaveAs",
                FileName: DocumentName,
                NumberSteps: 0, // To be filled in after all the steps are counted and filled
                UOM: fileUOM,
                Steps: []
            };

            var StepCounter = 0;


            // ------------------------ Build the actual response now -------------------------
            // First Step: Step type 2 prompt with Recipe Name
            // Generate a JS Object represeting the current step
            var Step1JSObj = {
                STy: "2",
                P: DocumentName,
                SP: "0",
                STi: "0",
                FV: "0",
                HPos: "0",
                BF: false,
                PF: false,
                S: false,
                AF: false
            };
            messageBodyJSObj.Steps[StepCounter] = Step1JSObj;
            StepCounter += 1;


            // Second Step: Type 1, filling kettle
            var StartingWaterLiters = parseFloat(StartingWaterAmount);
            var StartingWaterGallons = StartingWaterLiters * 0.264172;
            var ChosenWaterAmount = 0;

            // Check to see if the AccuFill device is enabled
            if (document.getElementById("AccuFill_Enabled").checked) {
                var Step2JSObj = {
                    STy: "1",
                    P: " Close kettle valve on pump. Install AccuFill device on kettle.  Turn on water supply.",
                    SP: "0",
                    STi: "0",
                    FV: "0",
                    HPos: "0",
                    BF: false,
                    PF: false,
                    S: true,
                    AF: false
                };
                messageBodyJSObj.Steps[StepCounter] = Step2JSObj;
                StepCounter += 1;

                var RemainingWaterLiters;
                var InitialFillVolumeLiters = Number(document.getElementById("Accufill_Initial_Fill_Volume").value);


                if (document.getElementById("Temp_F_Radio").checked) {
                    InitialFillVolumeLiters *= 0.264172;
                }

                // Fill all the way, don't start heating while filling
                if (InitialFillVolumeLiters == 0 || InitialFillVolumeLiters > StartingWaterLiters) {
                    InitialFillVolumeLiters = StartingWaterLiters
                    RemainingWaterLiters = 0;

                    if (document.getElementById("Temp_F_Radio").checked) {
                        ChosenWaterAmount = InitialFillVolumeLiters * 0.264172;
                        StartingWaterAmountUnits = "gallons";
                    } else if (document.getElementById("Temp_C_Radio").checked) {
                        ChosenWaterAmount = InitialFillVolumeLiters;
                        StartingWaterAmountUnits = "liters";
                    }

                    var Step3JSObj = {
                        STy: "6",
                        P: "Automatically adding " + ChosenWaterAmount.toFixed(2) + " " + StartingWaterAmountUnits + " of water to kettle",
                        SP: "0",
                        STi: "0",
                        FV: ChosenWaterAmount.toFixed(2),
                        HPos: "0",
                        BF: false,
                        PF: false,
                        S: true,
                        AF: false
                    };
                    messageBodyJSObj.Steps[StepCounter] = Step3JSObj;
                    StepCounter += 1;

                    var Step4JSObj = {
                        STy: "1",
                        P: "Kettle full. Remove AccuFill Device. Connect pump discharge hose to accessory port.  Open kettle valve",
                        SP: "0",
                        STi: "0",
                        FV: "0",
                        HPos: "0",
                        BF: false,
                        PF: false,
                        S: true,
                        AF: true
                    };
                    messageBodyJSObj.Steps[StepCounter] = Step4JSObj;
                    StepCounter += 1;

                } else if (InitialFillVolumeLiters > 0) {

                    if (StartingWaterLiters >= InitialFillVolumeLiters) {
                        RemainingWaterLiters = StartingWaterLiters - InitialFillVolumeLiters;

                        if (document.getElementById("Temp_F_Radio").checked) {
                            ChosenWaterAmount = InitialFillVolumeLiters * 0.264172;
                            StartingWaterAmountUnits = "gallons";
                        } else if (document.getElementById("Temp_C_Radio").checked) {
                            ChosenWaterAmount = InitialFillVolumeLiters;
                            StartingWaterAmountUnits = "liters";
                        }

                        var Step3JSObj = {
                            STy: "6",
                            P: "Automatically adding " + ChosenWaterAmount.toFixed(2) + " " + StartingWaterAmountUnits + " of water to kettle",
                            SP: "0",
                            STi: "0",
                            FV: ChosenWaterAmount.toFixed(2),
                            HPos: "0",
                            BF: false,
                            PF: false,
                            S: true,
                            AF: false
                        };
                        messageBodyJSObj.Steps[StepCounter] = Step3JSObj;
                        StepCounter += 1;

                        if (RemainingWaterLiters > 0) {

                            var StrikeWaterTempAdder = 2;
                            var StrikeWaterTemp = 0;
                            var StrikeWaterTempString = "";
                            var BV = Number(BoilVolume); // COnvert string to double so we can convert to gallons if need be

                            if (document.getElementById("Temp_F_Radio").checked) {

                                BoilTempAsString = "220";

                                BV = BV * 0.264172;
                                StartingWaterAmountUnits = "gallons";
                                StrikeWaterTemp = ((((MashStepsArray[0].Temp * 9) / 5) + 32) + StrikeWaterTempAdder);
                                StrikeWaterTempString = StrikeWaterTemp.toFixed(0) + " degrees F";

                                RemainingWaterLiters *= .264172;

                            } else if (document.getElementById("Temp_C_Radio").checked) {
                                BoilTempAsString = "105";

                                StartingWaterAmountUnits = "liters";
                                StrikeWaterTemp = ((Number(MashStepsArray[0].Temp) * 1) + StrikeWaterTempAdder);
                                StrikeWaterTempString = StrikeWaterTemp.toFixed(0) + " degrees C";

                            }

                            var Step4JSObj = {
                                STy: "3",
                                P: "Heating water to strike temperature of " + StrikeWaterTempString + ". Crush grains while kettle is heating.",
                                SP: StrikeWaterTemp.toFixed(0),
                                STi: "0",
                                FV: "0",
                                HPos: "0",
                                BF: false,
                                PF: true,
                                S: true,
                                AF: true
                            };
                            messageBodyJSObj.Steps[StepCounter] = Step4JSObj;
                            StepCounter += 1;

                            var Step5JSObj = {
                                STy: "6",
                                P: "Automatically adding remaining " + RemainingWaterLiters.toFixed(2) + " " + StartingWaterAmountUnits + " of water to kettle.",
                                SP: "0",
                                STi: "0",
                                FV: RemainingWaterLiters.toFixed(2),
                                HPos: "0",
                                BF: false,
                                PF: false,
                                S: true,
                                AF: true
                            };
                            messageBodyJSObj.Steps[StepCounter] = Step5JSObj;
                            StepCounter += 1;
                        }

                        var Step6JSObj = {
                            STy: "1",
                            P: "Kettle full. Remove AccuFill device. Connect pump discharge hose to accessory port. Open kettle valve.",
                            SP: StrikeWaterTemp.toFixed(0),
                            STi: "0",
                            FV: "0",
                            HPos: "0",
                            BF: false,
                            PF: false,
                            S: true,
                            AF: true
                        };
                        messageBodyJSObj.Steps[StepCounter] = Step6JSObj;
                        StepCounter += 1;
                    }
                }
            } else { // AccuFill not enabled, proceed with base steps sequence
                if (document.getElementById("Temp_F_Radio").checked) {
                    ChosenWaterAmount = StartingWaterGallons;
                    StartingWaterAmountUnits = "gallons";
                } else if (document.getElementById("Temp_C_Radio").checked) {
                    ChosenWaterAmount = StartingWaterLiters;
                    StartingWaterAmountUnits = "liters";
                }

                var Step2JSObj = {
                    STy: "1",
                    P: "Add " + ChosenWaterAmount.toFixed(2) + " " + StartingWaterAmountUnits + " of water to kettle",
                    SP: "0",
                    STi: "0",
                    FV: ChosenWaterAmount.toFixed(2),
                    HPos: "0",
                    BF: false,
                    PF: false,
                    S: true,
                    AF: true
                };
                messageBodyJSObj.Steps[StepCounter] = Step2JSObj;
                StepCounter += 1;

                var Step3JSObj = {
                    STy: "1",
                    P: "Place cover on kettle and open the valve",
                    SP: "0",
                    STi: "0",
                    FV: "0",
                    HPos: "0",
                    BF: false,
                    PF: false,
                    S: true,
                    AF: false
                };
                messageBodyJSObj.Steps[StepCounter] = Step3JSObj;
                StepCounter += 1;
            }

            var StrikeWaterTempAdder = 2;
            var StrikeWaterTemp = 0;
            var StrikeWaterTempString = "";
            var BV = Number(BoilVolume); // COnvert string to double so we can convert to gallons if need be

            if (document.getElementById("Temp_F_Radio").checked) {

                BoilTempAsString = "220";

                BV = BV * 0.264172;
                StartingWaterAmountUnits = "gallons";
                StrikeWaterTemp = ((((MashStepsArray[0].Temp * 9) / 5) + 32) + StrikeWaterTempAdder);
                StrikeWaterTempString = StrikeWaterTemp.toFixed(0) + " degrees F";

                // Change the temp to F for all mash steps

                for (var k = 0; k < MashStepsArray.length; k++) {
                    MashStepsArray[k].Temp = (((Number(MashStepsArray[k].Temp) * 9) / 5) + 32).toFixed(0);
                }

            } else if (document.getElementById("Temp_C_Radio").checked) {
                BoilTempAsString = "105";

                StartingWaterAmountUnits = "liters";
                StrikeWaterTemp = ((Number(MashStepsArray[0].Temp) * 1) + StrikeWaterTempAdder);
                StrikeWaterTempString = StrikeWaterTemp.toFixed(0) + " degrees C";

            }

            var Step4JSObj = {
                STy: "3",
                P: "Heating water to strike temperature of " + StrikeWaterTempString + ". Crush grains while kettle is heating.",
                SP: StrikeWaterTemp.toFixed(0),
                STi: "0",
                FV: "0",
                HPos: "0",
                BF: false,
                PF: true,
                S: true,
                AF: true
            };
            messageBodyJSObj.Steps[StepCounter] = Step4JSObj;
            StepCounter += 1;

            var Step5JSObj = {
                STy: "1",
                P: "Water at strike temperature. Add grains to kettle and place cover on kettle.",
                SP: Number(MashStepsArray[0].Temp).toFixed(0),
                STi: "0",
                FV: "0",
                HPos: "0",
                BF: false,
                PF: false,
                S: true,
                AF: true
            };
            messageBodyJSObj.Steps[StepCounter] = Step5JSObj;
            StepCounter += 1;



            // Create a step for each mash step
            for (var k = 0; k < MashStepsArray.length; k++) {

                var Step6JSObj = {
                    STy: "3",
                    P: "Heating to " + Number(MashStepsArray[k].Temp).toFixed(0) + " degrees for mash step " + (k + 1),
                    SP: Number(MashStepsArray[k].Temp).toFixed(0),
                    STi: "0",
                    FV: "0",
                    HPos: "0",
                    BF: false,
                    PF: true,
                    S: true,
                    AF: true
                };
                messageBodyJSObj.Steps[StepCounter] = Step6JSObj;
                StepCounter += 1;

                var Step7JSObj = {
                    STy: "4",
                    P: "Maintaining " + Number(MashStepsArray[k].Temp).toFixed(0) + " degrees for mash step " + (k + 1) + " for " + MashStepsArray[k].Time + " minutes",
                    SP: Number(MashStepsArray[k].Temp).toFixed(0),
                    STi: MashStepsArray[k].Time,
                    FV: "0",
                    HPos: "0",
                    BF: false,
                    PF: true,
                    S: true,
                    AF: false
                };
                messageBodyJSObj.Steps[StepCounter] = Step7JSObj;
                StepCounter += 1;

            }

            var Step8JSObj = {
                STy: "1",
                P: "Mash Complete. Remove grains from kettle and top water to " + BV.toFixed(2) + " " + StartingWaterAmountUnits,
                SP: BoilTempAsString,
                STi: "0",
                FV: BV.toFixed(2),
                HPos: "0",
                BF: true,
                PF: false,
                S: true,
                AF: true
            };
            messageBodyJSObj.Steps[StepCounter] = Step8JSObj;
            StepCounter += 1;


            var Step10PromptString = "";

            if (document.getElementById("Enable_HBC").checked) {

                var Step9JSObj = {
                    STy: "1",
                    P: "Install the Hops Boss Feeder and plug it in",
                    SP: BoilTempAsString,
                    STi: "0",
                    FV: "0",
                    HPos: "0",
                    BF: true,
                    PF: false,
                    S: true,
                    AF: false
                };
                messageBodyJSObj.Steps[StepCounter] = Step9JSObj;
                StepCounter += 1;

                Step10PromptString = "Heating to boil. Please weigh out ";
                for (var k = 0; k < TotalHopsAdditions; k++) {
                    Step10PromptString += HopsAdditions[k].Desc + " into Hops-Boss position ";

                    // Determine which hops cups
                    if (k == 0) {
                        Step10PromptString += "1-" + HopsAdditions[k].HighestCupNo + ". ";
                        if (k < (TotalHopsAdditions - 1)) {
                            Step10PromptString += "Then weigh ";
                        }
                    } else {
                        Step10PromptString += HopsAdditions[k - 1].HighestCupNo + "-" + HopsAdditions[k].HighestCupNo + ". ";
                        if (k < (TotalHopsAdditions - 1)) {
                            Step10PromptString += "Then weigh ";
                        }
                    }
                }

            } else { // no hops feeder adjust prompts to be for manual additions

                Step10PromptString = "Heating to boil. Please weigh out ";
                for (var k = 0; k < TotalHopsAdditions; k++) {
                    Step10PromptString += HopsAdditions[k].Desc + " into container " + k + ".";
                    if (k < (TotalHopsAdditions - 1)) {
                        Step10PromptString += " Then weigh ";
                    }
                }

            }

            // Heat to boil
            var Step10JSObj = {
                STy: "3",
                P: Step10PromptString,
                SP: BoilTempAsString,
                STi: "0",
                FV: "0",
                HPos: "0",
                BF: true,
                PF: false,
                S: true,
                AF: true
            };
            messageBodyJSObj.Steps[StepCounter] = Step10JSObj;
            StepCounter += 1;



            // boil reached - either prompt to add hops manually or add boil hops auto if there are boil hops
            // first see if there is a hops addition at the start of boil (hops addition time = 0
            if (TotalHopsAdditions > 0) {

                if (HopsAdditions[0].Desc.length > 0) {

                    if (document.getElementById("Enable_HBC").checked) {

                        var Step11JSObj = {
                            STy: "4",
                            P: "Boil detected. Adding Hops and setting timer for " + HopsAdditions[0].BoilTimeAfterThisAddition + " minutes.",
                            SP: BoilTempAsString,
                            STi: Number(HopsAdditions[0].BoilTimeAfterThisAddition).toFixed(0),
                            FV: "0",
                            HPos: Number(HopsAdditions[0].HighestCupNo).toFixed(0),
                            BF: true,
                            PF: false,
                            S: true,
                            AF: true
                        };
                        messageBodyJSObj.Steps[StepCounter] = Step11JSObj;
                        StepCounter += 1;

                    } else { // manual hops addition at boil, so 2 steps are created

                        var Step11JSObj = {
                            STy: "1",
                            P: "Boil detected. Add Hops Addition #1: " + HopsAdditions[0].Desc,
                            SP: BoilTempAsString,
                            STi: "0",
                            FV: "0",
                            HPos: "0",
                            BF: true,
                            PF: false,
                            S: true,
                            AF: true
                        };
                        messageBodyJSObj.Steps[StepCounter] = Step11JSObj;
                        StepCounter += 1;

                        var Step12JSObj = {
                            STy: "4",
                            P: "Boiling for " + HopsAdditions[0].BoilTimeAfterThisAddition + " minutes",
                            SP: BoilTempAsString,
                            STi: Number(HopsAdditions[0].BoilTimeAfterThisAddition).toFixed(0),
                            FV: "0",
                            HPos: "0",
                            BF: true,
                            PF: false,
                            S: true,
                            AF: false
                        };
                        messageBodyJSObj.Steps[StepCounter] = Step12JSObj;
                        StepCounter += 1;

                    }

                } else { // there is no hop addition so set timer to boil until 1st hops addition required

                    var Step11JSObj = {
                        STy: "4",
                        P: "Boil detected. Setting timer for " + HopsAdditions[0].BoilTimeAfterThisAddition + " minutes.",
                        SP: BoilTempAsString,
                        STi: Number(HopsAdditions[0].BoilTimeAfterThisAddition).toFixed(0),
                        FV: "0",
                        HPos: "0",
                        BF: true,
                        PF: false,
                        S: true,
                        AF: true
                    };
                    messageBodyJSObj.Steps[StepCounter] = Step11JSObj;
                    StepCounter += 1;

                }

                // now create the remaining hops additions after the 1st one
                for (var k = 1; k < TotalHopsAdditions; k++) {

                    if (document.getElementById("Enable_HBC").checked) { // Auto Hops Addition

                        var NextStepJSObj = {
                            STy: "4",
                            P: "Adding Hops and setting timer for " + HopsAdditions[k].BoilTimeAfterThisAddition + " minutes",
                            SP: BoilTempAsString,
                            STi: Number(HopsAdditions[k].BoilTimeAfterThisAddition).toFixed(0),
                            FV: "0",
                            HPos: Number(HopsAdditions[k].HighestCupNo).toFixed(0),
                            BF: true,
                            PF: false,
                            S: true,
                            AF: true
                        };
                        messageBodyJSObj.Steps[StepCounter] = NextStepJSObj;
                        StepCounter += 1;

                    } else { // Manual Hops Addition

                        var NextStep1JSObj = {
                            STy: "1",
                            P: "Add Hops addition #" + (k + 1) + ": " + HopsAdditions[k].Desc,
                            SP: BoilTempAsString,
                            STi: "0",
                            FV: "0",
                            HPos: "0",
                            BF: true,
                            PF: false,
                            S: true,
                            AF: true
                        };
                        messageBodyJSObj.Steps[StepCounter] = NextStep1JSObj;
                        StepCounter += 1;

                        var NextStep2JSObj = {
                            STy: "4",
                            P: "Boiling for " + HopsAdditions[k].BoilTimeAfterThisAddition + " minutes",
                            SP: BoilTempAsString,
                            STi: Number(HopsAdditions[k].BoilTimeAfterThisAddition).toFixed(0),
                            FV: "0",
                            HPos: "0",
                            BF: true,
                            PF: false,
                            S: true,
                            AF: false
                        };
                        messageBodyJSObj.Steps[StepCounter] = NextStep2JSObj;
                        StepCounter += 1;

                    }
                }

            } else { //No Hops Additions

                var Step11JSObj = {
                    STy: "4",
                    P: "Boiling for " + BoilTime + " minutes",
                    SP: BoilTempAsString,
                    STi: BoilTime,
                    FV: "0",
                    HPos: "0",
                    BF: true,
                    PF: false,
                    S: true,
                    AF: false
                };
                messageBodyJSObj.Steps[StepCounter] = Step11JSObj;
                StepCounter += 1;

            }

            // End of Boil

            var Step13JSObj = {
                STy: "1",
                P: "Brewing complete. Please unplug the heater from the controller.",
                SP: "0",
                STi: "0",
                FV: "0",
                HPos: "0",
                BF: false,
                PF: false,
                S: true,
                AF: true
            };
            messageBodyJSObj.Steps[StepCounter] = Step13JSObj;
            StepCounter += 1;

            var Step14JSObj = {
                STy: "1",
                P: "Chill wort. Transfer to fermenter. and pitch yeast.",
                SP: "0",
                STi: "0",
                FV: "0",
                HPos: "0",
                BF: false,
                PF: false,
                S: true,
                AF: false
            };
            messageBodyJSObj.Steps[StepCounter] = Step14JSObj;
            StepCounter += 1;

            // Done creating the steps part of the steps file.
            // Assign the number of steps
            messageBodyJSObj.NumberSteps = StepCounter;

            // Save the Steps File to the controller
            var url = "/savebrewstepsfile";
            var successCallback = VoidResponseHandler;

            // Turn the generated JS Object into a JSON String to pass to server
            var messageBodyString = JSON.stringify(messageBodyJSObj);

            // Execute the HTTP Call
            SendToBrewBossController(url, messageBodyString, successCallback);

            toLog = "Converted " + DocumentName + " Successfully";
            // LogEvent(toLog);

        }

        // Re-load all the lists
        GetStepsList();

        //alert("All Recipes were converted successfully");
        document.getElementById("AlertMessageBoxText").innerHTML = "All Recipes were converted successfully";
        $("#AlertMessageBox").dialog("open");
        // LogEvent("All Recipes were converted successfully");

    }

    function SubmitStepFile() {
        var userEnteredName = document.getElementById("StepFileName").value;

        var goodNameFlag = true;

        if (userEnteredName.length == 0) {
            document.getElementById("AlertMessageBoxText").innerHTML = "Invalid name, please try another"
            $("#AlertMessageBox").dialog("open");
            goodNameFlag = false;
        } else if (userEnteredName.length > 17) {
            document.getElementById("AlertMessageBoxText").innerHTML = "Invalid name, please try another with less that 18 characters"
            $("#AlertMessageBox").dialog("open");
            goodNameFlag = false;
        } else if (userEnteredName == "") {
            document.getElementById("AlertMessageBoxText").innerHTML = "Invalid name, please try another"
            $("#AlertMessageBox").dialog("open");
            goodNameFlag = false;
        }

        if (goodNameFlag == true) {
            // The name is good pass it to the controller to save steps.
            $("#SaveStepsAsDialogBox").dialog("close");

            SaveBrewSteps("SaveAs", userEnteredName);
            GetStepsList();
            //Clear the line where user can type a new name
            document.getElementById("StepFileName").value = "";
            //document.getElementById("NewFileName").value = "";
            //For display purposes
            Current_BrewSteps_FileName = userEnteredName;
            document.getElementById("Current_Step_File").innerHTML = Current_BrewSteps_FileName;
            document.getElementById("DefaultStepFile").value = Current_BrewSteps_FileName;
            PopulateStepToStartList();
        } else {

        }
    }

    function InitiateSpeech() {
        var msg = new SpeechSynthesisUtterance();
    }

    function StopBrewing() {

        CurrentlyBrewing = false;
        CurrentStepNumber = 0;

        BoilDetectTime = 600;
        SetPoint = 0;
        SavedSetpoint = 0;
        BoilTemp = 0;
        BoilStartTime = 0;
        BrewingStartTime = 0;

        Graphing_Flag = false;
        //document.getElementById("Start_Graphing_Button").innerHTML = "Resume Graph";
        WaitingForStartKey = false;
        StartKeyPressed = false;
        HeatingToBoil = false;
        HoldingBoil = false;
        MaintainTemperatureTimerEnabled = false;
        UserChangedHeaterPower = false;
        AccuFillStartedFillingAutomatically = false;
        //document.getElementById("PwrM").value = 2;

        //Edit: Cumulative statistics should be for the entire session, not just on a new brew session.
        //CumulativeKWH = 0;

        document.getElementById("Step_To_Start_Select").value = "none_selected";
        document.getElementById("Current_Brew_Session_Container_Prompt_Window").innerHTML = "-";
        //document.getElementById("Time_Remaining").innerHTML = "0:00:00"
        document.getElementById("HR_Value_Span").innerHTML = "00";
        document.getElementById("MIN_Value_Span").innerHTML = "00";
        document.getElementById("SEC_Value_Span").innerHTML = "00";
        document.getElementById("Target_Temperature_Select").value = "none_selected";
        //document.getElementById("Step_Setpoint").innerHtml = "-";
        Temperature_Gauge.update({
            valueText: "-"
        });
        TurnHeaterOff();
        $("#Override_Span").hide("fast");
        TurnPumpOff();
        DeleteSnapshotFile();
        $("#Stop_Brewing_Button").hide("fast");
        $("#CurrentStepNumberDiv").hide("fast");
        $("#New_Graph_Button").show("fast");
        $("#StepToStartDiv").show("fast");
        $("#button_w2").show("fast");
        //$("#button_w3").show("fast");

        toLog = "Stop brewing button pressed";
        LogEvent(toLog);
    }

    //-------------------- End Accessory Functions ---------------------

    //----------------------  Core Functions Start Here  ---------------------------   

    /*
     * The InitializeStaticSessionContent function will be called on the start of the WebApp, and is
     * responsible for instantiating some of the initial static content such as settings, steps, various lists.
     */
    function InitializeStaticSessionContent() {

        GetStepsList();
        GetSettings();
        PopulateStepToStartList();
        //PopulateVoiceList();

    }

    /*
     * The StartMainLoop function acts as the main driver loop of the whole webpage session.
     * This function will be used to regularly ping the server for information (heartbeat) and 
     * update variables on the webpage.
     */
    function StartMainLoop() {

        if (document.getElementById("Temp_F_Radio").checked) {
            PopulateTargetTemperatureSelect_F();
        } else {
            PopulateTargetTemperatureSelect_C();
        }

        setTimeout(SendInitialInformationLog, 5000);

        MainInterval = setInterval(function() {

            //GetHeaterbeatFlag = false;
            if (GetHeaterbeatFlag == true) {
                GetHeartbeat();
            }

            document.getElementById("Current_Temperature").innerHTML = CurrentTemperature + " " + Default_Temperature_Units;
            Temperature_Gauge.value = CurrentTemperature;

            if (CurrentlyBrewing == true) {
                document.getElementById("CurrentStepValueSpan").innerHTML = CurrentStepNumber;
                if (BrewStepExecutionFlag == true) {
                    ExecuteBrewingSession();
                }
                UpdateSessionCalculations();
                var curTime = new Date().getTime();
                var brewTimeSec = (Number(curTime - BrewingStartTime) / 1000);

                // Edit: If the brew time is > 60 seconds, display the time as HH:MM:SS
                if (brewTimeSec > 60) {
                    var curHours = Math.floor(brewTimeSec / 3600);
                    brewTimeSec %= 3600;
                    var curMinutes = Math.floor(brewTimeSec / 60);
                    brewTimeSec %= 60;

                    var StringHours = String(curHours).padStart(2, "0");
                    var StringMinutes = String(curMinutes).padStart(2, "0");
                    var StringSeconds = String(brewTimeSec).padStart(2, "0");

                    document.getElementById("Elapsed_Brew_Time_Span").innerHTML = (StringHours + ":" + StringMinutes + ":" + StringSeconds);
                } else {
                    document.getElementById("Elapsed_Brew_Time_Span").innerHTML = brewTimeSec.toFixed(0) + " s";
                }

                if (MaintainTemperatureTimerEnabled == true) {

                } else if (ManualTimerEnabled == true) {
                    ManualTimerExpireTime = ManualTimerExpireTime - 1;
                    UpdateManualTimer();
                } else if (ManualTimerExpireTime > 0) {
                    UpdateManualTimer();
                }

            } else {

                if (ManualTimerEnabled == true) {
                    ManualTimerExpireTime = ManualTimerExpireTime - 1;
                    UpdateManualTimer();
                } else if (ManualTimerExpireTime > 0) {
                    UpdateManualTimer();
                }

                if (MaintainTemperatureManually == true) {
                    if (document.getElementById("Heater_Switch_Checkbox").checked == true) {
                        MaintainTemperature();
                    }
                    UpdateSessionCalculations();
                } else if (($("#Heater_Power_Slider").slider("option", "value") > 0) || document.getElementById("Pump_Switch_Checkbox").checked == true) {
                    UpdateSessionCalculations();
                }
            }

            if (Graphing_Flag == true) {
                if (Graphing_Counter >= BrewingIntervalTimeArray[BrewingIntervalTimeIndex] - 1) {
                    //UpdateChart_2();
                    UpdateChart();
                    Graphing_Counter = 0;
                } else {
                    Graphing_Counter += 1;
                }
            } else {

            }

        }, 1000);
    }

    //-----------------------  Core Functions End Here  ---------------------------- 

    //--------------------------- End Function Declarations -------------------------
    //-------------------------------------------------------------------------------

    //--------------------- Element On-Click / Other Event Handlers ----------------
    //------------------------------------------------------------------------------

    window.addEventListener('unload', function(event) {
        var url = "/resetidentity";
        var successCallback = VoidResponseHandler;

        // Generate a JS Object representing the JSON request
        var messageBodyJSObj = {
            Identity: IDENTITY
        };

        // Turn the generated JS Object into a JSON String to pass to server
        var messageBodyString = JSON.stringify(messageBodyJSObj);

        // Execute the HTTP Call
        SendToBrewBossController(url, messageBodyString, successCallback);

        toLog = "Called ResetIdentity for client " + IDENTITY;
        // LogEvent(toLog);
    });

    $("#AlertMessageBox").dialog({
        modal: true,
        buttons: {
            Ok: function() {
                $(this).dialog("close");
            }
        },
        autoOpen: false
    });

    $("#AccuFillInformationBox").dialog({
        modal: true,
        width: 350,

        autoOpen: false
    });

    $("#HopsBossInformationBox").dialog({
        modal: true,
        width: 360,

        autoOpen: false
    });

    $("#Trigger_Me").click(function() {
        TTSSpeak(" ");
        $ALARM.play();

    });

    $("#SaveStepsAsDialogBox").dialog({
        autoOpen: false,
        //height: 350,
        //width: 400,
        modal: true,
        buttons: {
            "Save": SubmitStepFile,
            Cancel: function() {
                $("#SaveStepsAsDialogBox").dialog("close");
            }
        },
        close: function() {
            document.getElementById("StepFileName").value = "";
        }
    });

    $("#StepFileName").keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#StepFileName").blur();
            SubmitStepFile();
        }
        //Stop the event from propogation to other handlers
        //If this line will be removed, then keypress event handler attached
        //at document level will also be triggered
        event.stopPropagation();
    });

    $("#AccuFillPopoverButton").click(function() {
        $("#AccuFillInformationBox").dialog("open");
        $("#AccuFillChangeFillVolumeInput").blur();
    });

    $("#HopsBossPopoverButton").click(function() {
        $("#HopsBossInformationBox").dialog("open");
    });

    $("#HopsBoss_Home_Button").click(function() {
        MoveHopsFeederPosition("0");
    });

    $("#HopsBoss_1_Button").click(function() {
        MoveHopsFeederPosition("1");
    });

    $("#HopsBoss_2_Button").click(function() {
        MoveHopsFeederPosition("2");
    });

    $("#HopsBoss_3_Button").click(function() {
        MoveHopsFeederPosition("3");
    });

    $("#HopsBoss_4_Button").click(function() {
        MoveHopsFeederPosition("4");
    });

    $("#HopsBoss_5_Button").click(function() {
        MoveHopsFeederPosition("5");
    });

    $("#HopsBoss_6_Button").click(function() {
        MoveHopsFeederPosition("6");
    });

    $(document).on('click', '#AccuFillActionButton', function() {
        var value = document.getElementById("AccuFillChangeFillVolumeInput").value;

        var properValFlag = true;

        var regex = new RegExp('^\d*(\.\d{0,2})?$');
        setTimeout(function() {
            properValFlag = regex.test(value)
        }, 0);

        if (Number(value) < 0) {
            properValFlag = false;
        }

        // other validation checks go here

        if (properValFlag == true) {
            document.getElementById("AccuFillDesiredFillVolumeValue").innerHTML = Number(value).toFixed(2);

            if (document.getElementById('Temp_F_Radio').checked == true) {

            } else {
                value = value * 0.264172; // liters --> gallons
            }

            document.getElementById("AccuFillChangeFillVolumeInput").value = "";

            PostFillVolToAccuFill(value * 10);
        } else {
            document.getElementById("AlertMessageBoxText").innerHTML = "Invalid value. Please enter a number greater than 0 and up to 2 decimal places.";
            document.getElementById("AccuFillChangeFillVolumeInput").value = "";
            $("#AlertMessageBox").dialog("open");
        }
    });

    $("#AccuFillChangeFillVolumeInput").keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#AccuFillChangeFillVolumeInput").blur();
            $("#AccuFillActionButton").trigger('click');
        }
        //Stop the event from propogation to other handlers
        //If this line will be removed, then keypress event handler attached
        //at document level will also be triggered
        event.stopPropagation();
    });

    //---------------------- Window 1 Element Interactions ------------------------

    /* 
     * This button needs to relay to the controller that it is time to start brewing
     * This button should also start graphing for whatever parameter is up
     * How to handle the brewing steps?
     */
    $("#Start_Brewing_Button").click(function() {
        TTSSpeak(" ");
        if (AudioInitialized == false) {
            $ALARM.play();
            $ALARM.setAttribute('src', 'media/alarm.mp3');
            AudioInitialized = true;
        }
        if (FermentationControlActive == true) {
            document.getElementById("AlertMessageBoxText").innerHTML = "You cannot start a brew session while fermentation control is active";
            $("#AlertMessageBox").dialog("open");
        } else {
            if (RestoringSnapshotSession == true) { // Moved this sub-routine to the snapshot specific handlers
            } else {
                if (CurrentlyBrewing == false) { // Not brewing, start brewing
                    LockInBrewSteps();
                    if (NumberBrewSessionSteps == 0) {
                        document.getElementById("AlertMessageBoxText").innerHTML = "Please load a step file, or create a new one before brewing";
                        $("#AlertMessageBox").dialog("open");
                    } else {
                        if (document.getElementById("Step_To_Start_Select").value == "none_selected") {
                            document.getElementById("Step_To_Start_Select").value = "1";
                            CurrentStepNumber = 1;
                        } else {
                            CurrentStepNumber = Number(document.getElementById("Step_To_Start_Select").value);
                        }
                        document.getElementById("Elapsed_Brew_Time_Span").innerHTML = "0 s";
                        BrewingStartTime = new Date().getTime();
                        CurrentlyBrewing = true;
                        Graphing_Flag = true;
                        MaintainTemperatureManually = false;
                        Step1Timer = 0;
                        $("#button_w2").hide("fast");
                        $("#New_Graph_Button").hide("fast");
                        $("#StepToStartDiv").hide("fast");
                        $("#Stop_Brewing_Button").show("fast");
                        $("#CurrentStepNumberDiv").show("fast");
                        toLog = "Brew Session Started";
                        LogEvent(toLog);
                    }
                } else { // Currently brewing
                    // Maybe the user wants to skip to a further step, check if there is a new value for the step select
                    var selectedStep = Number(document.getElementById("Step_To_Start_Select").value);
                    if (selectedStep != CurrentStepNumber) {
                        CurrentStepNumber = selectedStep;
                        toLog = "Changed to step number " + selectedStep;
                        SavedSetpoint = 0;
                        WaitingForStartKey = false;
                        MaintainTemperatureTimerEnabled = false;
                        Step1Timer = 0;
                        //UserChangedHeaterPower = false;
                        LogEvent(toLog);
                    } else {
                        if (WaitingForStartKey == true) {
                            StartKeyPressed = true;
                            Step1Timer = 0;
                            toLog = "Start key pressed to advance in step type 1";
                            LogEvent(toLog);
                        } else {
                            LogEvent(selectedStep);
                            LogEvent(CurrentStepNumber);

                        }
                    }
                }
            }
        }
    });

    /*
     * This button needs to indicate to the controller to stop the brewing process
     * This button should stop the graphing as well
     * Output when the brewing session is over?
     */
    $("#Stop_Brewing_Button").click(function() {

        if (CurrentlyBrewing == true) {
            StopBrewing();
            Step1Timer = 0;
            Step2Timer = 0;
            Step3Timer = 0;
            Step4Timer = 0;
            Step5Timer = 0;
            Step6Timer = 0;
            Graphing_Flag = false;
            //$("#ClearTargetTempButton").trigger('click');
            /*if (confirm("Are you sure you would like to end your current brewing session?")) {
                    StopBrewing();
                    Step1Timer = 0;
                    Step2Timer = 0;
                    Step3Timer = 0;
                    Step4Timer = 0;
                    Step5Timer = 0;
                    Step6Timer = 0;
                    Graphing_Flag = false;
                    $("#ClearTargetTempButton").trigger('click');
            } else {}*/
        }
    });

    $("#New_Graph_Button").click(function() {
        /*if (confirm("Creating a new graph will delete the current temperature history.\r\nAre you sure you would like to reset the graph?")) {

            dps_F = [];
            dps_C = [];

            if (document.getElementById("Temp_F_Radio").checked) {
                Main_Chart.data.datasets[0].data = dps_F;
            } else {
                Main_Chart.data.datasets[0].data = dps_C;
            }


            Main_Chart.update();
            Graphing_Flag = false;

        } else {

        }*/

        dps_F = [];
        dps_C = [];

        if (document.getElementById("Temp_F_Radio").checked) {
            Main_Chart.data.datasets[0].data = dps_F;
        } else {
            Main_Chart.data.datasets[0].data = dps_C;
        }


        Main_Chart.update();
        Graphing_Flag = false;
    });

    $("#Target_Temperature_Select").change(function() {
        var value = document.getElementById("Target_Temperature_Select").value;

        if (value == "none_selected") {

        } else {
            if (CurrentlyBrewing == true) {
                SetPoint = value;
                SavedSetpoint = SetPoint;
                //document.getElementById("Step_Setpoint").innerHTML = SavedSetpoint;
                Temperature_Gauge.update({
                    valueText: SavedSetpoint + '°' + Default_Temperature_Units
                });
                SaveSnapshotFile();
                toLog = "User changed target temp to " + value + " degrees " + Default_Temperature_Units;
                LogEvent(toLog);
            } else {
                SetPoint = value;
                SavedSetpoint = SetPoint;

                Temperature_Gauge.update({
                    valueText: value + '°' + Default_Temperature_Units
                });

                MaintainTemperatureManually = true;
                document.getElementById("Heater_Switch_Checkbox").checked = true;
                Graphing_Flag = true;
                toLog = "User changed target temp to " + value + " degrees " + Default_Temperature_Units + " while not brewing";
                LogEvent(toLog);
            }
        }
    });

    $("#ClearTargetTempButton").click(function() {
        if (MaintainTemperatureManually == true) {
            document.getElementById("Target_Temperature_Select").value = "none_selected";
            Temperature_Gauge.update({
                valueText: '-'
            });
            MaintainTemperatureManually = false;
            toLog = "User cleared the setpoint, turning the heater off.";
            LogEvent(toLog);
            TurnHeaterOff();
            document.getElementById("Heater_Switch_Checkbox").checked = false;
        }
    });

    //Places the Heater Power slider element in the page, and controls the functions called on action
    $("#Heater_Power_Slider").slider({
        range: "min",
        max: 100,
        value: 0,
        slide: DisplayHeaterPower,
        change: UpdateHeaterPower
    });

    $("#Heater_Power_Display").change(function() {
        var curInputValue = document.getElementById("Heater_Power_Display").value;
        if (curInputValue == $("#Heater_Power_Slider").slider('option', 'value')) {
            // Do nothing, the value was not changed
        } else { // The value was changed in the input, reflect this change in the slider and update the value on controller
            $("#Heater_Power_Slider").slider('value', curInputValue);
            if (curInputValue == 0) {
                //document.getElementById("Heater_Switch_Checkbox").checked = false;
                $("#Override_Span").hide("fast");
            } else {
                document.getElementById("Heater_Switch_Checkbox").checked = true;
                $("#Override_Span").show("fast");
            }
            UserChangedHeaterPower = true;

            Graphing_Flag = true;
        }
    });

    $("#Heater_Power_Display").keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#Heater_Power_Display").blur();
        }
        //Stop the event from propogation to other handlers
        //If this line will be removed, then keypress event handler attached
        //at document level will also be triggered
        event.stopPropagation();
    });

    $("#Heater_Switch_Checkbox").click(function() {
        var curStatus = document.getElementById("Heater_Switch_Checkbox").checked;
        switch (curStatus) {
            case true:
                var maxHeaterValue = document.getElementById("MaximumHeaterPower").value;
                TurnHeaterOn(maxHeaterValue);
                $("#Override_Span").hide("fast");
                UserChangedHeaterPower = false;
                Graphing_Flag = true;
                break;
            case false:
                TurnHeaterOff();
                $("#Override_Span").hide("fast");
                //UserChangedHeaterPower = true;
                break;
        }
    });

    //Turns the Pump on/off depending on current value
    $("#Pump_Switch_Checkbox").click(function() {
        var curStatus = document.getElementById("Pump_Switch_Checkbox").checked;
        switch (curStatus) {
            case true:
                document.getElementById("Pump_Switch_Checkbox").value = "on";
                TurnPumpOn();
                Graphing_Flag = true;
                break;
            case false:
                document.getElementById("Pump_Switch_Checkbox").value = "off";
                TurnPumpOff();
                break;
        }
    });

    $("#AccuFillProgressBar").progressbar({
        max: 1,
        value: 0
    });

    $("#Timer_Hour_Select").change(function() {

        var curValue = document.getElementById("Timer_Hour_Select").value;
        if (curValue == "none_selected") {

        } else {
            var valueInSec = ((Number(curValue) * 60) * 60);

            if (MaintainTemperatureTimerEnabled == true) {
                if (confirm("Are you sure you would like to add " + curValue + " hours to your Maintain Temperature Timer?")) {
                    TimerExpireTime += (valueInSec * 1000);
                    toLog = "User added " + curValue + " hours to the maintain temperature timer.";
                    LogEvent(toLog);
                    UpdateTimer();
                } else {}
            } else {
                var TimeRemaining = ManualTimerExpireTime;

                var numberHours = Math.floor(TimeRemaining / 3600); // 3600 sec per hour
                ManualTimerExpireTime -= (numberHours * 3600);

                ManualTimerExpireTime += valueInSec;
                UpdateManualTimer();
            }
        }

        document.getElementById("Timer_Hour_Select").value = "none_selected";
    });

    $("#Timer_Min_Select").change(function() {

        var curValue = document.getElementById("Timer_Min_Select").value;
        if (curValue == "none_selected") {

        } else {
            var valueInSec = (Number(curValue) * 60);

            if (MaintainTemperatureTimerEnabled == true) {
                if (confirm("Are you sure you would like to add " + curValue + " minutes to your Maintain Temperature Timer?")) {
                    TimerExpireTime += (valueInSec * 1000);
                    toLog = "User added " + curValue + " minutes to the maintain temperature timer.";
                    LogEvent(toLog);
                    UpdateTimer();
                } else {}
            } else {
                var TimeRemaining = ManualTimerExpireTime;
                var numberHours = Math.floor(TimeRemaining / 3600); // 3600 sec per hour
                var NewTimeRemaining = TimeRemaining - (numberHours * 3600);
                var numberMinutes = Math.floor(NewTimeRemaining / 60);

                ManualTimerExpireTime -= (numberMinutes * 60);
                ManualTimerExpireTime += valueInSec;

                UpdateManualTimer();
            }
        }

        document.getElementById("Timer_Min_Select").value = "none_selected";
    });

    $("#Timer_Sec_Select").change(function() {

        var curValue = document.getElementById("Timer_Sec_Select").value;
        if (curValue == "none_selected") {

        } else {
            var valueInSec = Number(curValue);

            if (MaintainTemperatureTimerEnabled == true) {
                if (confirm("Are you sure you would like to add " + curValue + " seconds to your Maintain Temperature Timer?")) {
                    TimerExpireTime += (valueInSec * 1000);
                    toLog = "User added " + curValue + " seconds to the maintain temperature timer.";
                    LogEvent(toLog);
                    UpdateTimer();
                } else {}
            } else {
                var TimeRemaining = ManualTimerExpireTime;
                var numberHours = Math.floor(TimeRemaining / 3600); // 3600 sec per hour
                var NewTimeRemaining = TimeRemaining - (numberHours * 3600);
                var numberMinutes = Math.floor(NewTimeRemaining / 60);
                var NewNewTimeRemaining = NewTimeRemaining - (numberMinutes * 60);
                var numberSeconds = NewNewTimeRemaining;

                ManualTimerExpireTime -= numberSeconds;
                ManualTimerExpireTime += valueInSec;
                UpdateManualTimer();
            }
        }

        document.getElementById("Timer_Sec_Select").value = "none_selected";
    });

    $("#TimerStartButton").click(function() {
        TTSSpeak(" ");
        if (AudioInitialized == false) {
            $ALARM.play();
            $ALARM.setAttribute('src', 'alarm.mp3');
            AudioInitialized = true;
        }
        if (MaintainTemperatureTimerEnabled == true) {

        } else {
            if (ManualTimerExpireTime > 0) {
                ManualTimerEnabled = true;
            }
        }
    });

    $("#TimerClearButton").click(function() {

        if (MaintainTemperatureTimerEnabled == true) {
            if (confirm("Are you sure you would like to clear the Maintain Temperature Timer?")) {
                TimerExpireTime = new Date().getTime();
            }
        } else {
            if (ManualTimerExpireTime > 0) {
                if (confirm("Are you sure you would like to clear your timer?")) {
                    ManualTimerEnabled = false;
                    ManualTimerExpireTime = 0;
                    UpdateManualTimer();
                }
            }
        }
    });

    /*
    $("#Email_Logs_Button").click(function() {
        if (confirm("Please confirm that you would like to send the app logs to Brew-Boss.")) {}
    });
    */

    //-----------------------------------------------------------------------------    

    //---------------------- Window 2 Element Interactions ------------------------

    //This function adds a row to the bottom of the Step Table when the + is clicked
    $(".table-add").click(function() {
        var $clone = $TABLE.find("tr.hide").clone(true).removeClass("hide table-line").addClass("removeRow");

        $TABLE.find("table").append($clone);

        var rows = document.getElementsByClassName("removeRow");
        var curNumber = rows.length
        var lastRow = rows[curNumber - 1];
        var cols = lastRow.getElementsByTagName('td');
        var curSelect = cols[2].getElementsByTagName('select')[0];

        // Need to determine right here which select to populate for the setpoint
        if (Default_Temperature_Units == "F") {
            for (var i = 32; i < 221; i++) {
                var newOption = document.createElement("option");
                newOption.value = i;
                newOption.text = i;
                curSelect.add(newOption);
            }
        } else {
            for (var i = 1; i < 106; i++) {
                var newOption = document.createElement("option");
                newOption.value = i;
                newOption.text = i;
                curSelect.add(newOption);
            }
        }
    });

    //This function shifts a row up one spot when the up arrow is clicked
    $(document).on('click', '.table-up', function(e) {
        var $row = $(this).parents('tr');
        if ($row.index() === 1)
            return;
        $row.prev().before($row.get(0));
    });

    //This function shifts a row down one spot when the down arrow is clicked
    $(document).on('click', '.table-down', function(e) {
        var $row = $(this).parents('tr');
        $row.next().after($row.get(0));
    });

    //This function removes a row from the Step table when the X is clicked
    $(document).on('click', '.table-remove', function(e) {
        $(this).parents('tr').detach();
    });

    //The on-click  handler for importing Beer.xml file from local file system
    $("#Import_BeerXML_Button").click(function() {

        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            //alert('The File APIs are not fully supported in this browser.');
            document.getElementById("AlertMessageBoxText").innerHTML = "The File APIs are not fully supported in this browser.";
            $("#AlertMessageBox").dialog("open");
            return;
        }

        var input = document.getElementById("Import_BeerXML_File");
        // LogEvent(input.files.length);
        if (!input) {
            //alert("File could not be found");
            document.getElementById("AlertMessageBoxText").innerHTML = "File could not be found";
            $("#AlertMessageBox").dialog("open");
        } else if (!input.files) {
            //alert("This browser doesn't seem to support the `files` property of file inputs.");
            document.getElementById("AlertMessageBoxText").innerHTML = "This browser doesn't seem to support the `files` property of file inputs.";
            $("#AlertMessageBox").dialog("open");
        } else if (!input.files[0]) {
            //alert("Please select a Beer.xml file to import!");
            document.getElementById("AlertMessageBoxText").innerHTML = "Please select a Beer.xml file to import!";
            $("#AlertMessageBox").dialog("open");
        } else {
            var BeerXMLfile = input.files[0];
            var fr = new FileReader();
            fr.readAsText(BeerXMLfile);
            fr.onloadend = function() {
                var xmlData = fr.result;
                // LogEvent(xmlData);
                // LogEvent(xmlData.length);
                ParseBeerXML(xmlData);
                document.getElementById("Import_BeerXML_File").value = "";
            };
        }

    });

    //The on-click  handler for saving changes to a brew steps file in ftp
    $("#Save_Steps_Button").click(function() {
        SaveBrewSteps("Save", Current_BrewSteps_FileName);
    });

    //The on-click handler for saving a new Brew Steps file in ftp
    $("#SaveAs_Steps_Button").click(function() {

        $("#SaveStepsAsDialogBox").dialog("open");

    });

    //The on-click handler for loading a Brew Steps file from ftp
    $("#Load_Steps_Button").click(function() {
        if (CurrentlyBrewing == true) { // Do not allow user to load new steps in middle of brewing
            //alert("Please stop your current brewing session before loading another steps file");
            document.getElementById("AlertMessageBoxText").innerHTML = "Please stop your current brewing session before loading another steps file";
            $("#AlertMessageBox").dialog("open");
        } else { // Not currently brewing, proceed with the load.
            var LoadListSelect = document.getElementById("Load_Steps_File_List");
            if (LoadListSelect.value == "none_selected") {
                //alert("Please select a file to load from the list");
                document.getElementById("AlertMessageBoxText").innerHTML = "Please select a file to load from the list";
                $("#AlertMessageBox").dialog("open");
            } else {
                GetBrewSteps(LoadListSelect.value);
                document.getElementById("Load_Steps_File_List").value = "none_selected";
            }
        }
    });

    //The on-click handler for deleting a Brew Steps file from ftp
    // TODO: More handling here, there are other cases.
    $("#Delete_Steps_Button").click(function() {
        if (CurrentlyBrewing == true) {
            //alert("Please stop your current brewing session before deleting a steps file");
            document.getElementById("AlertMessageBoxText").innerHTML = "Please stop your current brewing session before deleting a steps file";
            $("#AlertMessageBox").dialog("open");
        } else {
            var DeleteListSelect = document.getElementById("Delete_Steps_File_List");
            if (DeleteListSelect.value == "none_selected") {
                //alert("Please select a file to delete from the list");
                document.getElementById("AlertMessageBoxText").innerHTML = "Please select a file to delete from the list";
                $("#AlertMessageBox").dialog("open");
            } else if (DeleteListSelect.value == "default") {
                //alert("Unfortunately, we cannot let you delete that file");
                document.getElementById("AlertMessageBoxText").innerHTML = "Unfortunately, we cannot let you delete that file";
                $("#AlertMessageBox").dialog("open");
            } else {

                if (confirm("Please confirm that you would like to delete the following steps file:\r\n" + DeleteListSelect.value)) {

                    if (DeleteListSelect.value == document.getElementById("DefaultStepFile").value) {
                        //document.getElementById("Default_BrewSteps_Select").value = "default";
                        document.getElementById("DefaultStepFile").value = "default";
                        document.getElementById("DefaultStepFile").innerHTML = "default";
                        SaveSettings();
                        if (DeleteListSelect.value == document.getElementById("Current_Step_File").innerHTML) {
                            DeleteStepsFile(DeleteListSelect.value);
                            GetBrewSteps(document.getElementById("DefaultStepFile").value);
                        } else {
                            DeleteStepsFile(DeleteListSelect.value);
                        }
                    } else {
                        if (DeleteListSelect.value == document.getElementById("Current_Step_File").innerHTML) {
                            DeleteStepsFile(DeleteListSelect.value);
                            GetBrewSteps(document.getElementById("DefaultStepFile").value);
                        } else {
                            DeleteStepsFile(DeleteListSelect.value);
                        }
                    }

                    GetStepsList();

                } else {}
            }
        }
    });

    //-----------------------------------------------------------------------------    

    //---------------------- Window 3 Element Interactions ------------------------

    /*
     * When this button is clicked, each setting needs to correspond to a variable
     * Each variable is saved and recorded in a JSON file
     * This JSON file will be sent to / constructed in the ESP8266 and stored in the ftp for access later
     */
    $("#Save_Settings_Button").click(function() {
        // Execute the save
        SaveSettings();
    });

    $("#Reset_Default_Settings_Button").click(function() {
        if (confirm("Are you sure you would like to reset the settings to their default values?")) {
            RestoreDefaultSettings();
        }
    });

    $("#Temp_F_Radio").click(function() {

        PopulateTargetTemperatureSelect_F();
        Default_Temperature_Units = "F";

        document.getElementById("SetpointUnits").innerHTML = "(°F)";
        document.getElementById("FillVolUnits").innerHTML = "(G)";

        document.getElementById("AccuFillVolumeFilledValueUnits").innerHTML = " G";
        document.getElementById("AccuFillDesiredFillVolumeValueUnits").innerHTML = " G";
        document.getElementById("AccuFillChangeFillVolumeInputUnits").innerHTML = " G";

        Main_Chart.options.scales.yAxes[0].ticks.max = MinMaxArray_F[Y_Axis_Index][2];
        Main_Chart.options.scales.yAxes[0].ticks.stepSize = MinMaxArray_F[Y_Axis_Index][3];
        Main_Chart.data.datasets[0].data = dps_F;

        Temperature_Gauge.update({
            majorTicks: [
                '50', '75', '100', '125', '150', '175', '200', '225'
            ],
            value: 50,
            minorTicks: 5,
            minValue: 50,
            maxValue: 225,
            title: '°' + Default_Temperature_Units,
            valueText: 0 + '°' + Default_Temperature_Units
        });



        ConvertBrewStepsFileUOM("F");
    });

    $("#Temp_C_Radio").click(function() {

        PopulateTargetTemperatureSelect_C();
        Default_Temperature_Units = "C";

        document.getElementById("SetpointUnits").innerHTML = "(°C)";
        document.getElementById("FillVolUnits").innerHTML = "(L)";

        document.getElementById("AccuFillVolumeFilledValueUnits").innerHTML = " L";
        document.getElementById("AccuFillDesiredFillVolumeValueUnits").innerHTML = " L";
        document.getElementById("AccuFillChangeFillVolumeInputUnits").innerHTML = " L";

        Main_Chart.options.scales.yAxes[0].ticks.max = MinMaxArray_C[Y_Axis_Index][2];
        Main_Chart.options.scales.yAxes[0].ticks.stepSize = MinMaxArray_C[Y_Axis_Index][3];
        Main_Chart.data.datasets[0].data = dps_C;

        Temperature_Gauge.update({
            majorTicks: [
                '10', '20', '30', '40', '50', '60', '70', '80', '90', '100', '110'
            ],
            value: 10,
            minorTicks: 2,
            minValue: 10,
            maxValue: 110,
            title: '°' + Default_Temperature_Units,
            valueText: 0 + '°' + Default_Temperature_Units

        });

        ConvertBrewStepsFileUOM("C");
    });

    $("#UserEmail").keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#UserEmail").blur();
        }
        //Stop the event from propogation to other handlers
        //If this line will be removed, then keypress event handler attached
        //at document level will also be triggered
        event.stopPropagation();
    });

    $("#Heater_Watts").keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#Heater_Watts").blur();
        }
        //Stop the event from propogation to other handlers
        //If this line will be removed, then keypress event handler attached
        //at document level will also be triggered
        event.stopPropagation();
    });

    $("#CPKWH").keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#CPKWH").blur();
        }
        //Stop the event from propogation to other handlers
        //If this line will be removed, then keypress event handler attached
        //at document level will also be triggered
        event.stopPropagation();
    });

    $("#Accufill_Initial_Fill_Volume").keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#Accufill_Initial_Fill_Volume").blur();
        }
        //Stop the event from propogation to other handlers
        //If this line will be removed, then keypress event handler attached
        //at document level will also be triggered
        event.stopPropagation();
    });

    $("#HBMSCC").keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#HBMSCC").blur();
        }
        //Stop the event from propogation to other handlers
        //If this line will be removed, then keypress event handler attached
        //at document level will also be triggered
        event.stopPropagation();
    });

    $("#MaximumHeaterPower").keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#MaximumHeaterPower").blur();
        }
        //Stop the event from propogation to other handlers
        //If this line will be removed, then keypress event handler attached
        //at document level will also be triggered
        event.stopPropagation();
    });

    $("#BoilDetectTime").keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#BoilDetectTime").blur();
        }
        //Stop the event from propogation to other handlers
        //If this line will be removed, then keypress event handler attached
        //at document level will also be triggered
        event.stopPropagation();
    });

    $("#DeltaT1").keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#DeltaT1").blur();
        }
        //Stop the event from propogation to other handlers
        //If this line will be removed, then keypress event handler attached
        //at document level will also be triggered
        event.stopPropagation();
    });

    $("#DeltaT2").keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#DeltaT2").blur();
        }
        //Stop the event from propogation to other handlers
        //If this line will be removed, then keypress event handler attached
        //at document level will also be triggered
        event.stopPropagation();
    });

    $("#PwrS").keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#PwrS").blur();
        }
        //Stop the event from propogation to other handlers
        //If this line will be removed, then keypress event handler attached
        //at document level will also be triggered
        event.stopPropagation();
    });

    $("#PwrL").keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#PwrL").blur();
        }
        //Stop the event from propogation to other handlers
        //If this line will be removed, then keypress event handler attached
        //at document level will also be triggered
        event.stopPropagation();
    });

    $("#PwrM").keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#PwrM").blur();
        }
        //Stop the event from propogation to other handlers
        //If this line will be removed, then keypress event handler attached
        //at document level will also be triggered
        event.stopPropagation();
    });

    $("#PwrB").keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $("#PwrB").blur();
        }
        //Stop the event from propogation to other handlers
        //If this line will be removed, then keypress event handler attached
        //at document level will also be triggered
        event.stopPropagation();
    });

    $("#Update_Interval_Select").change(function() {
        var selectValue = document.getElementById("Update_Interval_Select").value;

        switch (selectValue) {

            case "0":
                BrewingIntervalTimeIndex = 0; // 1 second
                break;
            case "1":
                BrewingIntervalTimeIndex = 1; // 2 seconds
                break;
            case "2":
                BrewingIntervalTimeIndex = 2; // 5 seconds
                break;
            case "3":
                BrewingIntervalTimeIndex = 3; // 10 seconds
                break;
        }

    });

    // --------------- Color On-Click Handlers ----------------------

    $("#Border_Primary_Color").change(function() {

        var value = $(this).prop("value");

        ChangePrimaryBorderColor(value);

    });

    $("#Border_Secondary_Color").change(function() {

        var value = $(this).prop("value");

        ChangeSecondaryBorderColor(value);

    });

    $("#Text_Primary_Color").change(function() {

        var value = $(this).prop("value");

        ChangePrimaryTextColor(value);

    });

    $("#Text_Secondary_Color").change(function() {

        var value = $(this).prop("value");

        ChangeSecondaryTextColor(value);

    });

    $("#Text_Tertiary_Color").change(function() {

        var value = $(this).prop("value");

        ChangeTertiaryTextColor(value);

    });

    $("#Graph_Axis_Primary_Color").change(function() {

        var value = $(this).prop("value");

        ChangeGraphPrimaryBorderColor(value);

    });

    $("#Graph_Axis_Secondary_Color").change(function() {

        var value = $(this).prop("value");

        ChangeGraphSecondaryBorderColor(value);

    });

    $("#Graph_Text_Primary_Color").change(function() {

        var value = $(this).prop("value");

        ChangeGraphPrimaryTextColor(value);

    });

    $("#Graph_Text_Secondary_Color").change(function() {

        var value = $(this).prop("value");

        ChangeGraphSecondaryTextColor(value);

    });

    $("#Graph_Text_Tertiary_Color").change(function() {

        var value = $(this).prop("value");

        ChangeGraphTertiaryTextColor(value);

    });

    function hexToRgbA(hex) {
        var c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(', ') + ', 1)';
        }
        throw new Error('Bad Hex');
    }

    function ChangeBackgroundColor(value) {

        $("body").css('background-color', value);
        $("#Preferences_Navbar").css('background-color', value);
        $("#Main_Navbar").css('background-color', value);
        $(".Pref_Number").css('background', value);
        //$("#NewFileName").css('background-color', value);
        $("#UserEmail").css('background-color', value);
        //$("#").css('color', value);

        Chart_Background_Color = value;
        //Main_Chart.set("backgroundColor", value);

    }

    function ChangePrimaryBorderColor(value) {
        $("#Brewing_Steps_Container").css('border', "1px solid " + value);
        $("#Settings_Container").css('border', "1px solid " + value);
        $("#Current_Brew_Session_Container").css('border', "1px solid " + value);
        $("#Gauges_Row").css('border-left', "1px solid " + value);
        $("#Gauges_Row").css('border-top', "1px solid " + value);
        $("#Window_1_B_1_a").css('border-top', "1px solid " + value);
        $("#Window_1_B_1_a").css('border-bottom', "1px solid " + value);
        $("#Window_1_B_2_a_1").css('border-left', "1px solid " + value);
        $("#Window_1_B_2_a_1").css('border-top', "1px solid " + value);
        $("#Window_1_B_2_a_2").css('border-left', "1px solid " + value);
        $("#Window_1_B_2_a_2").css('border-top', "1px solid " + value);
        $("#Window_1_B_2_a_3").css('border-left', "1px solid " + value);
        $("#Window_1_B_2_a_3").css('border-top', "1px solid " + value);
        $("#Window_1_B_2_b").css('border-left', "1px solid " + value);
        $("#Window_1_B_2_b").css('border-top', "1px solid " + value);
        $("#Window_1_B_2_c").css('border-left', "1px solid " + value);
        $(".ui-state-default, .ui-widget-content .ui-state-default").css('background', value);
        $("#Window_2_A_1").css('border-top', "1px solid " + value);
        $("#Window_2_A_2").css('border-left', "1px solid " + value);
        $("#Window_2_A_2").css('border-top', "1px solid " + value);
        $("#Preferences_Navbar").css('border-bottom', "1px solid " + value);
        $("#Main_Navbar").css('border-bottom', "1px solid " + value);
        $("#Window_3_A_1").css('border-right', "1px solid " + value);
        //$("#Window_3_A_2_b_2").css('border', "1px solid " + value);
        //$("#Window_3_A_2_b_2_a").css('border-top', "1px solid " + value);
        //$("#Window_3_A_2_b_2_a").css('border-right', "1px solid " + value);
        //$("#Window_3_A_2_b_2_b").css('border-top', "1px solid " + value);
        $("#Brewing_Steps_Heading").css('border-bottom', "1px solid " + value);
        $("#Brewing_Steps_Table th").css('border-bottom', "1px solid " + value);
        //$("#").css('color', value);

        $(".nav-item").css("border-left", "1px solid " + value);
        $(".nav-item").css("border-right", "1px solid " + value);
        $(".nav-item").css("border-bottom-color", value);

        $("#AccuFillInformationBox").css('border', "2px solid " + value);
        $("#AccuFillInformationBox").css('border-top', "none");
        $(".ui-dialog-titlebar").css('border', "2px solid " + value);
        $("#AccuFillPopoverRow1").css('border-bottom', "1px dotted " + value);
        $("#SaveStepsAsDialogBox").css('border', "2px solid " + value);
        $("#SaveStepsAsDialogBox").css('border-top', "none");
        $(".ui-dialog-buttonpane").css('border', "2px solid " + value);
        $(".ui-dialog-buttonpane").css('border-top', "none");
        $("#AlertMessageBox").css('border', "2px solid " + value);
        $("#AlertMessageBox").css('border-top', "none");
        $("#AlertMessageBox").css('border-bottom', "none");
        $("#HopsBossInformationBox").css('border', "2px solid " + value);
        $("#HopsBossInformationBox").css('border-top', "none");

        var ColorString = hexToRgbA(value);
        var urlString = "url(\"data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='" + ColorString.toString() + "' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E\")";
        $("#Main_Toggler").css('background-image', urlString);

    }

    function ChangeSecondaryBorderColor(value) {

        $(".Stat_Header").css('border-bottom', "1px solid " + value);
        $("#Current_Brew_Session_Container_Prompt_Window").css('border', "1px solid " + value);
        $("#Brew_Steps_Description").css('border-bottom', "1px solid " + value);
        $("#Brew_Steps_Save_Description").css('border-top', "1px solid " + value);
        $("#Brew_Steps_SaveAs_Description").css('border-top', "1px solid " + value);
        //$("#NewFileName").css('border-bottom', "1px solid " + value);
        $("#Brew_Steps_Load_Description").css('border-top', "1px solid " + value);
        $("#Brew_Steps_Delete_Description").css('border-top', "1px solid " + value);
        $(".Sub_Setting_Heading").css('border-bottom', "1px solid " + value);
        $(".Pref_Number").css('border-bottom-color', value);
        $("#DefaultStepFile").css('border-bottom-color', value);
        $(".Sub_Window_Heading").css('border-bottom', "1px solid " + value);
        $("#UserEmail").css('border-bottom', "1px solid " + value);
        $("#CurrentStepHeaderSpan").css('border-bottom', "1px solid " + value);
        $("#Elapsed_Brew_Time_Title").css('border-bottom-color', value);
        $("#Total_KWH_Used_Title").css('border-bottom-color', value);
        $("#Total_Brewing_Cost_Title").css('border-bottom-color', value);
        $(".ui-widget-header").css('background', value);
        $(".ui-dialog-titlebar").css('background', "black");
        $("#BeerXMLImportCardHeader").css('border', "1px solid " + value);
        $("#BeerXMLImportCollapse").css('border-left', "1px dashed " + value);
        $("#BeerXMLImportCollapse").css('border-bottom', "1px dashed " + value);
        $("#BeerXMLImportCollapse").css('border-right', "1px dashed " + value);
        $("#AccuFillFillPercentage").css('color', value);
        //$("#").css('color', value);

        $("#HR_Title_Span").css('border-bottom', "1px solid " + value);
        $("#MIN_Title_Span").css('border-bottom', "1px solid " + value);
        $("#SEC_Title_Span").css('border-bottom', "1px solid " + value);

        $("#AccuFillStatusHeader").css('border-bottom', "1px solid " + value);
        $("#AccuFillVolumeFilledHeader").css('border-bottom', "1px solid " + value);
        $("#AccuFillCalibrationHeader").css('border-bottom', "1px solid " + value);
        $("#AccuFillDesiredFillVolumeHeader").css('border-bottom', "1px solid " + value);
        $("#AccuFillChangeFillVolumeInput").css('border-bottom', "1px solid " + value);

        $("#StepFileName").css('border-bottom', "1px solid " + value);

        $("#Brewing_Steps_Table td").css('border-bottom', "1px solid " + value);

        var ColorString = hexToRgbA(value);
        var urlString = "url(\"data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='" + ColorString.toString() + "' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E\")";
        $("#Preferences_Toggler").css('background-image', urlString);
    }

    function ChangePrimaryTextColor(value) {
        $(".Stat_Header").css('color', value);
        $("#Current_Brew_Session_Container_Heading").css('color', value);
        $("#Brewing_Steps_Heading").css('color', value);
        $("#Brewing_Steps_Table th").css('color', value);
        $(".Settings_List").css('color', value);
        $(".Controllers_Pref_List").css('color', value);
        $("#Pref_Navbar_Brand").css('color', value);
        $(".Sub_Setting_Heading").css('color', value);
        $("#BeerXMLImportButton").css('color', value);
        $(".ui-dialog-titlebar").css('color', value);
        //$("#").css('color', value);

    }

    function ChangeSecondaryTextColor(value) {

        $("#Current_Brew_Session_Container_Prompt_Window").css('color', value);
        //$(".ui-widget-header").css('background', value);
        $(".navbar-dark .navbar-nav .nav-link").css('color', value);
        $("#Brew_Steps_Description").css('color', value);
        $("#Import_BeerXML_Description").css('color', value);
        $("#Brew_Steps_Save_Description").css('color', value);
        $("#Brew_Steps_SaveAs_Description").css('color', value);
        $("#Brew_Steps_Load_Description").css('color', value);
        $("#Brew_Steps_Delete_Description").css('color', value);
        $("#Save_Settings_Description").css('color', value);
        $(".Setting_Description").css('color', value);
        $("#Pump_List").css('color', value);
        $("#Elapsed_Brew_Time_Title").css('color', value);
        $("#Total_KWH_Used_Title").css('color', value);
        $("#Total_Brewing_Cost_Title").css('color', value);
        $("#CurrentStepHeaderSpan").css('color', value);
        $("#Heater_Button").css('color', value);
        $("#Pump_Button").css('color', value);
        $("#Brew_Session_List").css('color', value);
        $("#Target_Temp_List_Item").css('color', value);
        //$("#").css('color', value);

        $("#HR_Title_Span").css('color', value);
        $("#MIN_Title_Span").css('color', value);
        $("#SEC_Title_Span").css('color', value);

        $("#AccuFillStatusHeader").css('color', value);
        $("#AccuFillVolumeFilledHeader").css('color', value);
        $("#AccuFillCalibrationHeader").css('color', value);
        $("#AccuFillDesiredFillVolumeHeader").css('color', value);

        $("#SaveStepsAsDialogBox").css('color', value);
        $("#AlertMessageBox").css('color', value);

        $("#HopsBossInformationalParagraph").css('color', value);

        $("#HeaterPowerDisplay").css('color', value);
        //$("#Brew_Stats_List").css('color', value);

        $("#AccuFill_Accessory_List").css('color', value);
        $("#Hops_Boss_Accessory_List").css('color', value);

    }

    function ChangeTertiaryTextColor(value) {
        $("#Heater_Power_Display").css('color', value);
        $("#HopsBoss_Pos").css('color', value);
        $("#Heater_Status").css('color', value);
        //$(".Stat_Display_Window").css('color', value);
        $("#Pump_Status_Display").css('color', value);
        $("#Brewing_Steps_Table td").css('color', value);
        $("#DefaultStepFile").css('color', value);
        $("#F_Value").css('color', value);
        $("#C_Value").css('color', value);
        $(".Pref_Number").css('color', value);
        //$("#NewFileName").css('color', value);
        $("#Current_Step_File").css('color', value);
        $("#UserEmail").css('color', value);
        $("#Import_BeerXML_File").css('color', value);
        $("#Time_Remaining").css('color', value);
        $("#Current_Temperature").css('color', value);
        $("#CurrentStepValueSpan").css('color', value);
        $("#Elapsed_Brew_Time_Span").css('color', value);
        $("#Total_KWH_Used_Span").css('color', value);
        $("#Total_Brewing_Cost_Span").css('color', value);
        $("#Misc").css('color', value);
        $("#Override_Span").css('color', value);
        $("#HopsBossPosition").css('color', value);
        $("#AccuFillFillVolume").css('color', value);
        //$("#").css('color', value);

        $("#HR_Value_Span").css('color', value);
        $("#MIN_Value_Span").css('color', value);
        $("#SEC_Value_Span").css('color', value);

        $("#AccuFillStatusValue").css('color', value);
        $("#AccuFillVolumeFilledValue").css('color', value);
        $("#AccuFillVolumeFilledValueUnits").css('color', value);
        $("#AccuFillCalibrationValue").css('color', value);
        $("#AccuFillDesiredFillVolumeValue").css('color', value);
        $("#AccuFillDesiredFillVolumeValueUnits").css('color', value);
        $("#AccuFillChangeFillVolumeInput").css('color', value);
        $("#AccuFillChangeFillVolumeInputUnits").css('color', value);
        $("#StepFileName").css('color', value);
        $("#HopsBossCurrentPosition").css('color', value);

    }

    function ChangeGraphPrimaryBorderColor(value) {
        Chart_Primary_Axis_Color = value;

        Main_Chart.options.scales.yAxes[0].gridLines.zeroLineColor = value;
        Main_Chart.options.scales.xAxes[0].gridLines.zeroLineColor = value;

        //Main_Chart.data[0].set("lineColor", value, false);
        //Main_Chart.axisX[0].set("lineColor", value, false);
        //Main_Chart.axisY[0].set("lineColor", value);
    }

    function ChangeGraphSecondaryBorderColor(value) {
        Chart_Secondary_Axis_Color = value;

        Main_Chart.data.datasets[0].borderColor = value;

        //Main_Chart.axisY[0].set("gridColor", value);
    }

    function ChangeGraphPrimaryTextColor(value) {
        Chart_Primary_Text_Color = value;

        Main_Chart.options.title.fontColor = value;
        Main_Chart.options.scales.yAxes[0].scaleLabel.fontColor = value;
        Main_Chart.options.scales.xAxes[0].scaleLabel.fontColor = value;


        //Main_Chart.title.set("fontColor", value, false);
        //Main_Chart.axisX[0].set("titleFontColor", value, false);
        //Main_Chart.axisY[0].set("titleFontColor", value);

    }

    function ChangeGraphSecondaryTextColor(value) {
        Chart_Secondary_Text_Color = value;

        Main_Chart.options.scales.yAxes[0].ticks.major.fontColor = value;
        Main_Chart.options.scales.yAxes[0].ticks.minor.fontColor = value;
        Main_Chart.options.scales.yAxes[0].ticks.fontColor = value;
        Main_Chart.options.scales.xAxes[0].ticks.major.fontColor = value;
        Main_Chart.options.scales.xAxes[0].ticks.minor.fontColor = value;
        Main_Chart.options.scales.xAxes[0].ticks.fontColor = value;


        //Main_Chart.axisX[0].set("labelFontColor", value, false);
        //Main_Chart.axisY[0].set("labelFontColor", value);
    }

    function ChangeGraphTertiaryTextColor(value) {
        Chart_Tertiary_Text_Color = value;

        //Main_Chart.data.datasets[0].pointBackgroundColor = value;
        //Main_Chart.data[0].set("color", value);
    }

    // ------------------End Color -------------------------

    // ---------------- Sound Options ---------------------

    //Places the Heater Power slider element in the page, and controls the functions called on action
    $("#Voice_Rate_Slider").slider({
        range: "min",
        step: 0.1,
        min: 0.5,
        max: 2,
        value: 1,
        slide: DisplayRate,
        change: DisplayRate
    });

    function DisplayRate() {
        document.getElementById("Voice_Rate_Display").innerHTML = $("#Voice_Rate_Slider").slider("option", "value");
    }

    //Places the Heater Power slider element in the page, and controls the functions called on action
    $("#Voice_Pitch_Slider").slider({
        range: "min",
        step: 0.1,
        min: 0,
        max: 2,
        value: 1,
        slide: DisplayPitch,
        change: DisplayPitch
    });

    function DisplayPitch() {
        document.getElementById("Voice_Pitch_Display").innerHTML = $("#Voice_Pitch_Slider").slider("option", "value");
    }

    // ----------------- End Sound -------------------------------

    //----------------- Functions to control the Settings tab displays --------

    $("#button_s1").click(function() {

        document.getElementById("BeerXMLImportButton").className = "btn collapsed";
        document.getElementById("BeerXMLImportCollapse").className = "collapse";

        //$("#Window_3_A_2_c").hide();
        $("#Window_3_A_2_b").hide();
        $("#Window_3_A_2_d").hide();
        $("#Window_3_A_2_e").hide();
        $("#NavItemS2").css("border-bottom-style", "none");
        $("#NavItemS3").css("border-bottom-style", "none");
        $("#NavItemS4").css("border-bottom-style", "none");
        $("#NavItemS1").css("border-bottom-style", "solid");
        $("#Window_3_A_2_a").show();
        document.getElementById("collapsibleNavbar_S").className = "navbar-collapse justify-content-end collapse";
    });

    $("#button_s2").click(function() {
        $("#Window_3_A_2_a").hide();
        //$("#Window_3_A_2_c").hide();
        $("#Window_3_A_2_d").hide();
        $("#Window_3_A_2_e").hide();
        $("#NavItemS1").css("border-bottom-style", "none");
        $("#NavItemS3").css("border-bottom-style", "none");
        $("#NavItemS4").css("border-bottom-style", "none");
        $("#NavItemS2").css("border-bottom-style", "solid");
        $("#Window_3_A_2_b").show();
        document.getElementById("collapsibleNavbar_S").className = "navbar-collapse justify-content-end collapse";
    });

    $("#button_s4").click(function() {
        $("#Window_3_A_2_a").hide();
        //$("#Window_3_A_2_c").hide();
        $("#Window_3_A_2_b").hide();
        $("#Window_3_A_2_e").hide();
        $("#NavItemS1").css("border-bottom-style", "none");
        $("#NavItemS2").css("border-bottom-style", "none");
        $("#NavItemS4").css("border-bottom-style", "none");
        $("#NavItemS3").css("border-bottom-style", "solid");
        $("#Window_3_A_2_d").show();
        document.getElementById("collapsibleNavbar_S").className = "navbar-collapse justify-content-end collapse";
    });

    $("#button_s5").click(function() {
        $("#Window_3_A_2_a").hide();
        //$("#Window_3_A_2_c").hide();
        $("#Window_3_A_2_b").hide();
        $("#Window_3_A_2_d").hide();
        $("#NavItemS1").css("border-bottom-style", "none");
        $("#NavItemS2").css("border-bottom-style", "none");
        $("#NavItemS3").css("border-bottom-style", "none");
        $("#NavItemS4").css("border-bottom-style", "solid");
        $("#Window_3_A_2_e").show();
        document.getElementById("collapsibleNavbar_S").className = "navbar-collapse justify-content-end collapse";
    });

    //-----------------------------------------------------------------------------      

    //---------- Functions to control the tab hiding/showing on clicks ------------

    $("#button_w1").click(function() {
        $("#Brewing_Steps_Container").hide("fast");
        $("#Settings_Container").hide("fast");
        //$("#BrewBoss_History_Container").hide("fast");
        //$("#Contact_Us_Container").hide("fast");
        $("#NavItemM2").css("border-bottom-style", "none");
        $("#NavItemM3").css("border-bottom-style", "none");
        $("#NavItemM1").css("border-bottom-style", "solid");
        $("#Current_Brew_Session_Container").show("fast");

        PopulateStepToStartList();
        if (CurrentStepNumber == 0) {
            document.getElementById("Step_To_Start_Select").value = "none_selected";
        } else {
            document.getElementById("Step_To_Start_Select").value = CurrentStepNumber;
        }

        Main_Chart.render();
        document.getElementById("collapsibleNavbar_M").className = "navbar-collapse justify-content-start collapse";
        document.getElementById("collapsibleNavbar_S").className = "navbar-collapse justify-content-end collapse";
    });

    $("#button_w2").click(function() {
        $("[data-toggle=popover]").popover("hide");
        $("#Current_Brew_Session_Container").hide("fast");
        $("#Settings_Container").hide("fast");
        //$("#BrewBoss_History_Container").hide("fast");
        //$("#Contact_Us_Container").hide("fast");
        $("#NavItemM1").css("border-bottom-style", "none");
        $("#NavItemM3").css("border-bottom-style", "none");
        $("#NavItemM2").css("border-bottom-style", "solid");
        $("#Brewing_Steps_Container").show("fast");
        document.getElementById("collapsibleNavbar_M").className = "navbar-collapse justify-content-start collapse";
        document.getElementById("collapsibleNavbar_S").className = "navbar-collapse justify-content-end collapse";

        //PopulateVoiceList();
    });

    $("#button_w3").click(function() {
        $("[data-toggle=popover]").popover("hide");
        document.getElementById("BeerXMLImportButton").className = "btn collapsed";
        document.getElementById("BeerXMLImportCollapse").className = "collapse";

        $("#Current_Brew_Session_Container").hide("fast");
        $("#Brewing_Steps_Container").hide("fast");
        //$("#BrewBoss_History_Container").hide("fast");
        //$("#Contact_Us_Container").hide("fast");
        $("#NavItemM1").css("border-bottom-style", "none");
        $("#NavItemM2").css("border-bottom-style", "none");
        $("#NavItemM3").css("border-bottom-style", "solid");
        $("#Settings_Container").show("fast");

        $("#NavItemS2").css("border-bottom-style", "none");
        $("#NavItemS3").css("border-bottom-style", "none");
        $("#NavItemS4").css("border-bottom-style", "none");
        $("#NavItemS1").css("border-bottom-style", "solid");

        // This sequence of steps ensures the first setting tab is shown when navigating to tab
        $("#Window_3_A_2_b").hide();
        $("#Window_3_A_2_c").hide();
        $("#Window_3_A_2_d").hide();
        $("#Window_3_A_2_e").hide();
        $("#Window_3_A_2_a").show();

        document.getElementById("collapsibleNavbar_M").className = "navbar-collapse justify-content-start collapse";

        //PopulateVoiceList();
    });

    //-----------------------------------------------------------------------------

    //------------------- End Element On-Click / Other Event Handlers --------------
    //------------------------------------------------------------------------------

    // ------------------ MAIN ------------------

    // Initialize settings, step file, lists etc.
    InitializeStaticSessionContent();

    // Main driver, this begins the whole app processing sequence
    StartMainLoop();

    // Required to initialize the sound playback capability (1 action required)
    $("#Trigger_Me").click();

    // ---------------End MAIN ------------------

});