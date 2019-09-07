var Fog = function (game, options) {
    this.game = game;
    this.image = null;
    this._init();
};
Fog.prototype._init = function () {
    var game = this.game;
    var image = game.add.image(0, 0, 'pixel-white');
    image.scale.set(game.width / image.width, game.height / image.height);
    image.alpha = 0.15;
    this.image = image;
};
module.exports = Fog;