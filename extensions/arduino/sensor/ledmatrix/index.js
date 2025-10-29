const ledMatrix = formatMessage => ({
    name: formatMessage({
        id: 'ledmatrix.name',
        default: 'LED Matrix'
    }),
    extensionId: 'ledmatrix',
    version: '1.0.0',
    supportDevice: ['arduinoNano', 'arduinoUno', 'arduinoMega2560', 'arduinoEsp32', 'arduinoNano_arduinoUno', 'intermediateKit', 'iotAiKit'],
    iconURL: `asset/ledmatrix.png`,   // make sure this PNG is inside /asset folder
    description: formatMessage({
        id: 'ledmatrix.description',
        default: 'Control digits on a 5x7 LED Matrix using NeoPixel.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    msg: 'msg.js',
    library: 'lib',
    tags: ['display', 'led', 'matrix'],
    helpLink: 'https://openblockcc.gitee.io/wiki/main'
});

module.exports = ledMatrix;
