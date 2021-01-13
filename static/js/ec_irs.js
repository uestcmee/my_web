// 指定图表的配置项和数据
var irs_hist_option = {
    title: {
        text: '5Y_IRS与国债利差',
        // textStyle: {
        //     fontSize: 14,
        // },
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


var irs_box_option = {
    title: [
        {
            text: '收益率分位数',
            subtext: '日期',
            left: 'left',
        },

    ],
    legend: {
        top: '10%',
        data: ['国债', '国开', '口行']
    },
    tooltip: {
        trigger: 'item',
        axisPointer: {
            type: 'shadow'
        }
    },
    grid: {
        left: '10%',
        right: '10%',
        bottom: '15%'
    },
    xAxis: {
        type: 'category',
        boundaryGap: true,
        nameGap: 30,
        splitArea: {
            show: true
        },
        splitLine: {
            show: false
        },
        data: ['1Y', '2Y', '3Y', '5Y', '7Y', '10Y'],
    },
    yAxis: {
        type: 'value',
        // name: '中债',
        splitArea: {
            show: true
        },
        axisLabel: {
            show: true,
            fontSize: 12,
            formatter: function (value) {
                return value + '%';
            }
        }
        // min: 2.5
    },
    series: [
        {
            name: '国债',
            type: 'boxplot',
            data: [],
            tooltip: {formatter: formatter},
            markPoint: {name: '国债分位数', data: [], symbolRotate: 90}
        }, {
            name: '国开',
            type: 'boxplot',
            data: [],
            tooltip: {formatter: formatter},
            markPoint: {name: '国开分位数', data: [], symbolRotate: 0}
        }, {
            name: '口行',
            type: 'boxplot',
            data: [],
            tooltip: {formatter: formatter},
            markPoint: {name: '口行分位数', data: [], symbolRotate: -90}
        },
    ]
};


var time_spread_option = {
    title: [
        {
            text: '期限利差分位数',
            subtext: '日期',
            left: 'left',
        },

    ],
    // legend: {
    //     top: '10%',
    //     data: ['国债','国开','口行']
    // },
    tooltip: {
        trigger: 'item',
        axisPointer: {
            type: 'shadow'
        }
    },
    grid: {
        left: '10%',
        right: '10%',
        bottom: '15%'
    },
    xAxis: {
        type: 'category',
        boundaryGap: true,
        nameGap: 30,
        // splitArea: {
        //     show: true
        // },
        splitLine: {
            show: false
        },
        data: []
    },
    yAxis: {
        type: 'value',
        // name: '中债',
        splitArea: {
            show: true
        },
        axisLabel: {
            show: true,
            fontSize: 12,
            formatter: function (value) {
                return value * 100 + 'bp';
            }
        }
    },
    series: [
        {
            name: '期限利差',
            type: 'boxplot',
            data: [],
            tooltip: {formatter: formatter},
            markPoint: {name: '国债分位数', data: []}
        }
    ]
};


var type_spread_option = {
    title: [
        {
            text: '品种利差分位数(国开-国债)',
            subtext: '日期',
            left: 'left',
        },

    ],
    // legend: {
    //     top: '10%',
    //     data: ['国债','国开','口行']
    // },
    tooltip: {
        trigger: 'item',
        axisPointer: {
            type: 'shadow'
        }
    },
    grid: {
        left: '10%',
        right: '10%',
        bottom: '15%'
    },
    xAxis: {
        type: 'category',
        boundaryGap: true,
        nameGap: 30,
        // splitArea: {
        //     show: true
        // },
        splitLine: {
            show: false
        },
        data: []
    },
    yAxis: {
        type: 'value',
        // name: '中债',
        splitArea: {
            show: true
        },
        axisLabel: {
            show: true,
            fontSize: 12,
            formatter: function (value) {
                return value * 100 + 'bp';
            }
        }
    },
    series: [
        {
            name: '品种利差',
            type: 'boxplot',
            data: [],
            tooltip: {formatter: formatter},
            markPoint: {name: '国债分位数', data: []}
        }
    ]
};


function formatter(param) {
    return [
        param.name + ': ',
        '最大值: ' + param.data[5],
        '上分位: ' + param.data[4],
        '中位数: ' + param.data[3],
        '下分位: ' + param.data[2],
        '最小值: ' + param.data[1]
    ].join('<br/>');
}

var irs_hist = echarts.init(document.getElementById('irs_hist'));
irs_hist.setOption(irs_hist_option);


var box_fig = echarts.init(document.getElementById('box_fig'));
box_fig.setOption(irs_box_option);


var time_spread = echarts.init(document.getElementById('time_spread'));
time_spread.setOption(time_spread_option);

var type_spread = echarts.init(document.getElementById('type_spread'));
type_spread.setOption(type_spread_option);