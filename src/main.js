var global = require('common/global');
function init() {
    if (global.getMode() === 'prod') {
        require('common/weixin').init();
    }
    initGame();
}
function initGame() {
    var game = new Phaser.Game(480, 800, Phaser.CANVAS, '');
    game.state.add('boot', require('boot'));
    game.state.add('preload', require('preload'));
    game.state.add('level', require('level/level'));
    game.state.start('boot');
}
module.exports = { init: init };