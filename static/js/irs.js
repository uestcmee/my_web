//期货的日内分钟数据

function fetch_irs_data() {
    $.ajax({
        // type:'GET',
        url: "/irs_data",
        timeout: 10000,
        // contentType:'application/json',
        dataType: 'json',
        success: function (data) {
            console.log(Array(data['Time']))
            irs_hist_option.xAxis[0].data = data['Time'];
            irs_hist_option.xAxis[1].data = data['Time'];

            irs_hist_option.series[0].data = data['2Y'];
            irs_hist_option.series[1].data = data['3Y'];
            irs_hist_option.series[2].data = data['5Y'];
            irs_hist_option.series[3].data = data['FR007_5Y'];

            year_list = Array(2, 3, 5)
            for (i = 0; i < year_list.length; i++) {
                spread = []
                for (j = 0; j < data['Time'].length; j++) {
                    spread.push((data[year_list[i] + 'Y'][j] - data['FR007_5Y'][j]).toFixed(4))
                }
                irs_hist_option.series[i + 4].data = spread
            }
            // irs_hist_option.series[3].data = data.ytm;
            console.log(data['5Y'] - data['2Y'])

            irs_hist.setOption(irs_hist_option);
            console.log('hello')

        },
        error: function () {
            console.log("失败了")
        }
    })
}

fetch_irs_data();
// setInterval(au_day_price, 30000);


