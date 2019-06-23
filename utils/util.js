
/***
 * 判断用户滑动
 * 左滑还是右滑
 */
function getTouchDirection (endX, endY, startX, startY) {
  let turn = "";
  if (endX - startX > 50 && Math.abs(endY - startY) < 50) {      //右滑
    turn = "right";
  } else if (endX - startX < -50 && Math.abs(endY - startY) < 50) {   //左滑
    turn = "left";
  }
  return turn;
}

/**
 * 格式化时间  
 * 格式：xx-xx-xx xx:xx:xx => xx月xx日 xx:xx
 * 例如：2018-12-15 00:00:00 => 12月15日 00:00 
 * 参数：time 需要格式化的时间
 */ 
function splitTimer(time) {
  if(time) {
    const timerArr = time.split(' ');
    const ymdArr = timerArr[0].split('-');
    const hmsArr = timerArr[1].split(':');
    time = ymdArr[1]+'月'+ymdArr[2]+'日 '+hmsArr[0]+':'+hmsArr[1];
  }
  return time;
}
/** */
function getNowDate(){
  let today = new Date();
  //测试数据
  // today.setMonth(11);
  // today.setDate(31);
  // today.setHours(12,41);
  return today;
}

/**
 * 时间选择器 小时列的值改变时，计算数据的变动
 * @param {原始数据} _multiArray 
 * @param {选择的小时} selectedValueIndex 
 * @param {当前选中的天的index} chooseDayIndex 即，multiIndex[0],发起页面代码重复 
 * @returns _multiArray 重新计算后的数据
 */
function getDatasAfterHourColumnChange(_multiArray,selectedValueIndex,chooseDayIndex,currentMinute){
  // 当前为今天的数据
  if (chooseDayIndex == 0 && selectedValueIndex == 0 && currentMinute < 30) {
    _multiArray[2] = ['30'];
  } else {
    _multiArray[2] = ['00', '30'];
  }
  return _multiArray;
}

/**
 * 时间选择器 小时列的值改变时，计算数据的变动
 * @param {原始数据} _multiArray 
 * @param {当前记录的时间选择器选中的信息} multiIndex
 * @param {选择的天index} selectedValueIndex 
 * @param {上次选择的小时} oldCurrDay 
 * @returns _multiArray 重新计算后的数据
 */
function getDatasAfterDayColumnChange(_multiArray,multiIndex,selectedValueIndex,oldCurrDay,isStartFromNextDay){
  let fullHoursList = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', 
                        '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  let nowTimeInfos = getDateInfos(0);
  let currentDay = nowTimeInfos.day;
  let currentHour = nowTimeInfos.hour;
  let currentMinute = nowTimeInfos.minute;
  // 是否切换到今天
  if (!isStartFromNextDay && selectedValueIndex == 0) {
    // 计算今天日期已换
    if (currentDay != oldCurrDay) {//TODO 此处逻辑有重复
        let dayList = [0, 1, 2, 3, 4, 5, 6];
        // 获取未来6天的日期
        if (currentHour >= 23 && currentMinute > 30) {
            dayList = [1, 2, 3, 4, 5, 6, 7];
        }
        for (let i = 0; i < dayList.length; i++) {
            let dayItem = getDateInfos(dayList[i]);
            _multiArray[0][i] = dayItem.month + '月' + dayItem.date + '日';
            if (dayItem.day == 0) {
                _multiArray[0][i] = _multiArray[0][i] + ' (周日)';
            } else if (dayItem.day == currentDay) {
                _multiArray[0][i] = _multiArray[0][i] + ' (今天)';
            } else {
                _multiArray[0][i] = _multiArray[0][i] + ' (周' + sectionToChinese(dayItem.day) + ')';
            }
        }
    }
    let leftHours = 23 - currentHour;
    if (multiIndex[0] == 0  && multiIndex[1] == 0 ) {//当前选中的是第一天的第一个小时，需要计算是否展示00
      if(currentMinute >= 30){
        _multiArray[2] = ['00','30'];
        currentHour++;
        leftHours--;
      }else{
        _multiArray[2] = ['30'];
      }
    } else {
        _multiArray[2] = ['00','30'];
    }
    let todayHoursList = [];
    for (let i = 0; i <= leftHours; i++) {
        todayHoursList = todayHoursList.concat(fullHoursList[currentHour * 1 + i]);
    }
    _multiArray[1] = todayHoursList;
  } else { // 切换到其他天
      _multiArray[1] = fullHoursList;
      _multiArray[2] = ['00', '30'];
  }
  return _multiArray;
}


