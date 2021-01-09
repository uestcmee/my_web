
function get_contract(){
$.ajax({
    url:'/au_contract_list',
    success: function(data){
        $('#qhhy').contents().remove();
        data=JSON.parse(data)['delivery_day']
        console.log(data)
        i=0
        for (var key in data){
            if (i===0){
                $('#most_active').html(key)
                // 开始获取主力合约高频数据
                init_high_freq=qh_high_freq(key)
                i=1
            }
            var item = data[key]
            $('<option value='+key+' end_day='+item+'>'+key+'</option>').appendTo('#qhhy');
        }
        fresh_delivery_day()

    },
    error:function(){
        console.log('合约列表获取失败')
    }
})
}
get_contract()

function getTdValue()
{
    var sleep = function(time) {
        var startTime = new Date().getTime() + parseInt(time, 10);
        while(new Date().getTime() < startTime) {}
    };
    sleep(1000);
    var tableId = document.getElementById("hist_table");
    var times =  Array();
    var ytm =  Array();

    for(var i=1; i < tableId.rows.length;i++)
    {

        times.push(tableId.rows[i].cells[0].innerHTML)
        ytm.push(tableId.rows[i].cells[4].innerHTML)

    }
    au_hist_option.xAxis[0].data = times;
    au_hist_option.series[0].data = ytm;
    au_hist.setOption(au_hist_option);
}
getTdValue();

function fade(){

    document.getElementById('qh_now').classList.remove('red','green')
    document.getElementById('xh_now').classList.remove('red','green')
    document.getElementById('qh_buy').classList.remove('red','green')
    document.getElementById('xh_buy').classList.remove('red','green')
    document.getElementById('qh_sale').classList.remove('red','green')
    document.getElementById('xh_sale').classList.remove('red','green')

}
setInterval(fade,1000)


var source=new EventSource("http://33.futsse.eastmoney.com/sse/118_AUTD_qt");

source.onmessage=function(event)
{
    var res=JSON.parse(event.data)
    renderHead(res['qt'],'xh')
}

function qh_high_freq(contract){
    var source_qh=new EventSource("http://33.futsse.eastmoney.com/sse/113_"+contract+"_qt");
    source_qh.onmessage=function(event)
    {
        var res=JSON.parse(event.data)
        renderHead(res['qt'],'qh')
    }
    return source_qh
}

function fresh_delivery_day (){
    var select_box=$('#qhhy')[0]
    for (var i =0;i<select_box.length;i++){
        if (select_box[i].selected===true){
            day_str=select_box[i].getAttribute('end_day')
            delivery_str=day_str.substring(0,4)+'-'+day_str.substring(4,6)+'-'+day_str.substring(6,8)
            $('#delivery').text(delivery_str)
        }
    }

}


