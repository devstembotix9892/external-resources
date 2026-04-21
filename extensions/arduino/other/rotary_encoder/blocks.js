/* eslint-disable func-style */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

function addBlocks(Blockly) {
    const color = '#8E24AA';
    const secondaryColour = '#CE93D8';

    // Use board/device pin options from Arduino flyout (AI&Robotics vs AI&IoT).
    // Falls back to a small common set if flyout isn't available yet.
    const digitalPins = (() => {
        try {
            return Blockly.getMainWorkspace().getFlyout()
                .getFlyoutItems()
                .find(block => block.type === 'arduino_pin_setDigitalOutput')
                .getField('PIN')
                .getOptions();
        } catch (e) {
            return [
                ['2', '2'],
                ['3', '3'],
                ['4', '4'],
                ['5', '5']
            ];
        }
    })();

    // ================= INIT =================
    Blockly.Blocks.rotaryencoder_init = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ROTARYENCODER_INIT,
                args0: [
                    { type: 'field_dropdown', name: 'CLK_PIN', options: digitalPins },
                    { type: 'field_dropdown', name: 'DT_PIN', options: digitalPins },
                    { type: 'field_dropdown', name: 'SW_PIN', options: digitalPins }
                ],
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    // ================= GET COUNT =================
    Blockly.Blocks.rotaryencoder_getCount = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ROTARYENCODER_GETCOUNT,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_number']
            });
        }
    };

    // ================= RESET COUNT =================
    Blockly.Blocks.rotaryencoder_resetCount = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ROTARYENCODER_RESETCOUNT,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['shape_statement']
            });
        }
    };

    // ================= DIRECTION =================
    Blockly.Blocks.rotaryencoder_direction = {
        init: function () {
            this.jsonInit({
                message0: Blockly.Msg.ROTARYENCODER_DIRECTION,
                colour: color,
                secondaryColour: secondaryColour,
                extensions: ['output_string']
            });
        }
    };

    return Blockly;
}

module.exports = addBlocks;
