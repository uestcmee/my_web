// 指定图表的配置项和数据
var irs_hist_option = {
    title: {
        text: '5Y_IRS与国债利差',
        textStyle: {
            fontSize: 14,
        },
        left: 'left',
    },
    dataZoom: [
        {
            show: true,
            realtime: true,
            xAxisIndex: [0, 1]
        },
        {
            type: 'inside',
            realtime: true,
            xAxisIndex: [0, 1]
        }
    ],
    grid: [
        {width: '80%', height: '40%'},//利差
        {width: '80%', height: '30%', top: '60%'},//收益率
    ],
    tooltip: {
        trigger: 'axis',
    },
    axisPointer: {
        link: {xAxisIndex: 'all'}
    },
    xAxis: [
        {gridIndex: 0, show: false, type: 'category',},
        {gridIndex: 1, type: 'category',},

    ],
    yAxis: [
        {
            name: '利差',
            gridIndex: 0,
            type: 'value',
            axisLabel: {
                show: true,
                fontSize: 12,
                formatter: function (value) {
                    return value * 100 + 'bp';
                }
            }
        },
        {
            name: '收益率',
            gridIndex: 1,
            type: 'value',
            axisLabel: {
                show: true,
                fontSize: 12,
                formatter: function (value) {
                    return value + '%';
                }
            },
            min: 1.2,
        },

    ],
    legend: {
        data: ['2Y-IRS5Y', '3Y-IRS5Y', '5Y-IRS5Y', '2Y国债', '3Y国债', '5Y国债', 'IRS_5Y'],
        left: 'right',
    },
    series: [
        {
            xAxisIndex: 0,
            yAxisIndex: 0,
            name: '2Y-IRS5Y',
            type: 'line',
            smooth: false,
            data: [],
            markPoint: {
                data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                ]
            },

        },
        {
            xAxisIndex: 0,
            yAxisIndex: 0,
            name: '3Y-IRS5Y',
            type: 'line',
            smooth: false,
            data: [],
            markPoint: {
                data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                ]
            }
        },
        {
            xAxisIndex: 0,
            yAxisIndex: 0,
            name: '5Y-IRS5Y',
            type: 'line',
            smooth: false,
            data: [],
            markPoint: {
                data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                ]
            }
        },
        {
            xAxisIndex: 1,
            yAxisIndex: 1,
            name: '2Y国债',
            type: 'line',
            smooth: true,
            data: []
        },
        {
            xAxisIndex: 1,
            yAxisIndex: 1,
            name: '3Y国债',
            type: 'line',
            smooth: true,
            data: []
        },
        {
            xAxisIndex: 1,
            yAxisIndex: 1,
            name: '5Y国债',
            type: 'line',
            smooth: true,
            data: []
        },
        {
            xAxisIndex: 1,
            yAxisIndex: 1,
            name: 'IRS_5Y',
            type: 'line',
            smooth: true,
            data: []
        },

    ]
};

var irs_hist = echarts.init(document.getElementById('irs_hist'));
irs_hist.setOption(irs_hist_option);

