var global = require('common/global');
var util = require('common/util');
var config = require('level/config');
var Food = require('./Food');
var Stage = function (game, options) {
    this.game = game;
    this.index = options.index;
    this.imageName = 'stage-' + this.index;
    this.prev = null;
    this.curr = null;
    this.next = null;
    this.spot = null;
    this.oldFood = null;
    this.food = null;
    this.moveEasing = Phaser.Easing.Linear.None;
    this.height = game.cache.getImage(this.imageName).height;
    this.currEdgeX = config.currEdgeX;
    this.maxWidth = this.currEdgeX;
    this.updateMinWidth();
    this.updateFoodProba();
    this.updateSpotMultiple();
    this.updateSpotWidth();
    this._init();
};
Stage.prototype._init = function () {
    var game = this.game;
    this.curr = game.add.tileSprite((game.width - this.maxWidth) / 2, game.height - config.initialHorizon - (this.height - config.horizon), this.maxWidth, this.height, this.imageName);
};
Stage.prototype.setForPlay = function (useTween, cb) {
    var game = this.game;
    var nextWidth = this.maxWidth;
    var next = game.add.tileSprite(game.width, game.height - this.height, nextWidth, this.height, this.imageName);
    this._randomTilePosition(next);
    this.next = next;
    this.spot = this._createSpot(next);
    var currX = 0;
    var currY = game.height - this.height;
    var nextX = this.currEdgeX + game.rnd.between(40, 180);
    var easing = this.moveEasing;
    if (useTween) {
        var moveCurr = game.add.tween(this.curr).to({
            x: currX,
            y: currY
        }, 200, easing);
        var moveNext = game.add.tween(next).to({ x: nextX }, 200, easing);
        cb && moveNext.onComplete.add(cb);
        moveCurr.chain(moveNext);
        moveCurr.start();
    } else {
        var curr = this.curr;
        curr.x = currX;
        curr.y = currY;
        next.x = nextX;
    }
};
Stage.prototype._randomTilePosition = function (pillar) {
    pillar.tilePosition.x = -this.game.rnd.between(0, 300 - this.maxWidth);
};
Stage.prototype._createSpot = function (pillar) {
    var spot = this.game.add.image(pillar.width / 2, this.height - config.horizon, 'spot');
    spot.width = this.spotWidth;
    spot.anchor.set(0.5, 0);
    pillar.addChild(spot);
    return spot;
};
Stage.prototype._createFood = function () {
    var game = this.game;
    var food = new Food(game, {
        x: game.width,
        y: game.height - config.horizon + 10
    });
    return food;
};
Stage.prototype.addNext = function (cb) {
    var game = this.game;
    var nextWidth = game.rnd.between(this.minWidth, this.maxWidth);
    var nextMargin = [
        20,
        10
    ];
    var nextX = game.rnd.between(this.currEdgeX + nextMargin[0], game.width - nextWidth - nextMargin[1]);
    var foodWidth = config.foodWidth;
    var foodMargin = 10;
    var food = null;
    var foodX = nextX;
    var hasFood = util.proba(this.foodProba) && nextX - this.currEdgeX >= foodWidth + foodMargin * 2;
    if (hasFood) {
        foodX = game.rnd.between(this.currEdgeX + foodMargin, nextX - foodMargin - foodWidth);
        food = this._createFood();
        var moveFood = game.add.tween(food.getEl()).to({ x: foodX }, 300, this.moveEasing);
        moveFood.start();
    }
    var next = game.add.tileSprite(game.width + nextX - foodX, game.height - this.height, nextWidth, this.height, this.imageName);
    this._randomTilePosition(next);
    var spot = this._createSpot(next);
    var move = game.add.tween(next).to({ x: nextX }, 300, this.moveEasing);
    move.onComplete.add(function () {
        this.prev && this.prev.destroy();
        this.prev = this.curr;
        this.curr = this.next;
        this.next = next;
        this.spot = spot;
        this.oldFood && this.oldFood.destroy();
        this.oldFood = this.food;
        this.food = food || null;
        cb && cb();
    }, this);
    move.start();
    return { hasFood: hasFood };
};
Stage.prototype.getCurrEdgeX = function () {
    return this.currEdgeX;
};
Stage.prototype.getNextEdgeX = function () {
    var next = this.next;
    return next.x + next.width;
};
Stage.prototype.getEl = function () {
    var el = [
        this.prev,
        this.curr,
        this.next
    ];
    [
        this.oldFood,
        this.food
    ].forEach(function (item) {
        item && el.push(item.getEl());
    });
    return el;
};
Stage.prototype.getInterval = function () {
    var curr = this.curr;
    return this.next.x - curr.x - curr.width;
};
Stage.prototype.getSpotX = function () {
    var next = this.next;
    return next.x + this.spot.x;
};
Stage.prototype.getSpotRange = function () {
    var lower = this.getSpotX() - this.currEdgeX - this.spotWidth / 2;
    var upper = lower + this.spotWidth;
    return {
        lower: lower,
        upper: upper
    };
};
Stage.prototype.getFood = function () {
    return this.food;
};
Stage.prototype.getSpotMultiple = function () {
    return this.spotMultiple;
};
Stage.prototype.updateFoodProba = function () {
    var foodProba = global.getHeroConfig().power.foodProba;
    this.foodProba = foodProba ? foodProba : 0.5;
};
Stage.prototype.updateMinWidth = function () {
    var minWidth = global.getHeroConfig().power.stageMinWidth;
    this.minWidth = minWidth ? minWidth : 24;
};
Stage.prototype.updateSpotMultiple = function () {
    var spotMultiple = global.getHeroConfig().power.spotMultiple;
    this.spotMultiple = spotMultiple ? spotMultiple : 1;
};
Stage.prototype.updateSpotWidth = function () {
    var spotWidth = global.getHeroConfig().power.spotWidth;
    this.spotWidth = spotWidth ? spotWidth : 14;
};
module.exports = Stage;