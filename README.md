# Brew-Boss WebApp Overview

## Background & Purpose
```
Darin is the owner of a small business named Brew-Boss based out of south-eastern Wisconsin. Brew-Boss specializes in selling automated electric brewing systems for individuals who want to brew their own craft beer as a hobby. Darin and I met at a bar where I was working on weekends during the summer of 2017. After having a good conversation about background and what he was looking for, he invited me to come out to his shop to have a more in-depth discussion on what he was looking for.

Darin wanted an app built that allowed his customers to control / automate the brew sessions from a mobile device. He already had an Android application on the Google Play Store that essentially performed the same functionality as the app I made for him; however, he wanted a cross-platform WebApp created so that users were not forced into using Android devices. The target user-group for the WebApp includes Android and iOs tablet users, although it can also function just as well in a computer browser.

Darin and I worked together to identify the main features he was looking for in the application. Some examples include: 

- Temperature History Graph 
- Current Temperature Gauge
- Ability to Add / Edit / Import step files for various types of brew sessions 
- Full automation capabilities
- Ability to change between F / C. 

Some extra features I added include: 

- Full application look / feel customization
- Logging
- Single-page tab structure.

Over the course of 10-12 months, I worked closely with Darin to turn his overall idea into a particular set of specifications and functionalities, and single-handedly designed, developed, and delivered the final product to him. The WebApp is used by over 3000 customers.
```

## Components
```
The Web-App can be broken down into 2 main component categories: 

- The Server-Side (ESP8266 Microprocessor) firmware.
- The Client-Side WebApp components

The Server-Side firmware includes all of Darin's pre-existing functionality to automate his brewing equiptment for customers on his rudimentary controller, as well as the pre-existing functionality required for his Android application. In my work for Darin, I added the necessary functionality into his firmware that allowed the microprocessor to:

- Act as a host for the Client-Side WebApp
- Map the actions of the WebApp to necessary actions of the brewing automation process of various pieces of equipment
- Act as a RESTful web server for over 20 endpoints that are used in the WebApp
- Handle Logging capabilities
- Interact with its local flash memory system (SPIFFS) to persist application settings
- Interact with SPIFFS to store / retrieve / modify brew step files so the user could save various step sequences for future use

Due to proprietary restrictions / agreements, the entire firmware source code cannot be uploaded with this project; however, I have included the new pieces of functionality that I was solely responsible for designing and creating. The functionality included in the ESP8266_Firmware.ino file is all the new code that I added to his existing firmware to make the WebApp wwork.

The Client-Side WebApp components include various html, css, javascript, and dependenciy files / media that are all used in the source code for creating the WebApp's UI and functionality. The WebApp is hosted on the ESP8266 microprocessor and uses the custom-built web server to send isolated http requests to perform and sync various functionalities.
```

## Usage
```
The WebApp is not publicly accessible. Each customer has a controller built by Brew-Bross and included with the purchase of brewing automation equipment. The WebApp is hosted locally on the ESP8266 device, and operates in an isolated capacity with its own IP address, Memory, etc. In order to interact with the application, you would need to own one of the controllers.

I have included screenshots of the various screens / functionalities of the application so that you can get a sense of what the app does / looks like.
```