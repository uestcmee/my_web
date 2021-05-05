var url = '/upload/data'
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
            alter_infos: [{type: 'info', text: '可以点击下面按钮选择债券种类，表格中点击剩余期限可筛选是否为永续债'}]
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
            filterHandler_N(value, row, column) {
                const property = column['property'];
                if (value === 'N') {//如果选择永续债
                    return row[property].search('N') !== -1;
                } else {
                    return row[property].search('N') === -1
                }
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
            handleSuccess(file) {
                console.log(file);
                this.alter_infos.push({type: 'success', text: '文件上传成功'})
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
                        // console.log(all_file)
                        for (var i in all_file) {
                            key = Object.keys(all_file[i])[0] //数据键值
                            val = all_file[i][key] //数据值
                            // console.log(i, key, val)
                            that.days.push({value: val, label: val}) //都只使用了数据值
                        }
                        console.log('获取文件列表成功')
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
        }
    })
;