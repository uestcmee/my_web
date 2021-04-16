function get_init_data(contract) {
    let init_info = {}
    let url = "http://futsse.eastmoney.com/static/113_" + contract + "_qt"
    axios.get(url)
        .then(function (response) {
                init_info = (response['data'])
                $('#qh_now').text(init_info['qt']['p'])
                $('#qh_buy').text(init_info['qt']['mrj'])
                $('#qh_sale').text(init_info['qt']['mcj'])
            }
            , function (err) {
                err
            })
    url = "http://futsse.eastmoney.com/static/118_AUTD_qt"
    axios.get(url)
        .then(function (response) {
                init_info = (response['data'])
                $('#xh_now').text(init_info['qt']['p'])
                $('#xh_buy').text(init_info['qt']['mrj'])
                $('#xh_sale').text(init_info['qt']['mcj'])
            }
            , function (err) {
                err
            })

}

// var all_date
function hist_ytm(table_info) {
    /*计算价差和收益率*/
    day_str = $('#delivery').text()
    delivery_day = new Date(day_str.substring(0, 4), day_str.substring(5, 7), day_str.substring(8, 10))
    console.log(Object.keys(table_info).length)
    for (var i = 0; i < Object.keys(table_info).length; i++) {
        let info = table_info[i]
        let qh = info['qihuo']
        let xh = info['xianhuo']
        let jiacha = parseFloat((qh - xh).toFixed(2))
        // console.log(info)
        the_day_str = info['Date']
        the_day = new Date(the_day_str.substring(0, 4), the_day_str.substring(5, 7), the_day_str.substring(8, 10))
        day_to_delivery = Math.floor((delivery_day.getTime() - the_day.getTime()) / (24 * 3600 * 1000)) + 1
        let ytm = jiacha * 365 / ((day_to_delivery) * (xh)) * 100
        ytm = parseFloat(ytm.toFixed(4))
        info['diff'] = jiacha
        info['ytm'] = ytm
        // console.log(jiacha)
    }
    return table_info

}


function get_hist_data(symbol) {
    url = "/au_data/hist"
    axios.post(url, {'symbol': symbol})
        .then(function (response) {
                let price_dict = eval(response)
                all_date = price_dict['data']
                let price_and_ytm = hist_ytm(all_date)
                app['_data']['au_data'] = price_and_ytm
                getTdValue()
            }
            , function (err) {
                err
            })

}

function get_contract() {
    $.ajax({
        url: '/au_contract_list',
        success: function (data) {
            $('#qhhy').contents().remove();
            data = JSON.parse(data)['delivery_day']
            console.log(data)
            i = 0
            for (var key in data) {
                if (i === 0) {
                    $('#most_active').html(key)
                    // 开始获取主力合约高频数据

                    get_init_data(key)
                    get_hist_data(key)

                    init_high_freq = qh_high_freq(key)
                    i = 1
                }
                var item = data[key]
                $('<option value=' + key + ' end_day=' + item + '>' + key + '</option>').appendTo('#qhhy');
            }
            fresh_delivery_day()

        },
        error: function () {
            console.log('合约列表获取失败')
        }
    })
}

get_contract()

//更新历史数据
function getTdValue(col = 4) {
    // var sleep = function (time) {
    //     var startTime = new Date().getTime() + parseInt(time, 10);
    //     while (new Date().getTime() < startTime) {
    //     }
    // };
    // sleep(2000);
    let tableData = app['_data']['au_data']
    // var tableId = document.getElementById("hist_table");
    // var times = tableData['Date'];
    // var ytm = tableData['ytm'];
    var times = Array();
    var ytm = Array();

    for (var i in Object.keys(tableData)) {

        times.push(tableData[i]['Date'])
        ytm.push(tableData[i]['ytm'])

    }
    au_hist_option.xAxis[0].data = times;
    au_hist_option.series[0].data = ytm;
    // console.log([times.length - 1, ytm[ytm.length - 1]])
    au_hist_option.series[0].markPoint.data[2].coord = [times.length - 1, parseFloat(ytm[ytm.length - 1])]
    au_hist_option.series[0].markPoint.data[2].value = '最新\n' + ytm[times.length - 1]

    au_hist.setOption(au_hist_option);
}


//褪色
function fade() {

    document.getElementById('qh_now').classList.remove('red', 'green')
    document.getElementById('xh_now').classList.remove('red', 'green')
    document.getElementById('qh_buy').classList.remove('red', 'green')
    document.getElementById('xh_buy').classList.remove('red', 'green')
    document.getElementById('qh_sale').classList.remove('red', 'green')
    document.getElementById('xh_sale').classList.remove('red', 'green')

}

setInterval(fade, 1000)

//接受消息的EventSource
var source = new EventSource("http://33.futsse.eastmoney.com/sse/118_AUTD_qt");
//收到消息后的处理
source.onmessage = function (event) {
    var res = JSON.parse(event.data)
    renderHead(res['qt'], 'xh')
}

//期货高频数据
function qh_high_freq(contract) {
    //先获取一个初始值
    var source_qh = new EventSource("http://33.futsse.eastmoney.com/sse/113_" + contract + "_qt");
    source_qh.onmessage = function (event) {
        var res = JSON.parse(event.data)
        renderHead(res['qt'], 'qh')
    }

    return source_qh
}

//更新最后交割日值
function fresh_delivery_day() {
    var select_box = $('#qhhy')[0]
    for (var i = 0; i < select_box.length; i++) {
        if (select_box[i].selected === true) {//寻找被选中的值
            day_str = select_box[i].getAttribute('end_day')
            delivery_str = day_str.substring(0, 4) + '-' + day_str.substring(4, 6) + '-' + day_str.substring(6, 8)
            $('#delivery').text(delivery_str)
            $('#qh_now').text('init')
            $('#qh_buy').text('init')
            $('#qh_sale').text('init')
            $('#stock_time_qh').text('init')
        }
    }

}

