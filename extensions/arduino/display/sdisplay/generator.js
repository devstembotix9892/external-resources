/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addGenerator (Blockly) {
    // Blockly.Arduino.stembotixLCD_init = function (block) {
    //     const de = block.getFieldValue('DE');
    //     const csn = block.getFieldValue('CSN');
    //     // const id = Blockly.Arduino.valueToCode(block, 'RST', Blockly.Arduino.ORDER_ATOMIC);
    //     const rst = block.getFieldValue('RST');

    //     Blockly.Arduino.includes_.stembotixLCD_init = `#include <Adafruit_GFX.h>\n#include <Adafruit_ST7735.h>\n#include <SPI.h>`;
    //     // Blockly.Arduino.definitions_.stembotixLCD_init = `Openblock_nrf stembotixLCD;`;
    //     // Blockly.Arduino.definitions_.stembotixLCD_init = `Blockzie stembotixLCD;`;

    //     return `stembotixLCD.init(${rst}, ${de}, ${csn});\n`;
    // };

    Blockly.Arduino.sdisplay_init = function (block) {
        const csn = block.getFieldValue('CSN');   // Chip Select pin
        const rst = block.getFieldValue('RST'); // Reset pin
        const dc = block.getFieldValue('DE');   // Data/Command pin
    
        // Include necessary libraries
        Blockly.Arduino.includes_.sdisplay_init =
            `#include <Adafruit_GFX.h>\n` +
            `#include <Adafruit_ST7735.h>\n` ;
            // `#include <SPI.h>\n` +
            `#include "image_data.h"\n` ;
          

        
        // Define pinsx
        Blockly.Arduino.definitions_.sdisplay_pins =
            `#define TFT_CSN ${csn}\n` +
            `#define TFT_RST ${rst}\n` +
            `#define TFT_DC ${dc}\n`;
    
        // Declare the TFT object globally
        Blockly.Arduino.definitions_.sdisplay_object =
            `Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CSN, TFT_DC, TFT_RST);\n`;
    
        // Initialize the TFT screen in setup
        Blockly.Arduino.setups_.sdisplay_init =
        `Serial.begin(115200);\n`;
        
        
        // `tft.println("Hello STEMbotix!");\n`; 
        
    };
    
    // Blockly.Arduino.stembotixLCD_sendString = function (block) {
    //     const data = Blockly.Arduino.valueToCode(block, 'DATA', Blockly.Arduino.ORDER_ATOMIC);
    //     // const id = Blockly.Arduino.valueToCode(block, 'ID', Blockly.Arduino.ORDER_ATOMIC);

    //     return `stembotixLCD.sendString(${data});\n`;
    // };

    Blockly.Arduino.sdisplay_sendString = function (block) {
        var data = Blockly.Arduino.valueToCode(block, 'DATA', Blockly.Arduino.ORDER_ATOMIC) || '""';
    
        return `sdisplay.print(${data});\n`;
    };
    
    Blockly.Arduino.sdisplay_type = function (block) {
        var lcdType = block.getFieldValue('TYPE') || 'INITR_BLACKTAB'; // Default to INITR_BLACKTAB
    
        return `sdisplay.initR(${lcdType});\n`;
    };

    Blockly.Arduino['sdisplay_initDisplay'] = function (block) {
        var code = 'Serial.println("Initializing Display...");\n';
                  
        return code;
    };
    
    Blockly.Arduino['sdisplay_setTextColor'] = function (block) {
        var color = block.getFieldValue('COLOR');
        var code = 'sdisplay.setTextColor(' + color + ');\n';
        return code;
    };
    
    Blockly.Arduino['sdisplay_setTextSize'] = function (block) {
        var size = Blockly.Arduino.valueToCode(block, 'SIZE', Blockly.Arduino.ORDER_ATOMIC);
        var code = 'sdisplay.setTextSize(' + size + ');\n';
        return code;
    };
    
    Blockly.Arduino['sdisplay_setCursor'] = function (block) {
        var x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC);
        var y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC);
        var code = 'sdisplay.setCursor(' + x + ', ' + y + ');\n';
        return code;
    };

    Blockly.Arduino['sdisplay_fillScreen'] = function (block) {
        var color = block.getFieldValue('COLOR');
        // Convert the selected color into a suitable Arduino value (like a predefined color constant)
        var code = 'sdisplay.fillScreen(' + color + ');\n';
        return code;
    };

    Blockly.Arduino['sdisplay_setRotation'] = function (block) {
        var rotation = block.getFieldValue('ROTATION');
        var code = 'sdisplay.setRotation(' + rotation + ');\n';
        return code;
    };

    Blockly.Arduino['sdisplay_clearDisplay'] = function (block) {
        var code = 'sdisplay.fillScreen(ST77XX_BLACK);\n';
        return code;
    };

    Blockly.Arduino['sdisplay_showImage'] = function (block) {
        // Get the selected image from the dropdown
        var image = block.getFieldValue('IMAGE');
    
        var x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC) || 0;
        var y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC) || 0;

        // Generate the code to show the selected image on the display
        const code = `sdisplay.drawBitmap(${x}, ${y}, ${image}, 128, 128, ST77XX_BLACK);\n`;
        return code;
    };
    
    Blockly.Arduino['sdisplay_showEmoji'] = function (block) {
        var emoji = block.getFieldValue('EMOJI'); // like "emoji_smile"
        var x = Blockly.Arduino.valueToCode(block, 'X', Blockly.Arduino.ORDER_ATOMIC) || '0';
        var y = Blockly.Arduino.valueToCode(block, 'Y', Blockly.Arduino.ORDER_ATOMIC) || '0';
        // Draw bitmap using the selected emoji data
        const code = `sdisplay.drawBitmap(${x}, ${y}, ${emoji}, 128, 128, ST77XX_BLACK);\n`;
        return code;
    };

    return Blockly;
}

exports = addGenerator;
