
// 指定图表的配置项和数据
var zhongpiao_option = {
    title: {
        text: '中票',
        textStyle: {
            fontSize: 14,
        },
        left: 'left',
    },
    tooltip: {
        trigger: 'item',
        axisPointer: {
            type: 'cross',
            lineStyle: {
            }
        },
        formatter:''
        // formatter:'{@bond_name}<br/>期限:{c}<br/>收益率:{b}',
        // formatter: function (param) {
        //     return 'nihao'+param;
        // },
    },
    legend: {
        data: ['估值曲线(AAA)', '成交'],
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
        // data: [1,2,3]
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
            name: '成交',
            type: 'scatter',
            smooth: true,
            data: [3,3,3],
        },
        {
        name: '估值曲线(AAA)',
        type: 'line',
        smooth: true,
        data: [2,1,2]
    }]
};
// 指定图表的配置项和数据
var qiyezhai_option = JSON.parse(JSON.stringify(zhongpiao_option));
qiyezhai_option.title.text='企业债'

var zhongpiao = echarts.init(document.getElementById('zhongpiao'));
var qiyezhai = echarts.init(document.getElementById('qiyezhai'));


zhongpiao.setOption(zhongpiao_option);
qiyezhai.setOption(qiyezhai_option);
