/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addGenerator (Blockly) {
    Blockly.Arduino.lcd_config = function (block) {
        const type = block.getFieldValue('TYPE');
        const address = block.getFieldValue('ADDRESS'); // e.g., "0x20", "0x21", etc.
    
        if (type === 'I2C_MCP23008') {
            Blockly.Arduino.includes_.lcd_config = `#include <Adafruit_LiquidCrystal.h>`;
            Blockly.Arduino.definitions_.lcd_config = `Adafruit_LiquidCrystal lcd(${address}, 16, 2);`;
        } else if (type === 'I2C_PCF8574') {
            Blockly.Arduino.includes_.lcd_config = `#include <LiquidCrystal_I2C.h>`;
            Blockly.Arduino.definitions_.lcd_config = `LiquidCrystal_I2C lcd(${address}, 16, 2);`;
        }
    
        return '';
    };
    
    Blockly.Arduino.lcd_config_standard = function (block) {
        const rs = block.getFieldValue('RS');
        const e = block.getFieldValue('E');
        const db4 = block.getFieldValue('DB4');
        const db5 = block.getFieldValue('DB5');
        const db6 = block.getFieldValue('DB6');
        const db7 = block.getFieldValue('DB7');
        const index = block.getFieldValue('LCD_INDEX');
    
        Blockly.Arduino.includes_['lcd'] = '#include <LiquidCrystal.h>';
        Blockly.Arduino.definitions_[`lcd_${index}`] =
            `LiquidCrystal lcd${index}(${rs}, ${e}, ${db4}, ${db5}, ${db6}, ${db7});`;
        Blockly.Arduino.setups_[`lcd_${index}_begin`] = `lcd${index}.begin(16, 2);`;
    
        return '';
    };
    
    
    Blockly.Arduino.lcd_clear_screen = function () {
        return `lcd.clear();\n`;
    };

    Blockly.Arduino.lcd_backlight_control = function (block) {
        const state = block.getFieldValue('STATE');
        return state === 'on' ? `lcd.backlight();\n` : `lcd.noBacklight();\n`;
    };

    Blockly.Arduino.lcd_set_position = function (block) {
        const column = Blockly.Arduino.valueToCode(block, 'COLUMN', Blockly.Arduino.ORDER_ATOMIC);
        const row = Blockly.Arduino.valueToCode(block, 'ROW', Blockly.Arduino.ORDER_ATOMIC);
        return `lcd.setCursor(${column}, ${row});\n`;
    };

    Blockly.Arduino.lcd_print_text = function (block) {
        const text = Blockly.Arduino.valueToCode(block, 'TEXT', Blockly.Arduino.ORDER_ATOMIC);
        return `lcd.print(${text});\n`;
    };

    return Blockly;
}

exports = addGenerator;
