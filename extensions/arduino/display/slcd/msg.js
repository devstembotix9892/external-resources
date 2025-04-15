/* eslint-disable func-style */
/* eslint-disable require-jsdoc */
function addMsg (Blockly) {
    Object.assign(Blockly.ScratchMsgs.locales.en, {
        LCD_CATEGORY: 'LCD',
        LCD_CONFIG: 'configure LCD type %1 with address %2',
        LCD_CONFIG_STANDARD: 'configure LCD %1 type to %2 with pins: RS %3 E %4 DB4 %5 DB5 %6 DB6 %7 DB7 %8',
        LCD_CLEAR_SCREEN: 'clear lcd screen',
        LCD_BACKLIGHT_CONTROL: 'set lcd backlight %1',
        LCD_SET_POSITION: 'set cursor column %1 row %2',
        LCD_PRINT_TEXT: 'lcd print text %1',
        LCD_STATE_ON: 'on',
        LCD_STATE_OFF: 'off'
    });

    Object.assign(Blockly.ScratchMsgs.locales['zh-cn'], {
        LCD_CATEGORY: 'LCD',
        LCD_CONFIG: '配置LCD类型 %1 地址 %2',
        LCD_CONFIG_STANDARD: '配置LCD %1 类型为 %2 并使用引脚: RS %3 E %4 DB4 %5 DB5 %6 DB6 %7 DB7 %8',
        LCD_CLEAR_SCREEN: '清除 lcd 屏幕',
        LCD_BACKLIGHT_CONTROL: '设置 lcd 背光 %1',
        LCD_SET_POSITION: '设置光标 列 %1 行 %2',
        LCD_PRINT_TEXT: 'lcd 打印文字 %1',
        LCD_STATE_ON: '开',
        LCD_STATE_OFF: '关'
    });

    return Blockly;
}

exports = addMsg;
