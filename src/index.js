/**
 * [datePicker plugin]
 * IOS风格日期选择器,仿滴滴打车预约用车时间选择器
 * @Author  jawil
 * @date    2017-02-17
 * @param   {[object]}   options [配置参数]
 */

import Picker from './datePicker.js'

const DEFAULT_OPTIONS = {
    prev_years: 100, // 前置多少年
    next_years: 10, // 后置多少年
    callBack: function (timeStr, timeStamp) { // 点击确认获取到的时间戳和时间字符串
        console.log(timeStr, timeStamp)
    }
};

function datePicker(options = {}) {

    const CHOICE_OPTIONS = function () {
        for (let attr in options) {
            DEFAULT_OPTIONS[attr] = options[attr]
        }
        return DEFAULT_OPTIONS
    }();

    let callBack = CHOICE_OPTIONS.callBack,
        prev_years = CHOICE_OPTIONS.prev_years,
        next_years = CHOICE_OPTIONS.next_years;

    // 默认选中的日期
    let current = {
        year_idx: 0,
        month_idx: 0,
        day_idx: 0
    };

    // 用户最终选择的日期
    let selected = {
        year: '',
        month: 1,
        day: 1
    };

    // 符合条件的数据
    let filter = {
        year: [],
        month: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        get_day: function () {
            // 选中月份的天数
            let t = new Date(selected.year, selected.month, 0);

            let minutesArr = [];
            for (let i = 1, max = t.getDate(); i <= max; i += 1) {
                minutesArr.push(i);
            }
            return minutesArr
        }
    };

    // 获取符合条件的预约天数
    filter.year = function () {
        let current_year = new Date().getFullYear(),
            yearsArr = [],
            tmp_year = 0;
        for (let i = prev_years; i >= 0; i -= 1) {
            tmp_year = current_year - i;
            yearsArr.push(tmp_year)
        }
        current.year_idx = yearsArr.length - 1;
        for (let i = 1; i <= next_years; i += 1) {
            tmp_year = current_year + i;
            yearsArr.push(tmp_year)
        }
        return yearsArr
    }();

    // 初始化数据
    let now = new Date();
    selected.year = now.getFullYear();
    selected.month = now.getMonth() + 1;
    selected.day = now.getDate();

    current.month_idx = selected.month - 1;
    current.day_idx = selected.day - 1;

    let wheel = document.querySelectorAll('.wheel-scroll'),
        wheelDay = wheel[0],
        wheelHour = wheel[1],
        wheelMinute = wheel[2];

    //初始化html结构
    const initHtml = function () {
        let wheelDayHtml = '',
            wheelHourHtml = '',
            wheelMinuteHtml = '';

        filter.year.forEach(function (ele, index) {
            wheelDayHtml += `<li class="wheel-item" data-index=${index}>${ele}</li>`
        });

        filter.month.forEach(function (ele, index) {
            wheelHourHtml += `<li class="wheel-item" data-index=${index}>${ele}</li>`
        });

        filter.get_day().forEach(function (ele, index) {
            wheelMinuteHtml += `<li class="wheel-item" data-index=${index}>${ele}</li>`
        });

        wheelDay.innerHTML = wheelDayHtml;
        wheelHour.innerHTML = wheelHourHtml;
        wheelMinute.innerHTML = wheelMinuteHtml;
    }();

    new Picker(wheelDay, current.year_idx);
    new Picker(wheelHour, current.month_idx);
    new Picker(wheelMinute, current.day_idx);

    Object.defineProperty(wheelDay, 'index', {
        set: function (value) {
            let y = filter.year[value];
            if (selected.year !== y) {
                createHTML(wheelHour, filter.month, '');
                createHTML(wheelMinute, filter.get_day(), '');
                new Picker(wheelHour, 0);
                new Picker(wheelMinute, 0);
                selected.year = y;
                selected.month = 1;
                selected.day = 1;
            }
        }
    });

    // 监测小时的变化，会影响分钟的变化
    Object.defineProperty(wheelHour, 'index', {
        set: function (value) {
            let m = filter.month[value];
            if (selected.month !== m) {
                selected.month = m;
                selected.day = 1;
                createHTML(wheelMinute, filter.get_day(), '');
                new Picker(wheelMinute, 0);
            }
        }
    });

    Object.defineProperty(wheelMinute, 'index', {
        set: function (value) {
            selected.day = filter.get_day()[value];
        }
    });

    function createHTML(ele, arr, unit) {
        let innerHTML = '';
        arr.forEach(function (item, index) {
            innerHTML += `<li class="wheel-item" data-index=${index}>${item + unit}</li>`
        });
        ele.innerHTML = innerHTML
    }

    const confirmTime = e => {
        e.preventDefault();
        e.stopPropagation();

        let timeStr = `${selected.year}-${selected.month}-${selected.day}`,
            timeStamp = new Date(`${selected.year}/${selected.month}/${selected.day}`).getTime();

        callBack && callBack(timeStr, timeStamp);
        document.querySelector('.mf-picker').style.display = 'none'
    };

    //显示隐藏
    const toggle = e => {
        e.preventDefault();
        e.stopPropagation();
        document.querySelector('.mf-picker').style.display = 'none'
    };


    document.querySelector('.mf-confirm').addEventListener('touchend', confirmTime, false);
    document.querySelector('.mf-cancel').addEventListener('touchend', toggle, false);

}

module.exports = datePicker;