/**
 * zpp:原getDay函数整理及重命名；2018-12-06
 * 以当前时间为基准，获取N天前后的时间Date信息:
 * getDateInfos(0); //当天日期
 * getDateInfos(-7); //7天前日期
 * 默认返回当天的日期
 * @param dayNumAfterNow：需要加/减的天数
 * @returns { year, month, date, day, hour, minute, second } 
 */
function getDateInfos(dayNumAfterNow){
  var dayNumAfterNow = dayNumAfterNow || 0;
  let today = getNowDate();
  var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * dayNumAfterNow;
  let resultDate = new Date(targetday_milliseconds);  
  return getDateInfosOfDate(resultDate);
}

/**
 * 获取Date拆分后的年月日时分秒信息
 * 默认返回当天的日期
 * @param date 日期
 * @returns { year, month, date, day, hour, minute, second } 
 */
function getDateInfosOfDate(resultDate){
  // 年
  var year = resultDate.getFullYear();
  // 月
  var month = resultDate.getMonth() + 1;
  // 日
  var date = resultDate.getDate();
  // 周几 0-6 0是周日
  var day = resultDate.getDay();
  // 时
  var hour = formatNumber(resultDate.getHours());
  // 分钟
  var minute = resultDate.getMinutes();
  // 秒
  var second = resultDate.getSeconds();
  date = formatNumber(date);
  return { year, month, date, day, hour, minute, second };
}

/**
 * 获取时间字符串 获得 拆分后的年月日时分秒信息
 * 默认返回当天的日期
 * @param timeStr 日期字符串 格式：2018-12-07 02:00:00 默认返回当前时间的对应信息
 * @returns { year, month, date, day, hour, minute, second } 
 */
function getDateInfosByTimeStr(timeStr){
  let result = getDateInfos(0);  
  if(timeStr && timeStr != '') {
    //ios中需要/格式的
    timeStr = timeStr.replace(/-/g, '/');
    return getDateInfosOfDate(new Date(timeStr));
  }  
  // console.log('util-getDateInfosByTimeStr',timeStr,new Date(timeStr),result);
  return result;
}

/**
 * 用于 开奖时间，发布时间
 * 获取展示时间选择器需要的valueArray（当前时间，未来6天的日期）
 * zpp,2018-12-6,从发起抽奖中剥离的代码。将用到发起的开奖时间设定和抽奖详情的发布时间设定
 * 发起抽奖， 
 * @param oldSelectedTimeStr 当前选中的时间  格式：2018-12-07 02:00:00  
 *        若无,则默认为可选时间的第一条时间(valueArray为初始值[0,0,0])，
 *        影响curr**,valueArray的返回值
 * @returns {currentDay,currentHour,currentMinute,valueArray,multiArray};
 *          mutiArray：当前时间未来六天的数据集，用于时间选择器的页面展示
 *          curr**:当前选择的天时分数值
 *          valueArray:当前选择的天时分对应的index;
 *          defaultSelectedTimeStr: 天时分都选择第一个选项的对应时间
 */
