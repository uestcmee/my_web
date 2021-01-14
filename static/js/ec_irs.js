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
            // xAxisIndex: [0, 1]
        },
        {
            type: 'inside',
            realtime: true,
            // xAxisIndex: [0, 1]
        }
    ],
    grid: [
        {width: '80%', height: '75%'},//利差
        // {width: '80%', height: '30%', top: '60%'},//收益率
    ],
    tooltip: {
        trigger: 'axis',
    },
    // axisPointer: {
    //     link: {xAxisIndex: 'all'}
    // },
    xAxis: [
        { show: true, type: 'category',},
        // {gridIndex: 1, type: 'category',},

    ],
    yAxis: [
        {
            name: '利差',
            // gridIndex: 0,
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
            // gridIndex: 0,
            type: 'value',
            axisLabel: {
                show: true,
                fontSize: 12,
                formatter: function (value) {
                    return value + '%';
                }
            },
            min: 'DataMin',
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
            lineStyle: {
                width: 1,
                shadowBlur: 2,
                shadowOffsetY: 1
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
            },
            lineStyle: {
                width: 1,
                shadowBlur: 2,
                shadowOffsetY: 1
            },

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
            },
            lineStyle: {
                width: 1,
                shadowBlur: 2,
                shadowOffsetY: 1

            },

        },
        {
            xAxisIndex: 0,
            yAxisIndex: 1,
            name: '2Y国债',
            type: 'line',
            smooth: false,
            data: [],
            lineStyle: {width: 1}
        },
        {
            xAxisIndex: 0,
            yAxisIndex: 1,
            name: '3Y国债',
            type: 'line',
            smooth: false,
            data: [],
            lineStyle: {width: 1}
        },
        {
            xAxisIndex: 0,
            yAxisIndex: 1,
            name: '5Y国债',
            type: 'line',
            smooth: false,
            data: [],
            lineStyle: {width: 1}
        },
        {
            xAxisIndex: 0,
            yAxisIndex: 1,
            name: 'IRS_5Y',
            type: 'line',
            smooth: false,
            data: [],
            lineStyle: {width: 1}

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



var gauge_option = {
    tooltip: {
        formatter: '{a} <br/>{b} : {c}%'
    },
    // toolbox: {
    //     feature: {
    //         restore: {},
    //         saveAsImage: {}
    //     }
    // },
    title:{text:'10Y国债收益率',
            left:'center'},
    series: [
        {
            name: '历史分位数',
            type: 'gauge',
            detail: {formatter: '{value}%'},
            data: [{value: 50, name: ''},]
        },

    ]
};
gauge_option_1=JSON.parse(JSON.stringify(gauge_option))

gauge_option_2=JSON.parse(JSON.stringify(gauge_option))
gauge_option_2.title.text='国债1*10'

gauge_option_3=JSON.parse(JSON.stringify(gauge_option))
gauge_option_3.title.text='国开-国债(10Y)'

gauge_option_4=JSON.parse(JSON.stringify(gauge_option))
gauge_option_4.title.text='国债-Repo(5Y)'



// gauges=document.getElementById('gauge').getElementsByClassName('gauge_fig')
var gauge_1=echarts.init(document.getElementById('gauge_1'))
gauge_1.setOption(gauge_option_1);
var gauge_2=echarts.init(document.getElementById('gauge_2'))
gauge_2.setOption(gauge_option_2);
var gauge_3=echarts.init(document.getElementById('gauge_3'))
gauge_3.setOption(gauge_option_3);
var gauge_4=echarts.init(document.getElementById('gauge_4'))
gauge_4.setOption(gauge_option_4);


var irs_hist = echarts.init(document.getElementById('irs_hist'));
irs_hist.setOption(irs_hist_option);


var box_fig = echarts.init(document.getElementById('box_fig'));
box_fig.setOption(irs_box_option);


var time_spread = echarts.init(document.getElementById('time_spread'));
time_spread.setOption(time_spread_option);

var type_spread = echarts.init(document.getElementById('type_spread'));
type_spread.setOption(type_spread_option);



calender_option = {
    title:{
        text:'涨跌日历图',
        left:'center'
    },
    tooltip: {
        formatter: function (params) {
            // console.log(params)
            return params.value[0]+
                '</br>收益率: '+params.value[1]+'%'+
                '</br>变化基点: '+params.value[2]+'bp'
        }
    },
    visualMap: {//视觉效果分类
        show: true,
        // min: -10,
        // max: 10,
        calculable: true,
        seriesIndex: [1,2] ,
        type: 'piecewise',
        splitNumber:7,
        pieces: [
            {min:5}, // 不指定 max，表示 max 为无限大（Infinity）。
            {min: 2, max: 5},
            {min: 0, max: 2},
            {value: 0, color: 'grey'}, // 表示 value 等于 123 的情况。
            {min: -2, max: 0},
            {min: -5, max: -2},
            {max: -5}     // 不指定 min，表示 min 为无限大（-Infinity）。
        ],
        orient: 'horizontal',
        left: 'center',
        bottom: 20,
        top:30,
        inRange: {
            color: ['#006edd','#EEEEEE', '#FF6347'],
            opacity: 0.7
        },
        controller: {
            inRange: {
                opacity: 0.5
            }
        }
    },
    calendar: [{
        left: 'center',
        top: 'middle',
        range: ['2020-07','2021-01-31'],
        width:'90%',
        // height: '70%',
        top:'20%',
        bottom:'20%',
        dayLabel: {
            nameMap: "cn"
        }
    }],

    series: [{
        type: 'scatter',
        coordinateSystem: 'calendar',
        symbolSize: 0,
        label: {
            show: true,
            formatter: function (params) {
                var d = echarts.number.parseDate(params.value[0]);
                basic_point=params.value[2]
                if (basic_point>0){
                return d.getDate()  +'\n+'+ basic_point ;}
                else
                return d.getDate()  +'\n'+basic_point ;
            },
            color: '#000'
        },
        data: []

    }, {
        // 用来显示底色
        name: '基点',
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: []
    }
    ]
};

var calender = echarts.init(document.getElementById('calender'));
calender.setOption(calender_option);
