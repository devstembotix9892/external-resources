/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
const Blockly = require('blockly/core');
require('./field_matrix.js');

function addBlocks(Blockly) {
    const color = '#FF8C00';
    const secondaryColour = '#FFB733';

    // ================= INIT =================
    Blockly.Blocks.ledmatrix_init = {
        init: function() {
            this.jsonInit({
                message0: 'init LED Matrix at pin %1 with %2 leds brightness %3',
                args0: [{
                        type: 'field_dropdown',
                        name: 'PIN',
                        options: [
                            ['0', '0'],
                            ['1', '1'],
                            ['2', '2'],
                            ['3', '3'],
                            ['4', '4'],
                            ['5', '5'],
                            ['6', '6'],
                            ['7', '7'],
                            ['8', '8'],
                            ['9', '9'],
                        ]
                    },
                    { type: 'input_value', name: 'NUM_LEDS' },
                    { type: 'input_value', name: 'BRIGHTNESS' }
                ],
                colour: color,
                extensions: ['shape_statement']
            });
        }
    };

    // ================= DIGIT =================
    Blockly.Blocks.ledmatrix_showDigit = {
        init: function() {
            this.jsonInit({
                message0: 'show digit %1 on LED Matrix',
                args0: [{ type: 'input_value', name: 'DIGIT' }],
                colour: color,
                extensions: ['shape_statement']
            });
        }
    };

    // ================= LETTER =================
    Blockly.Blocks.ledmatrix_showChar = {
        init: function() {
            this.jsonInit({
                message0: 'show letter %1 on LED Matrix',
                args0: [{
                    type: 'field_dropdown',
                    name: 'CHAR',
                    options: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => [c, c])
                }],
                colour: color,
                extensions: ['shape_statement']
            });
        }
    };

    // ================= SYMBOL =================
    Blockly.Blocks.ledmatrix_showSymbol = {
        init: function() {
            this.jsonInit({
                message0: 'show symbol %1 on LED Matrix',
                args0: [{
                    type: 'field_dropdown',
                    name: 'SYMBOL',
                    options: [
                        ['♥ Heart', '*'],
                        ['☺ Smile', ':']
                    ]
                }],
                colour: color,
                extensions: ['shape_statement']
            });
        }
    };

    // ================= CUSTOM PATTERN =================
    Blockly.Blocks.ledmatrix_draw_custom = {
        init: function() {
            this.jsonInit({
                message0: 'draw custom 7x5 pattern %1',
                args0: [{
                    type: 'field_matrix',
                    name: 'MATRIX',
                    value: '0'.repeat(35)
                }],
                colour: color,
                extensions: ['shape_statement']
            });
        }
    };

    return Blockly;
}

exports = addBlocks;