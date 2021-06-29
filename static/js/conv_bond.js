var app = new Vue({
        el: '#app',
        data: {
            // data() {
            //     return {
            hist_fig_option: {
                title: {
                    text: '各转股价值对应累计收益率 ',
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
                legend: {
                    show: true,
                },
                // grid:  {width: '75%', height: '75%'},//利差
                tooltip: {
                    trigger: 'axis',
                },
                xAxis: {
                    show: true,
                    type: 'category',
                    data: []
                },
                yAxis: {
                    name: '累计收益率(%)',
                    type: 'value',
                    axisLabel: {
                        show: true,
                        fontSize: 12,

                    }
                },
                series: []
            },
            priceData: {},
            table_data: [
                {
                    '转债名称': '健帆转债',
                    '转债涨跌幅': '-',
                    '正股涨跌幅': -1.29,
                    '转股价值': 97.1965,
                    '转股溢价率': 2.88
                }], //表格中的值
            date_list: [], //所有日期
            choose_day: '2020-06-29', //选择的日期
        },
        methods: {
            update_fig() {
                date_list = Object.keys(this.priceData["<70"]) //获取日期列表

                this.hist_fig_option.xAxis.data = date_list
                this.date_list = date_list //更新日期列表
                this.choose_day = date_list[date_list.length - 1] //选择的日期
                this.get_table()

                for (var one in Object.keys(this.priceData)) {
                    let label = Object.keys(this.priceData)[one]
                    this.hist_fig_option.series.push({
                            name: label,
                            type: 'line',
                            smooth: false,
                            data: Object.values(this.priceData[label])
                        },
                    );
                }
                var hist_fig = echarts.init(document.getElementById('hist_fig'));
                hist_fig.setOption(this.hist_fig_option);
                $(window).resize(function () {
                    hist_fig.resize()
                })
            },
            get_data() {
                that = this
                axios.get('/conv_bond/rr').then(
                    function (response) {
                        that.priceData = JSON.parse(response['data'])
                        console.log(that.priceData)
                        that.update_fig()

                    },
                    function (err) {
                        err
                    })
            },
            get_table(date = this.date_list[-1]) {
                that = this
                axios.get('/conv_bond/table?date=' + date).then(
                    function (response) {
                        that.table_data = (response['data'])
                    },
                    function (err) {
                        err
                    })
            }
        },
        watch: {
            choose_day(new_choose_day, old_choose_day) { //更改日期时切换表格内容
                console.log(new_choose_day)
                this.get_table(new_choose_day)//获取数据后自动更新table_data
                // this.file_name = new_choose_day
                // this.update_table_data();
            }
        },
        mounted() {
            this.get_data() // 获取累计收益率数据

        }
    })
;
