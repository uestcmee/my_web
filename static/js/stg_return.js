var hist_fig_option = {
    title: {
        text: 'The Return ',
        left: 'left',
    },
    dataZoom: [
        {
            show: true,
            realtime: true,
        },
        {
            type: 'inside',
            realtime: true,
        }
    ],
    // grid:  {width: '75%', height: '75%'},//Àû²î
    tooltip: {
        trigger: 'axis',
    },
    xAxis: {
        show: true,
        type: 'category',
        data: [1, 2, 3]
    },
    yAxis: {
        name: 'price',
        type: 'value',
        axisLabel: {
            show: true,
            fontSize: 12,

        }
    },
    series: [
        {
            name: 'benchmark',
            type: 'line',
            smooth: false,
            data: [1, 2, 3],
        },
        {
            name: 'strategy',
            type: 'line',
            smooth: false,
            data: [2, 1, 2],
        },
    ]
};


var hist_fig = echarts.init(document.getElementById('hist_fig'));
hist_fig.setOption(hist_fig_option)
$(window).resize(function () {
    hist_fig.resize()

})