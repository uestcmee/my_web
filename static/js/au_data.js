
function get_contract(){
    $.ajax({
    url:'/au_contract_list',
    success: function(data){
        $('#qhhy').contents().remove();
        for (var key in data){
            var item = data[key]

            $('<option value='+key+'>'+item+'</option>').appendTo('#qhhy');
        }
    },
    error:function(){

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
fade();
setInterval(fade,1000)

function high_freq_data(){
    var sleep = function(time) {
        var startTime = new Date().getTime() + parseInt(time, 10);
        while(new Date().getTime() < startTime) {}
    };
    $.ajax({
        url:'/au_high_freq',
        timeout:10000,
        dataType:'json',
        success:function (data){

           $('#qh_buy').html(data.qh_buy_p);
           $('#qh_sale').html(data.qh_sale_p);
           $('#xh_buy').html(data.xh_buy_p);
           $('#xh_sale').html(data.xh_sale_p);
           if (data.qh_now_p > document.getElementById('qh_now').innerText){
               document.getElementById('qh_now').classList.add('red')
           }
           else if (data.qh_now_p < document.getElementById('qh_now').innerText){
               document.getElementById('qh_now').classList.add('green')
           }
           else {

           }
            if (data.xh_now_p > document.getElementById('xh_now').innerText){
                document.getElementById('xh_now').classList.add('red')
            }
            else if (data.xh_now_p < document.getElementById('xh_now').innerText){
                document.getElementById('xh_now').classList.add('green')
            }
            else {

            }
            if (data.xh_buy_p > document.getElementById('xh_buy').innerText){
                document.getElementById('xh_buy').classList.add('red')
            }
            else if (data.xh_buy_p < document.getElementById('xh_buy').innerText){
                document.getElementById('xh_buy').classList.add('green')
            }
            else {

            }
            if (data.qh_buy_p > document.getElementById('qh_buy').innerText){
                document.getElementById('qh_buy').classList.add('red')
            }
            else if (data.qh_buy_p < document.getElementById('qh_buy').innerText){
                document.getElementById('qh_buy').classList.add('green')
            }
            else {

            }
            if (data.xh_sale_p > document.getElementById('xh_sale').innerText){
                document.getElementById('xh_sale').classList.add('red')
            }
            else if (data.xh_sale_p < document.getElementById('xh_sale').innerText){
                document.getElementById('xh_sale').classList.add('green')
            }
            else {

            }
            if (data.qh_sale_p > document.getElementById('qh_sale').innerText){
                document.getElementById('qh_sale').classList.add('red')
            }
            else if (data.qh_sale_p < document.getElementById('qh_sale').innerText){
                document.getElementById('qh_sale').classList.add('green')
            }
            else {

            }
           $('#qh_now').html(data.qh_now_p);
           $('#xh_now').html(data.xh_now_p);
           $('#ytm0').html(data.puretao);
           $('#ytm_zheng').html(data.zhengtao);
           $('#ytm_fan').html(data.fantao);
           $('#jiacha0').html(data.puretao_bp);
           $('#jiacha_zheng').html(data.zhengtao_bp);
           $('#jiacha_fan').html(data.fantao_bp);
           $('#data_update_time').html(data.fresh_time)


        },
        error: function (){
            console.log("高频数据获取失败");
        }
    })

}

high_freq_data();
setInterval(high_freq_data,1000)
//function noon_stop(){
//    var inter=setInterval(high_freq_data,1000)
//
//    var now=new Date()
//    var noon_0 = new Date()
//        noon_0.setHours(11,30,0)
//    var noon_1 = new Date()
//        noon_1.setHours(12,59,0)
//    if (now>noon_0 && now<noon_1){
//        clearInterval(inter)
//    }
//    else{
//    }
//}
//setInterval(noon_stop,1000)//1s检测一次在中午

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

        },
        error: function () {

            console.log("失败了")
        }
    })
}

au_day_price();
setInterval(au_day_price, 30000);


