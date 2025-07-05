/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
function addBlocks (Blockly) {
    const colour = '#FF79BC';
    const secondaryColour = '#FF359A';

    const digitalPins = Blockly.getMainWorkspace().getFlyout()
        .getFlyoutItems()
        .find(block => block.type === 'arduino_pin_setDigitalOutput')
        .getField('PIN')
        .getOptions();

    Blockly.Blocks.sdisplay_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.SDISPLAY_INIT,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'DE',
                        options: digitalPins
                    },
                    {
                        type: 'field_dropdown',
                        name: 'CSN',
                        options: digitalPins
                    },
                    {
                        type: 'field_dropdown',
                        name: 'RST',
                        options: digitalPins
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Arduino.sdisplay_init = function (block) {
        // Get selected pins from the dropdowns
        var dePin = block.getFieldValue('DE');
        var csnPin = block.getFieldValue('CSN');
        var rstPin = block.getFieldValue('RST');
    
        // Add #define statements for the selected pins
        Blockly.Arduino.definitions_['define_TFT_DE'] = `#define TFT_DC ${dePin}`;
        Blockly.Arduino.definitions_['define_TFT_CSN'] = `#define TFT_CSN ${csnPin}`;
        Blockly.Arduino.definitions_['define_TFT_RST'] = `#define TFT_RST ${rstPin}`;
    
        // Include necessary libraries
        Blockly.Arduino.includes_['include_Adafruit_GFX'] = '#include <Adafruit_GFX.h>';
        Blockly.Arduino.includes_['include_Adafruit_ST7735'] = '#include <Adafruit_ST7735.h>';
        // Blockly.Arduino.includes_['include_SPI'] = '#include <SPI.h>';
        Blockly.Arduino.includes_['include_image_data'] = '#include <image_data.h>';
        // Blockly.Arduino.includes_['include_image_data1'] = '#include <image_data1.h>';
    
        // Declare the LCD object
        Blockly.Arduino.definitions_['var_sdisplay'] =
            'Adafruit_ST7735 sdisplay(TFT_CSN, TFT_DC, TFT_RST);';
    
        // Setup function for initialization
        Blockly.Arduino.setups_['setup_sdisplay'] =
        `Serial.begin(115200);\n`;
      
        // `stembotixLCD.println("Hello STEMbotix!");\n`; 
        
        return '';
    };

    Blockly.Blocks.sdisplay_sendString = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.SDISPLAY_SENDSTRING,
                args0: [
                    {
                        type: 'input_value',
                        name: 'DATA'
                    },
                    // {
                    //     type: 'input_value',
                    //     name: 'ID'
                    // }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };


    Blockly.Blocks.sdisplay_type = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.SDISPLAY_TYPE,
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'TYPE',
                        options: [
                            ['INITR_GREENTAB', 'INITR_GREENTAB'],
                            ['INITR_144GREENTAB', 'INITR_144GREENTAB'],
                            ['INITR_HALLOWING', 'INITR_HALLOWING'],
                            ['INITR_MINI160x80', 'INITR_MINI160x80'],
                            ['INITR_MINI160x80_PLUGIN', 'INITR_MINI160x80_PLUGIN'],
                            ['INITR_BLACKTAB', 'INITR_BLACKTAB']
                        ]
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks.sdisplay_initDisplay = {
        init: function () {
            this.jsonInit({
                message0: "Initialize Display",
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };
    
    Blockly.Blocks.sdisplay_setTextColor = {
        init: function () {
            this.jsonInit({
                message0: "Set text color %1",
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'COLOR',
                        options: [
                            ['White', 'ST77XX_WHITE'],
                            ['Black', 'ST77XX_BLACK'],
                            ['Red', 'ST77XX_RED'],
                            ['Green', 'ST77XX_GREEN'], 
                            ['BLUE', 'ST77XX_BLUE'],
                            ['YELLOW', 'ST77XX_YELLOW'],
                            ['CYAN', 'ST77XX_CYAN'],
                            ['MAGENTA', 'ST77XX_MAGENTA']
                        ]
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };
    
    Blockly.Blocks.sdisplay_setTextSize = {
        init: function () {
            this.jsonInit({
                message0: "Set text size %1",
                args0: [
                    {
                        type: "input_value",
                        name: "SIZE"
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };
    
    Blockly.Blocks.sdisplay_setCursor = {
        init: function () {
            this.jsonInit({
                message0: "Set cursor to X: %1 Y: %2",
                args0: [
                    {
                        type: "input_value",
                        name: "X"
                    },
                    {
                        type: "input_value",
                        name: "Y"
                    }
                ],
                colour: colour,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    Blockly.Blocks['sdisplay_fillScreen'] = {
        init: function () {
            this.jsonInit({
                message0: '%{BKY_SDISPLAY_FILL_SCREEN}',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'COLOR',
                        options: [
                            ['0', '0'],  // Default black
                            ['BLACK', 'ST77XX_BLACK'],
                            ['WHITE', 'ST77XX_WHITE'],
                            ['RED', 'ST77XX_RED'],
                            ['GREEN', 'ST77XX_GREEN'],
                            ['BLUE', 'ST77XX_BLUE'],
                            ['YELLOW', 'ST77XX_CYAN'],
                            ['CYAN', 'ST77XX_YELLOW'],
                            ['MAGENTA', 'ST77XX_MAGENTA']
                        ]
                    }
                ],
                colour: '#FF79BC',
                secondaryColour: '#FF359A',
                extensions: ['shape_statement']
            });
        }
    };
    
    Blockly.Blocks['sdisplay_setRotation'] = {
        init: function () {
            this.jsonInit({
                message0: '%{BKY_SDISPLAY_SET_ROTATION}',
                args0: [
                    {
                        type: 'field_dropdown',
                        name: 'ROTATION',
                        options: [
                            ['0', '0'],
                            ['1', '1'],
                            ['2', '2'],
                            ['3', '3']
                        ]
                    }
                ],
                colour: '#FF79BC',
                secondaryColour: '#FF359A',
                extensions: ['shape_statement']
            });
        }
    };

    /* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

Blockly.Blocks['sdisplay_clearDisplay'] = {
    init: function () {
        this.jsonInit({
            message0: '%{BKY_SDISPLAY_CLEAR_DISPLAY}',
            colour: '#FF79BC',
            secondaryColour: '#FF359A',
            extensions: ['shape_statement']
        });
    }
};



Blockly.Blocks['sdisplay_showImage'] = {
    init: function () {
        this.jsonInit({
            message0: 'Show image %1 at x: %2 y: %3',
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'IMAGE',
                    options: [
                        ['Ottobot', 'image_ottobot']
                    ]
                },
                {
                    type: 'input_value',
                    name: 'X'
                },
                {
                    type: 'input_value',
                    name: 'Y'
                }
            ],
            colour: '#FF79BC',
            secondaryColour: '#FF359A',
            extensions: ['shape_statement']
        });
    }
};

Blockly.Blocks['sdisplay_showEmoji'] = {
    init: function () {
        this.jsonInit({
            message0: 'Show emoji %1 at x: %2 y: %3',
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'EMOJI',
                    options: [
                        ['Smile',   'image_smiley'],
                        ['Sad', 'epd_bitmap_sad'],
                        ['Angry', 'epd_bitmap_angry'] 
                    ]
                },
                {
                    type: 'input_value',
                    name: 'X'
                },
                {
                    type: 'input_value',
                    name: 'Y'
                }
            ],
            colour: '#FF79BC',
            secondaryColour: '#FF359A',
            extensions: ['shape_statement']
        });
    }
};

    return Blockly;
}

exports = addBlocks;
