var global = require('common/global');
function init(color) {
    var signPackage = global.getSignPackage();
    signPackage.jsApiList = [
        'onMenuShareTimeline',
        'onMenuShareAppMessage'
    ];
    wx.config(signPackage);
    wx.ready(function () {
        updateShare();
    });
}
function updateShare() {
    var link = 'http://mp.weixin.qq.com/s?__biz=MzAwODMwMzA0Mw==&mid=206193292&idx=1&sn=2eb2c175488e2432921a3609af7ca185&scene=2&from=timeline&isappinstalled=0#rd';
    var imgUrl = 'http://farm.yiluwan.org/super-gingerbread/asset/img/icon-200.png';
    wx.onMenuShareTimeline({
        title: global.getShareText(),
        link: link,
        imgUrl: imgUrl,
        success: function () {
            global.setShared(1);
            global.unlock(1);
        }
    });
    wx.onMenuShareAppMessage({
        title: '超能姜饼人',
        desc: global.getShareText(),
        link: link,
        imgUrl: imgUrl
    });
}
module.exports = {
    init: init,
    updateShare: updateShare
};