function change_contract(contract){
    fresh_delivery_day()
    init_high_freq.close()
    init_high_freq=qh_high_freq(contract)
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
function renderHead(items,product) {
    // console.log(
    //     items.p
    // )
    var list = [
        { "name": product+"_now", "item": items.p  , "color": getColor(items.zdf) },
        { "name": product+"_sale", "item": items.mcj  , "color": getColor(items.mcj - document.getElementById(product+'_sale').innerText)},
        { "name": product+"_buy", "item": items.mrj , "color": getColor(items.mrj - document.getElementById(product+'_buy').innerText)},
    ];
    // console.log(list)
    // var list = [
        // { "name": "zxj", "item": items.p  == "-" ? "-" : cancelZsjd(items.p, items.zsjd), "color": getColor(items.zdf) },
        // { "name": "zde", "item": items.zde  == "-" ? "-" : cancelZsjd(items.zde, items.zsjd), "color": getColor(items.zdf) },
        // { "name": "zdf", "item": items.zdf  == "-" ? "-" : (items.zdf).toFixed(2) + '%', "color": getColor(items.zdf) },
        // { "name": "jkj", "item": items.o  == "-" ? "-" : cancelZsjd(items.o, items.zsjd), "color": getColor(items.o - items.zjsj) },
        // { "name": "zjs", "item": items.zjsj  == "-" ? "-" : cancelZsjd(items.zjsj, items.zsjd) },
        // { "name": "zgj", "item": items.h  == "-" ? "-" : cancelZsjd(items.h, items.zsjd), "color": getColor(items.h - items.zjsj) },
        // { "name": "zdj", "item": items.l  == "-" ? "-" : cancelZsjd(items.l, items.zsjd), "color": getColor(items.l - items.zjsj) },
        // { "name": "cjl", "item": items.vol == "-" ? "-" : NumbericFormat(items.vol) },
        // { "name": "ccl", "item": items.ccl == "-" ? "-" : NumbericFormat(items.ccl) },
        // { "name": "wp", "item": items.wp == "-" ? "-" : NumbericFormat(items.wp), "color": 'red' },
        // { "name": "np", "item": items.np == "-" ? "-" : NumbericFormat(items.np), "color": 'green' },
        // { "name": "cc", "item": items.cclbh == "-" ? "-" : NumbericFormat(items.cclbh) },
        // { "name": "rz", "item": items.rz  == "-" ? "-" : items.rz, "color": getColor(items.rz) },
        // { "name": "zsj", "item": items.qrspj  == "-" ? "-" : cancelZsjd(items.qrspj, items.zsjd)},
        // { "name": "mcj", "item": items.mcj  == "-" ? "-" : cancelZsjd(items.mcj, items.zsjd), "color": getColor(items.mcj - items.zjsj)},
        // { "name": "mcl", "item": items.mcl  == "-" ? "-" : items.mcl},
        // { "name": "mrj", "item": items.mrj  == "-" ? "-" : cancelZsjd(items.mrj, items.zsjd), "color": getColor(items.mrj - items.zjsj)},
        // { "name": "mrl", "item": items.mrl  == "-" ? "-" : items.mrl},
        // { "name": "quote_title_0", "item": items.name  == "-" ? "-" : items.name},
        // { "name": "quote_title_1", "item": items.dm  == "-" ? "-" : (items.dm).toUpperCase()}
        // { "name": "zde", "item": items.f169 == "-" ? "-" : (items.f169), "color": getColor(items.zdf) },
        // { "name": "zdf", "item": items.f170 == "-" ? "-" : (items.f170) + "%", "color": getColor(items.zdf) },
        // { "name": "jk", "item": items.f46 == "-" ? "-" : (items.f46), "color": getColor(items.f46 - items.f60) },
        // { "name": "zs", "item": items.f60 == "-" ? "-" : (items.f60)},
        // { "name": "zg", "item": items.f44 == "-" ? "-" : (items.f44), "color": getColor(items.f44 - items.f60) },
        // { "name": "zd", "item": items.f45 == "-" ? "-" : (items.f45), "color": getColor(items.f45 - items.f60) },
        // { "name": "zt", "item": items.f51 == "-" ? "-" : (items.f51), "color": getColor(items.f51 - items.f60) },
        // { "name": "dt", "item": items.f52 == "-" ? "-" : (items.f52), "color": getColor(items.f52 - items.f60) },
        // { "name": "hs", "item": items.f168 == "-" ? "-" : items.f168 + "%" },
        // { "name": "lb", "item": items.f50 == "-" ? "-" : (items.f50)},
        // { "name": "cjl", "item": items.f47 == "-" ? "-" : NumbericFormat(items.f47) },
        // { "name": "cje", "item": items.f48 == "-" ? "-" : NumbericFormat(items.f48) },
        // { "name": "sy", "item": items.f162 == "-" ? "-" : (items.f162)},
        // { "name": "sj", "item": items.f167 == "-" ? "-" : (items.f167)},
        // { "name": "zsz", "item": items.f116 == "-" ? "-" : NumbericFormat(items.f116) },
        // { "name": "ltsz", "item": items.f117 == "-" ? "-" : NumbericFormat(items.f117) }
    // ];
    for (var i = 0; i < list.length; i++) {
        var name = $("#" + list[i].name);
        name.text(list[i].item);
        name.removeClass("red").removeClass("green").addClass(list[i].color);
    }

    //时间
    var now_time
    if(items.jyzt == 0) {

        if(items.utime) {
            var jysj =  Dealjysj(items.utime, "-");
            now_time=jysj
            $("#stock_time_"+product).html(jysj );
        }

    }else {

        if(items.spsj) {
            var spsj = Dealjysj(items.spsj, "-");
            now_time=spsj
            $("#stock_time_"+product).html( spsj );
        }
    }

    /*计算价差和收益率*/
    function get_ytm(jiacha){
        // TODO 获取列表中当前活跃项目
        // TODO 更新此处的时间
        day_str=$('#delivery').text()
        delivery_day=new Date(day_str.substring(0,4),day_str.substring(4,6),day_str.substring(6,8))

        today=new Date()
        day_to_delivery=Math.floor((delivery_day.getTime()-today.getTime())/ (24 * 3600 * 1000))+1
        // console.log(day_to_delivery)

        ytm = jiacha * 365 / ((day_to_delivery) * ($('#xh_now').text())) * 100
        return ytm
    }
    var calc_dict=[
        { "name": "pure", "price_diff": $('#qh_now').text()-$('#xh_now').text() },
        { "name": "fan", "price_diff": $('#qh_sale').text()-$('#xh_buy').text() },
        { "name": "zheng", "price_diff": $('#qh_buy').text()-$('#xh_sale').text() },
    ]
    for (var i = 0; i < calc_dict.length; i++) {
        calc_dict[i]['ytm']=get_ytm(calc_dict[i].price_diff)
        $("#jiacha_" + calc_dict[i].name).text(calc_dict[i].price_diff.toFixed(2));
        $("#ytm_" + calc_dict[i].name).text(calc_dict[i].ytm.toFixed(2));

    }

}

// 高频数据图
function high_freq_fig(){
    // 避免过长
    if ($('#ytm_pure').text()=='init' )return false
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


setInterval(high_freq_fig,1000)


function Dealjysj(val) {
    try {

        var d = new Date(val * 1000);  //("0" + (d.getMonth() + 1)).slice(-2)    d.getMinutes()  d.getMinutes()  d.getSeconds()
        var jysj = ("0" + (d.getHours())).slice(-2) + ':' + ("0" + (d.getMinutes())).slice(-2) + ':' + ("0" + (d.getSeconds())).slice(-2);

        return jysj;

    } catch(e) {
        return '-'
    }

}


//期货的日内分钟数据
function au_day_price() {
    $.ajax({
        // type:'GET',
        url: "/au_real_time",
        timeout: 10000,
        // contentType:'application/json',
        dataType:'json',
        success: function (data) {
            au_day_option.xAxis[0].data = data.times;
            au_day_option.xAxis[1].data = data.times;
            // au_day_option.xAxis[2].data = data.times;
            au_day_option.series[0].data = data.future;
            au_day_option.series[1].data = data.Au_TD;
            au_day_option.series[2].data = data.diff;
            au_day_option.series[3].data = data.ytm;
            au_day.setOption(au_day_option);

        },
        error: function () {
            console.log("失败了")
        }
    })
}

au_day_price();
setInterval(au_day_price, 30000);


