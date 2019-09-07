var global = require('common/global');
var config = require('level/config');
var Background = require('./ground/Background');
var Midground = require('./ground/Midground');
var Foreground = require('./ground/Foreground');
var Fog = require('./Fog');
var Start = require('./Start');
var MenuBtns = require('./MenuBtns');
var Title = require('./Title');
var End = require('./End');
var Stage = require('./Stage');
var Hero = require('./Hero');
var Stick = require('./Stick');
var Scoreboard = require('./Scoreboard');
var Foodboard = require('./Foodboard');
var Tip = require('./Tip');
var Praise = require('./Praise');
var Combo = require('./Combo');
var level = {};
level.init = function (status) {
    this.status = status;
};
level.create = function () {
    this._reset();
    switch (this.status) {
    case 'menu':
        this._initMenuStatus();
        break;
    case 'play':
        this._initPlayStatus();
        break;
    }
    this._transition();
};
level.update = function () {
    this.background.scroll();
    if (this.status === 'play') {
        if (this.shouldMgScroll) {
            this.nearMidground.scroll(2);
            this.farMidground.scroll(1);
        }
        if (this.isHoldEnabled && this.isBeingHeld) {
            this.stick.lengthen();
        }
        var food = this.stage.getFood();
        if (food && food.isStartingBeingEaten(this.hero)) {
            this.isFoodToBeAdded = true;
        }
    }
};
level._reset = function () {
    this.isHoldEnabled = false;
    this.isBeingHeld = false;
    this.isTouchEnabled = false;
    this.isFoodToBeAdded = false;
    this.shouldMgScroll = false;
    this.theme = this.game.rnd.between(1, 3);
    global.resetShareText();
    require('common/weixin').updateShare();
};
level._transition = function () {
    var Mask = require('common/ui/Mask');
    var mask = new Mask(this.game, { alpha: 1 });
    mask.hide(150);
};
level._initView = function () {
    var game = this.game;
    this.background = new Background(game, { index: this.theme });
    this.farMidground = new Midground(game, {
        index: this.theme,
        imagePrefix: 'mg-far'
    });
    this.nearMidground = new Midground(game, {
        index: this.theme,
        imagePrefix: 'mg-near'
    });
    this.fog = new Fog(game);
};
level._initBaseObjs = function () {
    this._initView();
    var game = this.game;
    this.stage = new Stage(game, { index: this.theme });
    this.hero = new Hero(game, { index: global.getSelected() });
};
level._initMenuStatus = function () {
    this._initBaseObjs();
    var game = this.game;
    this.start = new Start(game, {
        callback: this._initPlayStatus,
        context: this
    });
    this.menuBtns = new MenuBtns(game);
    this.title = new Title(game);
};
level._initPlayStatus = function () {
    var game = this.game;
    switch (this.status) {
    case 'play':
        this._initBaseObjs();
        this.hero.setForPlay(false);
        this.stage.setForPlay(false);
        this.isHoldEnabled = true;
        break;
    case 'menu':
        [
            this.title,
            this.start,
            this.menuBtns
        ].forEach(function (item) {
            item.destroy();
        });
        this.hero.setForPlay(true);
        var me = this;
        this.stage.setForPlay(true, function () {
            me.status = 'play';
            me.isHoldEnabled = true;
        });
        break;
    }
    this.scoreboard = new Scoreboard(game);
    this.foodboard = new Foodboard(game);
    this.stick = new Stick(game);
    this.foreground = new Foreground(game, {
        objects: [
            this.stage,
            this.hero,
            this.stick
        ]
    });
    if (global.getHighest() < 2) {
        this.playTip = new Tip(game, { text: config.tips.play });
    }
    this.combo = new Combo(game);
    this._bindTouch();
};
level._bindTouch = function () {
    var game = this.game;
    game.input.onDown.add(onInputDown, this);
    game.input.onUp.add(onInputUp, this);
};
function onInputDown() {
    var hero = this.hero;
    if (this.isHoldEnabled) {
        this.isBeingHeld = true;
        hero.up();
    }
    if (this.isTouchEnabled) {
        hero.flip();
    }
}
function onInputUp() {
    if (!this.isHoldEnabled || !this.isBeingHeld) {
        return;
    }
    this.isBeingHeld = false;
    this.isHoldEnabled = false;
    this.hero.kick();
    this._layDownStick();
}
level._layDownStick = function () {
    var stick = this.stick;
    var me = this;
    stick.layDown(function () {
        me.isTouchEnabled = true;
        var stage = me.stage;
        if (stick.getFullLength() > stage.getInterval()) {
            var combo = me.combo;
            if (stick.isInSpot(stage)) {
                var points = stage.getSpotMultiple() * combo.get();
                me.scoreboard.addScore(points);
                combo.add();
                new Praise(me.game, {
                    points: points,
                    pointsX: stage.getSpotX()
                });
            } else {
                combo.reset();
            }
            me._makeHeroWalkToNext();
        } else {
            me._makeHeroWalkToStickEnd();
        }
    });
};
level._makeHeroWalkToNext = function () {
    var me = this;
    var hero = this.hero;
    var stage = this.stage;
    hero.walk(stage.getCurrEdgeX() + stage.getInterval(), function () {
        me.isTouchEnabled = false;
        if (!hero.isUpsideDown()) {
            if (me.stick.isInStage(stage)) {
                [
                    me.playTip,
                    me.foodTip
                ].forEach(function (tip) {
                    if (tip) {
                        tip.hide();
                        tip = null;
                    }
                });
                me._makeHeroWalkToNextEdge();
            } else {
                me._makeHeroWalkToStickEnd();
            }
        } else {
            me._fail();
        }
    });
};
level._makeHeroWalkToNextEdge = function () {
    var me = this;
    var stage = this.stage;
    var nextEdgeX = stage.getNextEdgeX();
    this.hero.walk(nextEdgeX, function () {
        me.scoreboard.addScore(1);
        if (me.isFoodToBeAdded) {
            me.isFoodToBeAdded = false;
            global.setFoodCount(global.getFoodCount() + 1);
            me.foodboard.update();
        }
        me.shouldMgScroll = true;
        var foreground = me.foreground;
        foreground.move(stage.getCurrEdgeX() - nextEdgeX, function () {
            me.shouldMgScroll = false;
        });
        var options = stage.addNext(function () {
            me.stick.update();
            foreground.update();
            me.isHoldEnabled = true;
        });
        if (!global.getFoodCount() && options.hasFood) {
            me.foodTip = new Tip(me.game, { text: config.tips.food });
        }
    });
};
level._makeHeroWalkToStickEnd = function () {
    var me = this;
    this.hero.walk(this.stage.getCurrEdgeX() + this.stick.getLength() + 12, function () {
        me.isTouchEnabled = false;
        me._fail();
    });
};
level._fail = function () {
    var me = this;
    var highest = global.getHighest();
    var score = this.scoreboard.getScore();
    var hasNewRecord = score > highest;
    hasNewRecord && global.setHighest(score);
    var stick = this.stick;
    stick.fall();
    var hero = this.hero;
    hero.fall(function () {
        me.game.plugins.screenShake.shake(10);
        setTimeout(function () {
            if (hero.power.doubleLife) {
                hero.sustainLife();
                stick.setForPlay();
                hero.twinkle();
                me.isHoldEnabled = true;
            } else {
                new End(me.game, {
                    score: score,
                    hasNewRecord: hasNewRecord
                });
            }
        }, 400);
    });
};
module.exports = level;