//备注：授权登录
//备注：授权登录
//备注：授权登录
//备注：授权登录

var app = getApp()
var common = require('../../utils/common.js');
Page({
  data: {
    canIUse:true,
    openid:"",
  },

  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function () {
    var value = wx.getStorageSync('openid')
    console.log("用户的openid为：" + value);
    this.setData({
      openid: value,
    })
    
    app.globalData.userInfo.openid = value;
    //如果发现有openid直接跳转到主页
    if (value){
      wx.switchTab({
        url: '../searchHomePage/searchHomePage',
      })
    }
  },

  /**
   * 获取个人信息
   */
  bindGetUserInfo: function () {
    console.log("获取个人信息");
    // 前往授权登录界面
    this.getUserInfo();
  },

  /**
   * 授权获取个人信息
   */
  getUserInfo: function (cb) {

   var currentid = new Date().getTime();
   var currentSign = common.getSign();
   console.log("进到toLogin的onLoad的currentid为：" + currentid);
   console.log("进到toLogin的onLoad的currentSign为：" + currentSign);

    var that = this
    if (app.globalData.userInfo.openid) {
      typeof cb == "function" && cb(that.globalData.userInfo)
    } else {
      wx.login({
        success: function (res) {
          app.globalData.miniPrgCode = res.code
          console.log('返回小程序code为' + res.code);
          //获取微信用户信息
          wx.getUserInfo({
            success: function (result) {
              var wxUser = result.userInfo;
              console.log('返回信息个人信息为userInfo' + JSON.stringify(result.userInfo));
              console.log('返回信息个人信息为rawData' + JSON.stringify(result.rawData));
              console.log('返回信息个人信息为signature' + JSON.stringify(result.signature));
              console.log('返回信息个人信息的encryptedData为' + JSON.stringify(result.encryptedData));
              console.log('返回信息个人信息为iv' + JSON.stringify(result.iv));


              var firstLogin = "firstLoginIn";
              wx.setStorageSync('isFirst', firstLogin);

              app.globalData.userInfo.nickname = wxUser.nickName
              app.globalData.userInfo.gender = wxUser.gender
              app.globalData.userInfo.language = wxUser.language
              app.globalData.userInfo.city = wxUser.city
              app.globalData.userInfo.province = wxUser.province
              app.globalData.userInfo.country = wxUser.country
              app.globalData.userInfo.avatarUrl = wxUser.avatarUrl

              console.log('打印个人信息nickname为' + app.globalData.userInfo.nickname)
              console.log('打印个人信息gender为' + app.globalData.userInfo.gender)
              console.log('打印个人信息language为' + app.globalData.userInfo.language)
              console.log('打印个人信息city为' + app.globalData.userInfo.city)
              console.log('打印个人信息province为' + app.globalData.userInfo.province)
              console.log('打印个人信息country为' + app.globalData.userInfo.country)
              console.log('打印个人信息avatarUrl为' + app.globalData.userInfo.avatarUrl)

              var avatarUrl = wxUser.avatarUrl;

              if (avatarUrl){
                wx.setStorageSync('avatarUrl', avatarUrl);
                console.log('成功保存个人的头像地址avatarUrl' )
              }
              
              var encryptedData = JSON.stringify(result.encryptedData).replace('"', '').replace('"', '');
              var iv = JSON.stringify(result.iv).replace('"', '').replace('"', '');

              var param = {
                "id": currentid,
                "caller": app.globalData.caller,
                "sign": currentSign,
                "data": {
                  "ipmDsn": app.globalData.ipmDsn,
                  "ipmUidString": app.globalData.ipmUidString,
                  "miniPrgCode": app.globalData.miniPrgCode,
                  "encryptedData": encryptedData,
                  "iv": iv
                }
              }

              console.log("param为：" + JSON.stringify(param));

              //通过微信小程序发送登录code返回微信用户授权登录的openid
              common.sendRequest("/ipmMiniPrg/logon/get_mini_prg_logon_detail_info", JSON.stringify(param), function (res) {

                console.log('返回微信用户授权登录的信息res为' + JSON.stringify(res));
                app.globalData.codeImgUrl = res.data.avatarUrl;

                var codeImgUrl = res.data.avatarUrl;
                if (codeImgUrl) {
                  wx.setStorageSync('codeImgUrl', codeImgUrl);
                  console.log('成功保存二维码地址codeImgUrl' + codeImgUrl)
                }

                console.log('返回二维码地址' + res.data.avatarUrl);

                app.globalData.userInfo.unionid = res.data.unionid;
                console.log("用户的unionid为" + app.globalData.userInfo.unionid);
                
                if (res.data.openid) {
                  app.globalData.userInfo.openid = res.data.openid
                  typeof cb == "function" && cb(app.globalData.userInfo)
                  console.log("用户的openid为" + app.globalData.userInfo.openid);

                  // 获取个人详细信息
                  that.getUserDetailInfo();

                  var openid = res.data.openid;
                  wx.setStorageSync('openid', openid);

                  var param1 = {
                    "id": currentid,
                    "caller": app.globalData.caller,
                    "sign": currentSign,
                    "data": {
                      "ipmDsn": app.globalData.ipmDsn,
                      "ipmUidString": app.globalData.ipmUidString,
                      "openid": app.globalData.userInfo.openid,
                      "nickname": app.globalData.userInfo.nickname,
                      "sex": app.globalData.userInfo.gender,
                      "province": app.globalData.userInfo.province,
                      "city": app.globalData.userInfo.city,
                      "country": app.globalData.userInfo.country,
                      "headimgurl": app.globalData.userInfo.avatarUrl,
                      "privilege": app.globalData.userInfo.privilege,
                      "unionid": app.globalData.userInfo.unionid
                    }
                  }
                  console.log("param1为：" + JSON.stringify(param1));

                  //更新微信用户的的登录信息
                  common.sendRequest("/ipmMiniPrg/logon/save_mini_prg_user_logon_info", JSON.stringify(param1), function (res) {
                    console.log('返回信息res为' + JSON.stringify(res));
                    console.log('返回信息res.code为' + res.code);
                    if (res.code == 200000) {
                      console.log('保存用户信息成功');
                      that.toHomePage();
                    } else {
                      common.showTip("网络故障", "loading")
                    }
                  })
                }
              })
            },
            fail: function () {
              console.log('获取个人信息失败');
              //获取用户信息失败后。请跳转授权页面
              wx.showModal({
                title: '警告',
                content: '尚未进行授权，请点击确定到授权页面进行授权。',
                success: function (res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                  }
                }
              })
              //失败
            }
          });
        }
      }, function (err) {
        console.log(err, 'err');
      });
    }
  },


  /**
  * 获取个人详细信息
  */
  getUserDetailInfo: function () {

    var currentid = new Date().getTime();
    var currentSign = common.getSign();
    var that = this;

    console.log("进到mine的currentid为：" + currentid);
    console.log("进到mine的currentSign为：" + currentSign);

    //获取个人详细信息
    var param = {
      "id": currentid,
      "caller": app.globalData.caller,
      "sign": currentSign,
      "data": {
        "ipmDsn": app.globalData.ipmDsn,
        "ipmUidString": app.globalData.ipmUidString,
        "openid": app.globalData.userInfo.openid
      }
    }

    console.log("param为：" + JSON.stringify(param));
    common.sendRequest("/ipmMiniPrg/logon/get_mini_prg_user_detail_info", JSON.stringify(param), function (res) {
      console.log('返回个人详细信息res为' + JSON.stringify(res));
      if (res.code == 200000) {
        var isValidMember = res.data.isValidMember;
        var checkMember = res.data.checkMember;
        var isCustomSite = res.data.isCustomSite;
        wx.setStorageSync('isCustomSite', isCustomSite);
        wx.setStorageSync('isValidMember', isValidMember);
        console.log('获取个人详细信息，判断是否已经定制isCustomSite为' + isCustomSite);
        console.log('获取个人详细信息，判断是否是会员isValidMember为' + isValidMember);
      } else {
        wx.showToast({
          title: "网络故障",
          icon: 'loading',
          duration: 3000
        });
      }
    })
  },


// 跳转到首页
  toHomePage: function () {
    console.log("进入到首页界面");
    // 前往授权登录界面

    if (app.globalData.userInfo.openid){
      wx.switchTab({
        url: '../searchHomePage/searchHomePage',
      })
      
    }

  }
})