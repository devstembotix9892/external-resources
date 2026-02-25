const ledMatrix = formatMessage => ({
    name: formatMessage({
        id: 'ledmatrix.name',
        default: 'LED Matrix (7x5)'
    }),

    extensionId: 'ledmatrix',
    version: '1.0.0',

    supportDevice: [
        'arduinoNano',
        'arduinoUno',
        'arduinoMega2560',
        'arduinoEsp32',
        'arduinoNano_arduinoUno',
        'intermediateKit',
        'iotAiKit'
    ],

    iconURL: `asset/ledmatrix.png`,

    description: formatMessage({
        id: 'ledmatrix.description',
        default: 'Control 7x5 LED Matrix (35 LEDs) - display digits, letters, symbols & custom patterns.'
    }),

    featured: true,

    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',

    tags: ['display', 'led', 'matrix'],
    helpLink: 'https://openblockcc.gitee.io/wiki/main'
});

module.exports = ledMatrix;