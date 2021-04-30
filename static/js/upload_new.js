function revert(table_data) {
    var table_len = table_data['year'].length
    var new_table = Array(table_len)//.fill(cols)
    for (var i = 0; i < table_len; i++) { //length of the table
        let cols = {
            'real_ytm': '',
            'spread': '',
            'year': '',
            '剩余期限': '',
            '收益率': '',
            '简称': '',
            '评级': ''
        }
        for (var name in table_data) {
            cols[name] = table_data[name][i]
        }
        new_table[i] = cols
    }
    return new_table
}

// var all_data
var url = '/upload/data'
// var zhongpiao_pic
// var qiyezhai_pic
// var zhongpiao_option
// var qiyezhai_option
// var fig = echarts.init(document.getElementById('fig'))

const cityOptions = ['短融', '中票', '企业债', '其他'];
var app = new Vue({
        el: '#app',
        data: {
            table_data: [],
            fig_data_real: [],
            fig_data_pred: [],
            all_data: {},//所有数据的dict
            days: [],//目前有的日期
            file_value: '',
            file_name: '2020年06月24日周三.txt',
            fileList: [],
            //复选框
            checkAll: false,
            checkedCities: ['中票'],
            cities: cityOptions,
            isIndeterminate: true,
        },
        methods: {
            update_fig() {
                init_option.series[1].data = this.fig_data_pred;
                init_option.series[0].data = this.fig_data_real;
                init_option.tooltip.formatter = function (param) {
                    return param.data[2] + '<br/>' + param.data[0] + '年：' + param.data[1];
                };
                fig.setOption(init_option);
            },
            //复选框用
            update_table_data() {
                this.table_data = []
                for (var i in this.checkedCities) {
                    bond = this.checkedCities[i]
                    console.log()
                    this.table_data = this.table_data.concat(this.all_data[bond])
                }
                //更新图片数据
                this.fig_data_real = []//重置图片所用数据
                this.fig_data_pred = []
                for (let one in this.table_data) {

                    year = this.table_data[one]['year']
                    pred = this.table_data[one]['pred']
                    real = this.table_data[one]['real_ytm']
                    bond_name = this.table_data[one]['简称']
                    spread = this.table_data[one]['spread']
                    if (parseFloat(real) < 10) {//收益率过高可能是用净价结算的，不考虑
                        this.fig_data_real.push([year, real, bond_name, spread]);
                        this.fig_data_pred.push([year, pred, bond_name, spread]);
                    }

                }
                this.update_fig()

            },
            handleCheckAllChange(val) { //处理全选
                this.checkedCities = val ? cityOptions : [];
                this.isIndeterminate = false;
                this.update_table_data();
            },
            handleCheckedCitiesChange(value) {
                let checkedCount = value.length;
                this.checkAll = checkedCount === this.cities.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < this.cities.length;
                this.update_table_data();
            }
            ,
            //表格过滤器用
            resetDateFilter() {
                this.$refs.filterTable.clearFilter('date');
            },
            clearFilter() {
                this.$refs.filterTable.clearFilter();
            },
            formatter(row, column) {
                return row.address;
            },
            filterTag(value, row) {
                return row.tag === value;
            },
            filterHandler(value, row, column) {
                const property = column['property'];
                return row[property] === value;
            },
            //上传文件用
            handleRemove(file, fileList) {
                console.log(file, fileList);
            },
            handlePreview(file) {
                console.log(file);
            },
            handleExceed(files, fileList) {
                this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
            },
            beforeRemove(file, fileList) {
                return this.$confirm(`确定移除 ${file.name}？`);
            },
            get_file() {
                var that = this

                axios.get('/upload/files').then(
                    function (response) {
                        // console.log(response)
                        all_file = response['data']['files']
                        console.log(all_file)
                        for (var i in all_file) {
                            key = Object.keys(all_file[i])[0] //数据键值
                            val = all_file[i][key] //数据值
                            console.log(i, key, val)
                            that.days.push({value: val, label: val}) //都只使用了数据值
                        }
                    },
                    function (err) {
                        err
                    }
                )
            },
            get_data(file_name_here) {
                var that = this
                axios.get(url + '?txt_name=' + file_name_here).then(
                    function (response) {
                        console.log('获取数据成功')
                        all_data = response['data']
                        that.all_data = all_data
                        that.update_table_data()
                    },
                    function (err) {
                        err
                        console.log('获取数据失败')

                    }
                )
            },
            // update_fig(bond_type) {
            //     var pred = [];
            //     var real = [];
            //     for (row in eval(bond_type)) {
            //         pred.push(row['pred'])
            //         real.push(row['real_ytm'])
            //     }
            //     console.log(pred)
            //     console.log('hello')
            //     console.log(real)
            //     //成功！遍历arr2就是一个成功的数组
            //     var option_list = {
            //         'zhongpiao': zhongpiao_option,
            //         'qiyezhai': qiyezhai_option
            //     }
            //     // zhongpiao_option.xAxis[0].data = arr2[0];
            //     option_list[bond_type].series[1].data = pred;
            //     option_list[bond_type].series[0].data = real;
            //     option_list[bond_type].tooltip.formatter = function (param) {
            //
            //         return param.data[2] + '<br/>' + param.data[0] + '年：' + param.data[1];
            //     };
            //     eval(bond_type).setOption(option_list[bond_type]);
            // }
            // 指定图表的配置项和数据
            init_pic() {
                zhongpiao_option = {
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
                qiyezhai_option = JSON.parse(JSON.stringify(zhongpiao_option));
                qiyezhai_option.title.text = '企业债'

                zhongpiao_pic = echarts.init(document.getElementById('zhongpiao'));
                qiyezhai_pic = echarts.init(document.getElementById('qiyezhai'));

                //
                zhongpiao_pic.setOption(zhongpiao_option);
                qiyezhai_pic.setOption(qiyezhai_option);

                //
                $(window).resize(function () {
                    zhongpiao_pic.resize()
                    qiyezhai_pic.resize()
                })
            }
        },
        watch: {
            file_value(new_file_name, old_file_name) {
                console.log(new_file_name)
                this.get_data(new_file_name)//获取数据后自动更新table_data
                this.file_name = new_file_name
                // this.update_table_data();
            }
        }
        ,
        mounted() {
            this.get_file()
            this.get_data(this.file_name)
            // this.update_table_data();

        }

    })
;