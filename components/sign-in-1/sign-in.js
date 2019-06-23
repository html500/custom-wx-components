/**
 * @desc 签到模块
 * @author xxx 2019.xx.xx
 * 
 * @function updatetodaysign 上报更新当天签到结果事件
 * @function hiddentoast 上报隐藏弹窗事件
 * @function signremind 上报签到提醒事件
 * @function openvideo 上报观看视频事件
 * @function videosuc 上报观看视频成功事件
 * 使用示例：
        <sign-in show="{{showSign}}" bindupdatetodaysign="updateTodaySign" bindvideosuc="videoSuc"></sign-in>
 */
const app = getApp();
const regeneratorRuntime = require('../../lib/regenerator-runtime/runtime-module');
import { signInModel } from '../../model/signInModel';
import { commonUtils } from "../../utils/common";

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        show: {
            type: Boolean,
            value: false,
        },
    },
    /**
     * 组件的初始数据
     */
    data: {
        ticketNum: 0, // 幸运币数量
        isHiddenAni: true, // 是否显示领取动画 true:不显示
        signRemind: true, // 是否开启签到提醒， 默认开启


        hidden: true,
        signInfo: {},
        showComDialog: false, // 是否显示通用弹窗
        showViewVideo: false, // 是否显示看视频获取幸运币
        comDialogType: 'signWarn', // 通用弹窗类型
        comDialogConfirmTxt: '关闭', // 通用弹窗确认文案
        comDialogCancelTxt: '暂不关闭', // 通用弹窗取消
        comDialogDesc: '99%的人都通过“签到”获得了奖励 确认关闭吗？', // 通用弹窗描述


    },
    observers: {
        'show': function(e) {
            if (!this.properties.show) {
                return;
            }
            if (commonUtils.isEmptyObject(this.data.signInfo)) {
                this.initData();
            } else {
                this.setData({
                    hidden: false
                });
            }

        }
    },
    // 在组件实例进入页面节点树时执行
    ready: function() {
        // 数据初始化
    },
    pageLifetimes: {
        /**
         * @desc 页面展示
         */
        show() {
            // 网络判断
            wx.getNetworkType({
                success(res) {
                    const networkType = res.networkType;
                    if (networkType == 'none') {
                        // 无网络
                        that.setData({
                            todaySign: true
                        })
                        const eventDetail = {
                            todaySign: true,
                            getTicketNum: 0
                        }
                        const eventOptions = {
                            bubbles: false, // 是否可冒泡
                            composed: false, // 事件是否可跨域组件边界
                            capturePhase: false, // 是否有捕获阶段
                        }
                        this.triggerEvent('updatetodaysign', eventDetail, eventOptions);
                    }
                }
            })
        },
        /**
         * @desc 页面隐藏
         */
        hide() {

        }
    },
    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * @desc 关闭自定义弹窗
         * @param {Strign} type  
         * @param {Boolean} isHidden  
         */
        closeSelfToast: function(type, isHidden) {
            let typeVal = false;
            if (isHidden) {
                typeVal = true;
            }
            this.setData({
                [type]: typeVal
            });
        },
        /**
         * @desc 切换签到提醒
         */
        switchWarn: function() {
            let signInfo = this.data.signInfo;
            let signRemind = signInfo.signRemind;
            if (signRemind == '1') {
                this.setData({
                    showComDialog: true
                })
            } else {
                this.getSignRemind();
            }
        },
        /**
         * @desc 点击关闭按钮 关闭弹窗
         */
        hiddenToast: function(e) {
            const { type } = e.currentTarget.dataset;
            this.closeSelfToast(type, true);
            if (type == 'isHiddenAni') {
                // 隐藏动画弹窗
                this.setData({
                    lastSignIndex: parseInt(this.data.lastSignIndex) + 1
                })
            } else if (type == 'hidden') {
                // 隐藏签到弹窗
                const eventDetail = {
                    hidden: true
                }
                const eventOptions = {
                    bubbles: false, // 是否可冒泡
                    composed: false, // 事件是否可跨域组件边界
                    capturePhase: false, // 是否有捕获阶段
                }
                this.triggerEvent('hiddentoast', eventDetail, eventOptions)
            }
        },
        /**
         * @desc 点击签到
         */
        clickSignTime: 0,
        clickSign: async function() {

            const now = Date.now();
            if ((now - this.clickSignTime) < 1000) {
                return;
            }
            this.clickSignTime = now;
            // 接口请求 每日签到
            const res = await signInModel.dailySign(false);

            let getTicketNum = 0;
            // if (true) {
            if (res.ok) {
                let signInfo = this.data.signInfo;
                getTicketNum = signInfo.dailySignConfig[signInfo.lastSignIndex] || 0;
                signInfo.todaySign = true;
                signInfo.lastSignIndex = signInfo.lastSignIndex + 1;
                signInfo.point = signInfo.point + getTicketNum;

                let showViewVideo = false;
                if (signInfo.viewSignVideo) {
                    showViewVideo = false;
                } else {
                    showViewVideo = true;
                }
                // 签到成功
                this.setData({
                    showViewVideo: showViewVideo,
                    ticketNum: getTicketNum,
                    signInfo: signInfo,
                    showPoint: true,
                });
                getApp().globalData.point = getApp().globalData.point + getTicketNum || 0;
            } else {
                app.showToast('网络错误，请稍后重试~');
            }
            this.setData({
                todaySign: true,
            })
            const eventDetail = {
                todaySign: true,
                getTicketNum: getTicketNum
            }
            const eventOptions = {
                bubbles: false, // 是否可冒泡
                composed: false, // 事件是否可跨域组件边界
                capturePhase: false, // 是否有捕获阶段
            }
            this.triggerEvent('updatetodaysign', eventDetail, eventOptions);
        },

        /**
         * @desc 初始化组件数据
         */
        initData: async function() {
            let signInfo = await signInModel.dailySignPage();
            this.setData({
                signInfo: signInfo,
                hidden: false,
            });
        },
        /**
         * @desc not do
         */
        notDo: function() {
            // not do
        },
        /**    
         * @desc 点击观看广告
         */
        videoHandler: function() {
            // 在合适的位置打开广告
            if (videoAd_sign) {
                // 处理非当前视频广告onClose、onError事件影响
                this.setData({
                    videoAdType: 'signIn'
                })
                videoAd_sign.show().catch(err => {
                    // 失败重试
                    videoAd_sign.load()
                        .then(() => videoAd_sign.show())
                })
            } else {
                wx.showModal({
                    title: '提示',
                    content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试~',
                    showCancel: false
                })
            }
            const eventDetail = {
                value: true
            }
            const eventOptions = {
                bubbles: false, // 是否可冒泡
                composed: false, // 事件是否可跨域组件边界
                capturePhase: false, // 是否有捕获阶段
            }
            this.triggerEvent('openvideo', eventDetail, eventOptions);
        },
        // 通用弹窗确定回调
        dialogConfirm: function() {
            const { comDialogType } = this.data;
            if (comDialogType == 'signWarn') {
                this.getSignRemind();
            }
        },
        // 获取签到提醒数据
        getSignRemind: async function() {
            // 接口请求 签到提醒
            let signInfo = this.data.signInfo;
            let signRemind = signInfo.signRemind;

            const arg = signRemind == '1' ? '0' : '1';
            const res = await signInModel.signRemind(arg, false);
            if (res.ok) {
                signInfo.signRemind = arg;
                this.setData({
                    signInfo: signInfo,
                    showComDialog: false,
                })
            } else {
                app.showToast('网络错误，请稍后重试~');
            }
            const eventDetail = {
                signRemind: arg
            }
            const eventOptions = {
                bubbles: false, // 是否可冒泡
                composed: false, // 事件是否可跨域组件边界
                capturePhase: false, // 是否有捕获阶段
            }
            this.triggerEvent('signremind', eventDetail, eventOptions);
        }
    }
})