function getValuesForTimePicker(oldSelectedTimeStr){
  let nowTimeStr = formatTime(getNowDate());
  if(oldSelectedTimeStr <= nowTimeStr){
    //若原来的选择时间，在可选的开始之前，则忽略之前的选中时间信息。
    //否则需要展示的时候展示当前选中的时间
    oldSelectedTimeStr = '';
  }
  let fullHoursList = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', 
                        '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  const multiArray = [//基础数据模版，用于存储得到的数据
      [],
      ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
      ['00', '30']
  ];
  var valueArray = [0,0,0];
  
  var currSelectedDay = '';
  var currSelectedHour = '';
  var currSelectedMinute = '';

  if(oldSelectedTimeStr != '') {
    let oldSelectedTimeInfos = getDateInfosByTimeStr(oldSelectedTimeStr); 
    currSelectedDay = oldSelectedTimeInfos.date;
    currSelectedHour = oldSelectedTimeInfos.hour;
    currSelectedMinute = oldSelectedTimeInfos.minute;
  }
  //获取选择器 开始时间的相关信息
  let nowTimeInfos = getDateInfosByTimeStr(nowTimeStr);
  var currentDate =  nowTimeInfos.date;
  var currentDay = nowTimeInfos.day;
  var currentHour = nowTimeInfos.hour;
  var currentMinute = nowTimeInfos.minute;
  
  //定义要获取的未来六天据今天的日期的差值
  var dayList = [0, 1, 2, 3, 4, 5, 6];  
  let isStartFromNextDay = false;
  if (currentHour >= 23 && currentMinute >= 30) {
      isStartFromNextDay = true;
      dayList = [1, 2, 3, 4, 5, 6, 7];
  }
  // 获取未来6天的Day 数据集
  for(var i=0; i<dayList.length; i++) {
      var dayItem = getDateInfos(dayList[i]);
      multiArray[0][i] = dayItem.month + '月' + dayItem.date + '日';
      if (dayItem.day == 0) {
          multiArray[0][i] = multiArray[0][i] + ' (周日)';
      } else if (!isStartFromNextDay && dayItem.day == currentDay) {
          multiArray[0][i] = multiArray[0][i] + ' (今天)';
      } else {
          multiArray[0][i] = multiArray[0][i] + ' (周' + sectionToChinese(dayItem.day) + ')';
      }
      //更新 当前选择的时间所在 index
      if(dayItem.date == currSelectedDay) {
          valueArray[0] = i;
      }
  }
  
  if(isStartFromNextDay){
    multiArray[1] =  fullHoursList;
    multiArray[2] = ['00','30'];
  }else{    
    //获取对应的天的 Hour 、 Minute 的数据集
    var todayHoursList = [];
    if(currSelectedDay == ''
        || currSelectedDay == currentDate) {//当前选中今天的情况
        var leftHours = 23 - currentHour;
        if (currentMinute > 0 && currentMinute < 30) {
            multiArray[2] = ['30'];
        } else {
            multiArray[2] = ['00','30'];
            currentHour++;
            leftHours--;
        }
        for(var i=0; i<=leftHours; i++) {
            todayHoursList = todayHoursList.concat(fullHoursList[currentHour*1+i]);
        }
    } else {//当前选中其他天的情况
        multiArray[2] = ['00', '30'];
        todayHoursList = fullHoursList;
    }
    multiArray[1] = todayHoursList;
    if(currSelectedHour != ''){
      //获取选中hour的index
      for (var i=0; i<todayHoursList.length; i++) {
        if(todayHoursList[i] == currSelectedHour) {
            valueArray[1] = i;
        }
      }
    }
    if(currSelectedMinute != ''){
      //获取选中minute的index
      for (var i=0; i<multiArray[2].length; i++) {
        if(multiArray[2][i] == currSelectedMinute) {
            valueArray[2] = i;
        }
      }
    }
  }
  //获取初始化天时分都选择第一个选项的时间
  let defaultSelectedTimeStr = oldSelectedTimeStr;
  if (defaultSelectedTimeStr == '') {
    defaultSelectedTimeStr = getTimeStrForTimerPicker(valueArray,multiArray);
  }
  // console.log('util-getValuesForTimePicker:',isStartFromNextDay,currentDay,currentHour,currentMinute,valueArray,multiArray,defaultSelectedTimeStr);
  return {isStartFromNextDay,currentDay,currentHour,currentMinute,valueArray,multiArray,defaultSelectedTimeStr};
}

/**
 * 
 * @param {*} filePath 
 */
