
function get_lookback_data() {
    var index=document.getElementById("SF").selectedIndex;
    sf=document.getElementById("SF").options[index].innerHTML;
    var index=document.getElementById("LMA").selectedIndex;
    lm=document.getElementById("LMA").options[index].innerHTML;
    var index=document.getElementById("SMA").selectedIndex;
    sm=document.getElementById("SMA").options[index].innerHTML;
    var index=document.getElementById("LF").selectedIndex;
    lf=document.getElementById("LF").options[index].innerHTML;
    $.ajax({
        type:'POST',
        url: "/lookback",
        data:JSON.stringify({'lf':lf,'sf':sf,'lm':lm,'sm':sm}),
        contentType:'application/json',
        dataType:'json',

        success: function (data) {
            ec_lookback_option.xAxis[0].data = data.day;
            ec_lookback_option.series[0].data = data.stg_r;
            ec_lookback_option.series[1].data = data.idx_r;

            ec_lookback.setOption(ec_lookback_option);
            update_wait('加载完成')
        },
        error: function () {
            console.log("失败了")
        }
    })
}


