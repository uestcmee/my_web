var ec_lookback = echarts.init(document.getElementById('lookback'), 'dark');

// 指定图表的配置项和数据
var ec_lookback_option = {
    title: {
        text: '收益率对比图',
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
                color: '#7171C6'
            }
        }
    },
    legend: {
        data: ['策略收益率', '指数收益率'],
        left: 'right',
    },
    grid: {
        left: '4%',
        right: '6%',
        bottom: '4%',
        top: 50,
        containLabel: true
    },
    xAxis: [{
        type: 'category',
        data: []
    }],
    yAxis: [{
        type: 'value',
        axisLabel: {
            show: true,
            color: 'white',
            fontSize: 12,
            formatter: function (value) {
                if (value >= 1000) {
                    value = value / 1000 + 'k';
                }
                return value;
            }
        },
        axisLine: {
            show: true
        },
        splitLine: {
            show: true,
            lineStyle: {
                color: '#17273B',
                width: 1,
                type: 'solid'
            }
        }
    }],
    series: [{
        name: '策略收益率',
        type: 'line',
        smooth: true,
        data: []
    }, {
        name: '指数收益率',
        type: 'line',
        smooth: true,
        data: []
    }]
};
ec_lookback.setOption(ec_lookback_option);