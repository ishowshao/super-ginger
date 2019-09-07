var global = require('common/global');
function preload() {
    var path;
    var suffix;
    if (global.getMode() === 'dev') {
        path = 'src/img/';
        suffix = '.png';
    } else {
        path = 'http://ishowshao-game.qiniudn.com/super-gingerbread/asset/img/';
        suffix = '.png?v=*TIMESTAMP*';
    }
    this.game.load.spritesheet('boy-walk', path + 'boy/walk' + suffix, 76, 106);
}
function create() {
    var game = this.game;
    game.stage.backgroundColor = require('common/color').get('bg');
    game.plugins.screenShake = game.plugins.add(Phaser.Plugin.ScreenShake);
    game.plugins.screenShake.setup({
        shakeX: false,
        shakeY: true,
        sensCoef: 0.3
    });
    var scale = this.scale;
    scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    scale.pageAlignHorizontally = true;
    scale.pageAlignVertically = true;
    setTimeout(function () {
        game.state.start('preload');
    }, 100);
}
module.exports = {
    preload: preload,
    create: create
};