function getTimeStrForTimerPicker(multiIndex,multiArray,isStartFromNextDay) {
  //跨天的时候需要进行天数的加1，后再取年的信息，即跨年的情况
  let currDayAfterToday = multiIndex[0];
  if(isStartFromNextDay){
    currDayAfterToday += 1;
  }
  const currentYear = getDateInfos(currDayAfterToday).year;
  let mDayArr = multiArray[0][multiIndex[0]].replace(/[月|日]/g, ' ').split(' ');
  let month = mDayArr[0];
  if(month < 10){
      month = '0'+month;
  }
  const selectedTimeStr = currentYear + '-' + month + '-' + mDayArr[1] + ' '
       + multiArray[1][multiIndex[1]] + ':' + multiArray[2][multiIndex[2]] + ':00';
  // console.log('util-getTimeStrForTimerPicker',isStartFromNextDay,selectedTimeStr);
  return selectedTimeStr;
}


/**
 * getDay(0); //当天日期
 * getDay(-7); //7天前日期
 * 默认返回当天的日期
 * day：需要放回的日期
 * 废弃，使用getDateInfos(dayAfterNow)
*/

function getDay(day) {
  var day = day || 0;
  var today = new Date();
  //测试数据
  // today.setMonth(11);
  // today.setDate(31);
  // today.setHours(23,41);

  var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
  today.setTime(targetday_milliseconds);
  // 年
  var year = today.getFullYear();
  // 月
  var month = today.getMonth() + 1;
  // 日
  var date = today.getDate();
  // 周几 0-6 0是周日
  var day = today.getDay();
  // 时
  var hour = formatNumber(today.getHours());
  // 分钟
  var minute = today.getMinutes();
  // 秒
  var second = today.getSeconds();
  date = formatNumber(date);
  // console.log('getDay:',year, month, date, day, hour, minute, second );
  return { year, month, date, day, hour, minute, second };
}

/**
 * 格式化标题 
 * 说明：
 * 如果是单个奖品 显示：奖品：XXXXX  
 * 如果是多个奖品 显示： 奖项一：xxxxx   奖项二：xxxxx
 * arr 需要格式化的数组
 */
function formatTitle(arr) {
  if(arr && arr.length>0){
    var index_j = 0;
    for (var j in arr) {
      if (arr.length == 1) {
        arr[j].nameShow = '奖品：' + arr[j].name;
        break;
      } else if (arr.length > 1) {
        index_j = parseInt(j) + 1;
        arr[j].nameShow = '奖项' + sectionToChinese(index_j) + '：' + arr[j].name;
      }
    }
  }
  return arr;
}
/**
 * 数字转换成汉字
 * section：需要装换的数字
 */
function sectionToChinese(section) {
  var chnUnitSection = ["", "万", "亿", "万亿", "亿亿"];
  var chnUnitChar = ["", "十", "百", "千"];
  var chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  var strIns = '',
    chnStr = '';
  var unitPos = 0;
  var zero = true;
  while (section > 0) {
    var v = section % 10;
    if (v === 0) {
      if (!zero) {
        zero = true;
        chnStr = chnNumChar[v] + chnStr;
      }
    } else {
      zero = false;
      strIns = chnNumChar[v];
      strIns += chnUnitChar[unitPos];
      chnStr = strIns + chnStr;
    }
    unitPos++;
    section = Math.floor(section / 10);
  }
  return chnStr;
}
/**
 * 处理浮点数
 * num:需要处理的数字
 * bits:保留的位数
 */
function toFixed(num, bits) {
  var bits = bits || 2;
  if(num) {
    return num.toFixed(bits);
  } else {
    return "0.00";
  }
}

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

var I64BIT_TABLE =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');

function hash(input) {
  var hash = 5381;
  var i = input.length - 1;

  if (typeof input == 'string') {
    for (; i > -1; i--)
      hash += (hash << 5) + input.charCodeAt(i);
  } else {
    for (; i > -1; i--)
      hash += (hash << 5) + input[i];
  }
  var value = hash & 0x7FFFFFFF;

  var retValue = '';
  do {
    retValue += I64BIT_TABLE[value & 0x3F];
  }
  while (value >>= 6);

  return retValue;
}

