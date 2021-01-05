
function get_contract(){
    $.ajax({
    url:'/au_contract_list',
    success: function(data){
        $('#qhhy').contents().remove();
        console.log(data)
        for (var key in data){
            console.log(key)
            var item = data[key]
            $('<option value='+key+'>'+item+'</option>').appendTo('#qhhy');
        }
//        $('#qhhy').val('AU2106');
        $('#most_active').html(data[0])
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
        type:"POST",
        url:'/au_high_freq',
        data:JSON.stringify({'name':$("#qhhy").find("option:selected").text()}),
        contentType:'application/json',
        timeout:10000,
        dataType:'json',
        success:function (data){
            

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
           $('#data_update_time').html(data.fresh_time)

        },
        error: function (){
            console.log("高频数据获取失败");
        }
    })

}

high_freq_data();
var loop=setInterval(high_freq_data,2000)

//如果窗口不活跃，则降低刷新评率
window.addEventListener('blur', ()=>{
    document.title = document.title.split ('（')[0]+'（窗口不活跃）';
    clearInterval(loop)
    loop=setInterval(high_freq_data,10000)

}, true);

window.addEventListener('focus', ()=>{
    document.title = document.title.split ('（')[0]+'（窗口活跃）';
    clearInterval(loop)
    loop=setInterval(high_freq_data,2000)

}, true);



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

             // var date=new Date().toLocaleString()

        },
        error: function () {
            console.log("失败了")
        }
    })
}

au_day_price();
setInterval(au_day_price, 30000);