//改变合约
function change_contract(contract) {
    fresh_delivery_day()
    get_init_data(contract)
    get_hist_data(contract)
    getTdValue();
    // update_ytm()
    init_high_freq.close()
    init_high_freq = qh_high_freq(contract)
}

//处理数据颜色
function getColor(str) {
    var context = str.toString();
    context = context.replace("%", "");
    if (context == 0 || isNaN(context)) {
        return "";
    } else if (context > 0) {
        return "red";
    } else {
        return "green";
    }
}

/**
 * 渲染头部
 * @param {object} items
 * zxj: 最新价
 * zde: 涨跌额
 * zdf: 涨跌幅
 * jkj: 今开价
 * zjs: 昨结算
 * zgj: 最高价
 * zdj：最低价
 * cjl: 成交量
 * ccl: 持仓量
 * wp:外盘
 * np:内盘
 * cc:仓差
 * rz:日增
 * zsj：昨收价
 * mcj:卖出价
 * mcl:卖出量
 * mrj:买入价
 * mrl:买入量
 * dtj：跌停价
 * cje：成交额
 * kp： 开平
 * quote_title_0：名称
 * quote_title_1： 代码
 * jzjs： 今结算价
 * zsjd：展示精度
 */
function renderHead(items, product) {
    var list = [
        {"name": product + "_now", "item": items.p, "color": getColor(items.zdf)},
        {
            "name": product + "_sale",
            "item": items.mcj,
            "color": getColor(items.mcj - document.getElementById(product + '_sale').innerText)
        },
        {
            "name": product + "_buy",
            "item": items.mrj,
            "color": getColor(items.mrj - document.getElementById(product + '_buy').innerText)
        },
    ];
    for (var i = 0; i < list.length; i++) {
        var name = $("#" + list[i].name);
        name.text(list[i].item);
        name.removeClass("red").removeClass("green").addClass(list[i].color);
    }

    //时间
    var now_time
    if (items.jyzt == 0) {
        if (items.utime) {
            var jysj = Dealjysj(items.utime, "-");
            now_time = jysj
            $("#stock_time_" + product).html(jysj);
        }
    } else {
        if (items.spsj) {
            var spsj = Dealjysj(items.spsj, "-");
            now_time = spsj
            $("#stock_time_" + product).html(spsj);
        }
    }
}

function update_ytm() {
    /*计算价差和收益率*/
    function get_ytm(jiacha) {
        // TODO 获取列表中当前活跃项目
        // TODO 更新此处的时间
        day_str = $('#delivery').text()
        delivery_day = new Date(day_str.substring(0, 4), day_str.substring(5, 7), day_str.substring(8, 10))

        today = new Date()
        day_to_delivery = Math.floor((delivery_day.getTime() - today.getTime()) / (24 * 3600 * 1000)) + 1

        ytm = jiacha * 365 / ((day_to_delivery) * ($('#xh_now').text())) * 100
        return ytm
    }

    var calc_dict = [
        {"name": "pure", "price_diff": $('#qh_now').text() - $('#xh_now').text()},
        {"name": "fan", "price_diff": $('#qh_sale').text() - $('#xh_buy').text()},
        {"name": "zheng", "price_diff": $('#qh_buy').text() - $('#xh_sale').text()},
    ]
    for (var i = 0; i < calc_dict.length; i++) {
        calc_dict[i]['ytm'] = get_ytm(calc_dict[i].price_diff)
        $("#jiacha_" + calc_dict[i].name).text(calc_dict[i].price_diff.toFixed(2));
        $("#ytm_" + calc_dict[i].name).text(calc_dict[i].ytm.toFixed(2));
    }
}

setInterval(update_ytm, 1000)

// 高频数据图
function high_freq_fig() {
    // 避免过长
    if ($('#stock_time_xh').text() == 'init' && $('#stock_time_qh').text() == 'init') return false
    var d = new Date();
    var now_time = ("0" + (d.getHours())).slice(-2) + ':' + ("0" + (d.getMinutes())).slice(-2) + ':' + ("0" + (d.getSeconds())).slice(-2);
    if ((high_freq_pic_option.xAxis[0].data.length) > 60) {
        high_freq_pic_option.xAxis[0].data.splice(0, 1);
        high_freq_pic_option.series[0].data.splice(0, 1);
        high_freq_pic_option.series[1].data.splice(0, 1);
        high_freq_pic_option.series[2].data.splice(0, 1);

    }
    high_freq_pic_option.xAxis[0].data.push(now_time);
    high_freq_pic_option.series[0].data.push(Number($('#ytm_pure').text()));
    high_freq_pic_option.series[1].data.push(Number($('#ytm_zheng').text()));
    high_freq_pic_option.series[2].data.push(Number($('#ytm_fan').text()));

    high_freq_pic.setOption(high_freq_pic_option)
}

//交易时间的处理
function Dealjysj(val) {
    try {
        var d = new Date(val * 1000);  //("0" + (d.getMonth() + 1)).slice(-2)    d.getMinutes()  d.getMinutes()  d.getSeconds()
        var jysj = ("0" + (d.getHours())).slice(-2) + ':' + ("0" + (d.getMinutes())).slice(-2) + ':' + ("0" + (d.getSeconds())).slice(-2);
        return jysj;
    } catch (e) {
        return '-'
    }

}

setInterval(high_freq_fig, 1000)

// document.getElementById('hist_table').removeAttribute('border')