function timeAgo(dateTimeStamp) { //dateTimeStamp是一个时间毫秒，注意时间戳是秒的形式，在这个毫秒的基础上除以1000，就是十位数的时间戳。13位数的都是时间毫秒。
  var minute = 1000 * 60; //把分，时，天，周，半个月，一个月用毫秒表示
  var hour = minute * 60;
  var day = hour * 24;
  var week = day * 7;
  var halfamonth = day * 15;
  var month = day * 30;
  var now = new Date().getTime(); //获取当前时间毫秒
  var diffValue = now - dateTimeStamp; //时间差
  if (diffValue < 0) {
    diffValue = 0; // 改成=0
  }
  var minC = diffValue / minute; //计算时间差的分，时，天，周，月
  var hourC = diffValue / hour;
  var dayC = diffValue / day;
  var weekC = diffValue / week;
  var monthC = diffValue / month;
  var result = "";
  if (monthC >= 1 && monthC <= 3) {
    result = " " + parseInt(monthC) + "月前"
  } else if (weekC >= 1 && weekC <= 3) {
    result = " " + parseInt(weekC) + "周前"
  } else if (dayC >= 1 && dayC <= 6) {
    result = " " + parseInt(dayC) + "天前"
  } else if (hourC >= 1 && hourC <= 23) {
    result = " " + parseInt(hourC) + "小时前"
  } else if (minC >= 1 && minC <= 59) {
    result = " " + parseInt(minC) + "分钟前"
  } else if (diffValue >= 0 && diffValue <= minute) {
    result = "刚刚"
  } else {
    var datetime = new Date();
    datetime.setTime(dateTimeStamp);
    var Nyear = datetime.getFullYear();
    var Nmonth = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
    var Ndate = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
    var Nhour = datetime.getHours() < 10 ? "0" + datetime.getHours() : datetime.getHours();
    var Nminute = datetime.getMinutes() < 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
    var Nsecond = datetime.getSeconds() < 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
    result = Nyear + "-" + Nmonth + "-" + Ndate
  }
  return result;
}

// 获取最小值到最大值之前的整数随机数
function getRandomNum(Min, Max) {
  var Range = Max - Min;
  var Rand = Math.random();
  return (Min + Math.round(Rand * Range));
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//合并对象 override是否覆盖相同的属性
function mergeObj(des, src, override) {
  var result = {};
  for (var key in des) {
    result[key] = des[key];
  }
  for (var key in src) {
    if (override || !(key in des)) {
      result[key] = src[key];
    }
  }
  return result;
}

function mergeArray(des, src) {
  for (var i in src) {
    des.push(src[i]);
  }
  return des;
}

function json2Form(json) {
  var str = [];
  for (var p in json) {
    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
  }
  return str.join("&");
}

function getUriParams(uri, param) {
  var query = decodeURI(uri); //获取URL地址中？后的所有字符
  console.log(query)
  var iLen = param.length; //获取你的参数名称长度
  var iStart = query.indexOf(param); //获取你该参数名称的其实索引
  if (iStart == -1) //-1为没有该参数
    return "";
  iStart += iLen + 1;
  var iEnd = query.indexOf("&", iStart); //获取第二个参数的其实索引
  if (iEnd == -1) //只有一个参数
    return query.substring(iStart); //获取单个参数的参数值
  return query.substring(iStart, iEnd); //获取第二个参数的值
}

function url_build(url, data) {
  if (!url || !data) {
    return url;
  }
  url += (url.indexOf("?") != -1) ? "" : "?";
  for (var k in data) {
    url += ((url.indexOf("=") != -1) ? "&" : "") + k + "=" + data[k];
  }
  return url;
}

function swapItems(arr, index1, index2) {
  arr[index1] = arr.splice(index2, 1, arr[index1])[0];
  return arr;
}

function arrayUp(arr, index) {
  return swapItems(arr, index, index - 1);
}

function arrayDown(arr, index) {
  return swapItems(arr, index, index + 1);
}

module.exports = {
  splitTimer,
  formatNumber,
  getDay,
  getValuesForTimePicker,
  getDatasAfterDayColumnChange,
  getDatasAfterHourColumnChange,
  getTimeStrForTimerPicker,
  formatTitle,
  sectionToChinese,
  toFixed,
  formatTime,
  mergeObj,
  mergeArray,
  json2Form,
  getUriParams,
  url_build,
  arrayUp,
  arrayDown,
  timeAgo,
  getRandomNum,
  hash,
  getTouchDirection
};