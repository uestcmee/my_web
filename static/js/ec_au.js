
// 指定图表的配置项和数据
var au_day_option = {
    title: {
        text: '日内数据',
        textStyle: {
            fontSize: 14,
        },
        left: 'center',
    },
    dataZoom: [
        {
            show: true,
            realtime: true,
            // start: 30,
            // end: 70,
            xAxisIndex: [0, 1, 2]
        },
        // {
        //     type: 'inside',
        //     realtime: true,
        //     start: 30,
        //     end: 70,
        //     xAxisIndex: [0, 1,2]
        // }
    ],
    grid: [
        {width: '80%', height: '38%',},
        {width: '80%', height: '14%', top: '60%'},
        {width: '80%', height: '14%', top: '75%'},
    ],
    tooltip: {
        trigger: 'axis',
        // formatter: '{a}: ({c})'

    },
    xAxis: [
        {gridIndex: 0, show: false, type: 'category',},
        {gridIndex: 1, show: false, type: 'category',},
        {gridIndex: 2, type: 'category',},
    ],
    yAxis: [
        {gridIndex: 0, name: '期货价格', nameLocation: 'middle', nameRotate: 90, min: 'dataMin', nameGap: 45},
        {gridIndex: 0, name: '现货价格', nameLocation: 'middle', nameRotate: 90, min: 'dataMin', nameGap: 45},
        {gridIndex: 1, name: '价差', nameLocation: 'middle', nameRotate: 90, min: 'dataMin', nameGap: 45},
        {gridIndex: 2, name: '收益率', nameLocation: 'middle', nameRotate: 90, min: 'dataMin', nameGap: 45},
    ],
    series: [{
        xAxisIndex: 0,
        yAxisIndex: 0,
        name: '期货价格',
        type: 'line',
        smooth: true,
        data: [1, 100, 3]
    }, {
        xAxisIndex: 0,
        yAxisIndex: 1,
        name: '现货价格',
        type: 'line',
        smooth: true,
        data: [3, 2, 1]
    },
        {
            xAxisIndex: 1,
            yAxisIndex: 2,
            name: '价差',
            type: 'line',
            smooth: true,
            data: [1, 2, 1]
        },
        {
            xAxisIndex: 2,
            yAxisIndex: 3,
            name: '收益率',
            type: 'line',
            smooth: true,
            data: [20, 1, 2],
            markPoint: {
                data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                ]
            },
        }]
};


// 指定图表的配置项和数据
var au_hist_option = {
    title: {
        text: '历史收益率',
        textStyle: {
            fontSize: 14,
        },
        left: 'center',
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'line',
            lineStyle: {
            }
        }
    },
    legend: {
        data: ['收益率'],
        left: 'right',
    },
    grid: {
        left: '10%',
        right: '6%',
        bottom: '10%',
        top: 50,
        containLabel: false
    },
    dataZoom: [
        {
            show: true,
            realtime: true,
            // start: 30,
            // end: 70,
            xAxisIndex: [0, 1, 2]
        }],
    xAxis: [{
        type: 'category',
        data: []
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
    series: [{
        name: '收益率',
        type: 'line',
        smooth: true,
        data: [],
        markPoint: {
            data: [
                {type: 'max', name: '最大值'},
                {type: 'min', name: '最小值'}
            ]
        },
    }]
};


// 指定图表的配置项和数据
var high_freq_pic_option = {
    title: {
        text: '高频收益率',
        textStyle: {
            fontSize: 14,
        },
        left: 'center',
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'line',
            lineStyle: {}
        }
    },
    legend: {
        data: ['收益率', '正套', '反套'],
        left: 'right',
    },
    grid: {
        left: '10%',
        right: '6%',
        bottom: '10%',
        top: 50,
        containLabel: false
    },
    dataZoom: [
        {
            show: true,
            realtime: true,
            // start: 30,
            // end: 70,
            xAxisIndex: [0, 1, 2]
        }],
    xAxis: [{
        type: 'category',
        data: []
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
    series: [{
        name: '收益率',
        type: 'line',
        smooth: true,
        data: [],
    },
        {
            name: '正套',
            type: 'line',
            smooth: true,
            data: [],
        },
        {
            name: '反套',
            type: 'line',
            smooth: true,
            data: [],
        }]
};

var au_day = echarts.init(document.getElementById('au_day'));
var au_hist = echarts.init(document.getElementById('au_hist'));
var high_freq_pic = echarts.init(document.getElementById('high_freq_pic'));


au_day.setOption(au_day_option);
au_hist.setOption(au_hist_option);
high_freq_pic.setOption(high_freq_pic_option)
