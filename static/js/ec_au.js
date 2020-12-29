
// 指定图表的配置项和数据
var au_day_option = {
    title: {
        text: '日内价格',
        textStyle: {
            fontSize: 14,
        },
        left: 'left',
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
        data: ['黄金期货', '黄金现货'],
        left: 'right',
    },
    grid: {
        left: '10%',
        right: '6%',
        bottom: '10%',
        top: 50,
        containLabel: false
    },
    xAxis: [{
        type: 'category',
        data: []
    }],
    yAxis:[{
        type: 'value',
        min:'dataMin',
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
        name: '黄金期货',
        type: 'line',
        smooth: true,
        data: []
    }, {
        name: '黄金现货',
        type: 'line',
        smooth: true,
        data: []
    }]
};


// 指定图表的配置项和数据
var au_delta_option = {
    title: {
        text: '期现价差',
        textStyle: {
            fontSize: 14,
        },
        left: 'left',
    },
    tooltip: {
        show:true,
        trigger: 'axis',
        axisPointer: {
            type: 'line',
            lineStyle: {
            }
        }
    },
    legend: {
        data: ['价差'],
        left: 'right',
    },
    grid: {
        left: '10%',
        right: '6%',
        bottom: '10%',
        top: 50,
        containLabel: false
    },
    xAxis: [{
        type: 'category',
        data: []
    }],
    yAxis:[{
        type: 'value',
        min:'dataMin',
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
        name: '价差',
        type: 'line',
        smooth: true,
        data: []
    }]
};

// 指定图表的配置项和数据
var au_ytm_option = {
    title: {
        text: '收益率',
        textStyle: {
            fontSize: 14,
        },
        left: 'left',
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
    xAxis: [{
        type: 'category',
        data: []
    }],
    yAxis:[{
        type: 'value',
        min:'dataMin',
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
        data: []
    }]
};


// 指定图表的配置项和数据
var au_hist_option = {
    title: {
        text: '收益率',
        textStyle: {
            fontSize: 14,
        },
        left: 'left',
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
    xAxis: [{
        type: 'category',
        data: []
    }],
    yAxis:[{
        type: 'value',
        min:'dataMin',
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
        data: []
    }]
};


var au_day = echarts.init(document.getElementById('au_day'));
var au_delta = echarts.init(document.getElementById('au_delta'));
var au_ytm = echarts.init(document.getElementById('au_ytm'));
var au_hist = echarts.init(document.getElementById('au_hist'));


au_day.setOption(au_day_option);
au_delta.setOption(au_delta_option);
au_ytm.setOption(au_ytm_option);
au_hist.setOption(au_ytm_option);