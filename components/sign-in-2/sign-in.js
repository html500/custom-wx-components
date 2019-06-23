/**
 * @desc 签到弹窗
 * @author xxx 2019.xx.xx
 * 
 * @function updatetodaysign 上报更新当天签到结果事件
 * @function hiddentoast 上报隐藏弹窗事件
 * @function signremind 上报签到提醒事件
 * @function openVideo 上报观看视频事件
 * @function updateDate 上报更新页面数据事件
 * 使用示例： 
 *      <sign-in hidden="{{isHideSign}}" source="{{signSource}}"                bindupdatetodaysign="updateTodaySign" bindsignremind="signRemind" bindvideosuc="videoSuc"></sign-in>
 */
const app = getApp();
const regeneratorRuntime = require('../../lib/regenerator-runtime/runtime-module');
import { signInModel } from '../../model/signInModel';
import { commonUtils } from "../../utils/common";
import { getDay, formatNumber } from '../../utils/util.js';

// 测试数据 每日签到
import testDailySign from '../../data/dailySign';
let videoAd = null;
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        /**
         * 弹窗是否显示 flase:显示 true：隐藏
         */
        hidden: {
            type: Boolean,
            value: false,
        },
        /**
         * 弹窗数据源
         * 格式例如
         * {
                "lastSignIndex": "0", //最后签到天数 0:没有签到 1-7
                "totalLotteryCouponNum": 27, //总抽奖券数
                "todaySign": false, //今日是否已签到
                "signRemind": 1, //是否开启签到提醒
                "dailySignConfig": [ //七天签到配置
                    {
                        "giftLotteryCouponNum": 3
                    },
                    {
                        "giftLotteryCouponNum": 3
                    },
                    {
                        "giftLotteryCouponNum": 5
                    },
                    {
                        "giftLotteryCouponNum": 3
                    },
                    {
                        "giftLotteryCouponNum": 3
                    },
                    {
                        "giftLotteryCouponNum": 3
                    },
                    {
                        "giftLotteryCouponNum": 7
                    }
                ]
            }
         */
        source: {
            type: Object,
            value: {},
            observer: 'updateSource'
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        lastSignIndex: 0, //最后签到天数 0:没有签到 1-7
        todaySign: false, //今日是否已签到
        ticketNum: 3, // 抽奖券数量  默认3张 值为：3 5 7
        isHiddenAni: true, // 是否显示领取动画 true:不显示
        signRemind: true, // 是否开启签到提醒， 默认开启
        list: [], // 签到数据源
        source: {}, // 传值数据源
        totalLotteryCouponNum: 0, // 总抽奖券数
        haveVedioAd: true, // 有视频广告
    },
    // 在组件实例进入页面节点树时执行
    ready: function() {
        // 数据初始化
        this.initData();
    },
    pageLifetimes: {
        /**
         * @desc 页面展示
         */
        show() {
            // const watchVedioAd = wx.getStorageSync('watchVedioAd') || '';
            // const today = `${getDay(0).year}-${formatNumber(getDay(0).month)}-${getDay(0).date}`;
            // let haveVedioAd = true;
            // // 判断当天领取次数是否超过三次
            // if(watchVedioAd && watchVedioAd.time==today && watchVedioAd.num>3) {
            //     haveVedioAd = false;
            // } else {
            // // 加载广告
            //     this.loadVedioAd();
            // }
            // this.setData({
            //     haveVedioAd
            // })
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
            if(isHidden) {
                typeVal = true;
            }
            this.setData({
                [type]: typeVal
            });
        },
        /**
         * @desc 切换签到提醒
         */
        switchWarn: async function() {
            // 接口请求 签到提醒
            const { signRemind } = this.data;
            const arg = signRemind?'0':'1';
            const res = await signInModel.signRemind(arg, false);
            if(res.status==1) {
                this.setData({
                    signRemind: !signRemind
                })
            } else {
                app.showToast('网络错误，请稍后重试~');
            }
            const eventDetail = {
                signRemind: !signRemind
            }
            const eventOptions = {
                bubbles: false, // 是否可冒泡
                composed: false, // 事件是否可跨域组件边界
                capturePhase: false, // 是否有捕获阶段
            }
            this.triggerEvent('signremind', eventDetail, eventOptions);
        },
        /**
         * @desc 点击关闭按钮 关闭弹窗
         */
        hiddenToast: function(e) {
            const { type } = e.currentTarget.dataset;
            this.closeSelfToast(type, true);
            if(type=='isHiddenAni') {
                // 隐藏动画弹窗
                this.setData({
                    lastSignIndex: parseInt(this.data.lastSignIndex)+1
                })
            } else if(type=='hidden') {
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
        clickSign: async function() {
            const { totalLotteryCouponNum } = this.data;
            // 接口请求 每日签到
            const res =await signInModel.dailySign(false);
            // 模拟数据
            // const res = testDailySign;
            let getTicketNum = 0;
            if(res.status==1) {
                getTicketNum = res.data.giftLotteryCouponNum || 0;
                // 签到成功
                this.setData({
                    todaySign: true,
                    ticketNum: getTicketNum,
                    totalLotteryCouponNum: parseInt(totalLotteryCouponNum)+getTicketNum,
                    isHiddenAni: false
                })
            } else {
                app.showToast('网络错误，请稍后重试~');
            }
            const eventDetail = {
                todaySign: res.status==1,
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
         * @desc 更新source的值 属性被改变时执行的函数
         * @param {Object} newVal
         */
        updateSource: function(newVal) {
            this.setData({
                source: newVal
            })
            // 初始化组件数据
            this.initData();
        },
        /**
         * @desc 初始化组件数据
         */
        initData: function() {
            const { source } = this.data;
            let list = [];
            if(commonUtils.isEmptyObject(source) || source.dailySignConfig&&source.dailySignConfig.length<=0) {
                return;
            }
            for(let i=0, len=source.dailySignConfig.length;i<len;i++) {
                const item = {};
                const couponNum = source.dailySignConfig[i].giftLotteryCouponNum || 0;
                let bg = '../../images/components/sign-in/sign-bg-1.png';
                let boxClass = '';
                item.giftLotteryCouponNum = couponNum;
                item.date = i+1;
                if(couponNum==3) {
                    bg = '../../images/components/sign-in/sign-bg-1.png';
                } else if(couponNum==5) {
                    bg = '../../images/components/sign-in/sign-bg-2.png';
                    boxClass = 'sc-item-box5';
                } else if(couponNum==7) {
                    bg = '../../images/components/sign-in/sign-bg-3.png';
                    boxClass = 'sc-item-box7';
                }
                item.bg = bg;
                item.boxClass = boxClass;
                list.push(item);
            }
            this.setData({
                list,
                lastSignIndex: source.lastSignIndex || 0,
                todaySign: source.todaySign || false,
                signRemind: !!source.signRemind,
                totalLotteryCouponNum: source.totalLotteryCouponNum || 0
            })
        },
        /**
         * @desc not do
         */
        notDo: function () {
            // not do
        },
        /**    
         * @desc 点击观看广告
         */
        videoHandler: function() {
            // 在合适的位置打开广告
            if (videoAd) {
                videoAd.show().catch(err => {
                // 失败重试
                videoAd.load()
                    .then(() => videoAd.show())
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
            this.triggerEvent('openVideo', eventDetail, eventOptions);
        },
        /**     
         * @desc 加载广告
        */
        getLotteryCouponTime: 0,
        loadVedioAd: function() {
            let { totalLotteryCouponNum } = this.data;
            if (wx.createRewardedVideoAd) {
                // 加载激励视频广告
                videoAd = wx.createRewardedVideoAd({
                    adUnitId: 'adunit-124674e759c60385'
                })
                //捕捉错误
                videoAd.onError(err => {
                    // 进行适当的提示
                    console.log('视频广告报错：', err);
                    this.setData({
                        haveVedioAd: false
                    })
                })
                // 监听关闭
                videoAd.onClose(async (status) => {
                    if (status && status.isEnded || status === undefined) {
                        const watchVedioAd = wx.getStorageSync('watchVedioAd') || '';
                        const today = `${getDay(0).year}-${formatNumber(getDay(0).month)}-${getDay(0).date}`;
                        let haveVedioAd = true;
                        const now = Date.now();
                        // 判断当天领取次数是否超过三次
                        if(watchVedioAd) {
                            if(watchVedioAd.time!=today) {
                                wx.setStorageSync('watchVedioAd', {time: today, num: 1})
                            } else if(watchVedioAd.num<=3) {
                                wx.setStorageSync('watchVedioAd', {time: today, num: parseInt(watchVedioAd.num)+1})
                            } else {
                                haveVedioAd = false;
                            }
                        } else {
                            wx.setStorageSync('watchVedioAd', {time: today, num: 1});
                        }
                        if(haveVedioAd) {
                            if((now-this.getLotteryCouponTime)<1000) {
                                return;
                            }
                            this.getLotteryCouponTime = now;
                            const res = await signInModel.getLotteryCouponByVideo();
                            console.log('领取抽奖券奖励接口请求：', res);
                            if(res.ok) {
                                app.showToast('成功获得一张抽奖券~');
                                if(app.globalData.userInfo) {
                                    app.globalData.userInfo.lotteryCouponNum = res['data']['lotteryCouponNum'] || (parseInt(totalLotteryCouponNum)+1);
                                }
                                totalLotteryCouponNum = res['data']['lotteryCouponNum'] || (parseInt(totalLotteryCouponNum)+1);
                            } else {
                                console.log('接口请求错误~');
                                app.showToast('抽奖券获取失败~');
                            }
                            // 加载广告
                            this.loadVedioAd();
                        }
                        this.setData({
                            haveVedioAd,
                            totalLotteryCouponNum
                        })
                    } else {
                        // 播放中途退出，进行提示
                        app.showToast('抽奖券获取失败~');
                    }
                    // 事件上报
                    const eventDetail = {
                        totalLotteryCouponNum:totalLotteryCouponNum
                    }
                    const eventOptions = {
                        bubbles: false, // 是否可冒泡
                        composed: false, // 事件是否可跨域组件边界
                        capturePhase: false, // 是否有捕获阶段
                    }
                    this.triggerEvent('updatedate', eventDetail, eventOptions);
                })
            }
        }
    }
})