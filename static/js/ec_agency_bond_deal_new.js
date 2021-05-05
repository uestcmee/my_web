//指定图表的配置项和数据
var init_option = {
    title: {
        text: '债券收益率散点图',
        textStyle: {
            fontSize: 14,
        },
        left: 'left',
    },
    tooltip: {
        trigger: 'item',
        axisPointer: {
            type: 'cross',
            lineStyle: {}
        },
        formatter: ''
        // formatter:'{@bond_name}<br/>期限:{c}<br/>收益率:{b}',
        // formatter: function (param) {
        //     return 'nihao'+param;
        // },
    },
    legend: {
        data: ['中债中短票(AAA)', '成交'],
        left: 'right',
    },
    grid: {
        left: '20%',
        right: '6%',
        bottom: '10%',
        top: 50,
        containLabel: false
    },
    xAxis: [{
        // type: 'category',
        type: 'value',
        // data: [1,2,3]
    }],
    yAxis: [{
        type: 'value',
        min: 'dataMin',
        axisLabel: {
            show: true,
            fontSize: 12,
        },
        axisLine: {
            show: true
        },
        splitLine: {
            show: true,
            lineStyle: {

                width: 1,
                type: 'solid'
            }
        }
    }],
    dataZoom: [{
        start: 10,
        type: "inside",
    }],
    visualMap: [{
        type: 'piecewise',
        splitNumber: 7,
        min: 0.0,
        max: 1.4,
        minOpen: true,
        maxOpen: true,
        dimension: 3,
        text: ['高利差', '低利差'],
        inRange: {
            color: ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"]
        }
    }],
    series: [{
        name: '成交',
        type: 'scatter',
        smooth: true,
        data: [3, 3, 3],
        itemStyle: {
            borderColor: "rgba(160, 160, 160, 1)"
        }
    },
        {
            name: '中债中短票(AAA)',
            type: 'line',
            smooth: true,
            data: [2, 1, 2],
            symbol: "none",
        }],

};
// 指定图表的配置项和数据
var fig = echarts.init(document.getElementById('fig_area'));
// fig.setOption(init_option);
$(window).resize(function () {
    fig.resize()
})
