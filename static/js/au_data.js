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
        // alert(tableId.rows[i].cells[1].innerHTML);
        times.push(tableId.rows[i].cells[0].innerHTML)
        ytm.push(tableId.rows[i].cells[4].innerHTML)

    }
    au_hist_option.xAxis[0].data = times;
    au_hist_option.series[0].data = ytm;
    au_hist.setOption(au_hist_option);
}
getTdValue();
setInterval(getTdValue,1000)

function high_freq_data(){
    $.ajax({
        url:'/au_high_freq',
        timeout:10000,
        dataType:'json',
        success:function (data){

           $('#qh_buy').html(data.qh_buy_p);
           $('#qh_sale').html(data.qh_sale_p);
           $('#xh_buy').html(data.xh_buy_p);
           $('#xh_sale').html(data.xh_sale_p);
           $('#qh_now').html(data.qh_now_p);
           $('#xh_now').html(data.xh_now_p);
           $('#ytm0').html(data.puretao);
           $('#ytm_zheng').html(data.zhengtao);
           $('#ytm_fan').html(data.fantao);
           $('#jiacha0').html(data.puretao_bp);
           $('#jiacha_zheng').html(data.zhengtao_bp);
           $('#jiacha_fan').html(data.fantao_bp);
           // $('#jiacha0').html($('#qh_now')-$('#xh_now'));

        },
        error: function (){
            console.log("高频数据获取失败");
        }
    })

}
high_freq_data();
setInterval(high_freq_data,1000)

function au_day_price() {
    $.ajax({
        // type:'GET',
        url: "/au_real_time",
        timeout: 10000,
        // contentType:'application/json',
        dataType:'json',
        success: function (data) {
             au_day_option.xAxis[0].data = data.times;
             au_day_option.series[0].data = data.future;
             au_day_option.series[1].data = data.Au_TD;

             au_delta_option.xAxis[0].data = data.times;
             au_delta_option.series[0].data = data.diff;

             au_ytm_option.xAxis[0].data = data.times;
             au_ytm_option.series[0].data = data.ytm;

             au_day.setOption(au_day_option);
             au_delta.setOption(au_delta_option);
             au_ytm.setOption(au_ytm_option);

             var date=new Date().toLocaleString()

             $('#data_update_time').html(date)
        },
        error: function () {

            console.log("失败了")
        }
    })
}

au_day_price();
setInterval(au_day_price, 30000);


