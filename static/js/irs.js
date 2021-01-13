//期货的日内分钟数据

function plot_irs_hist_line(data) {
    irs_hist_option.xAxis[0].data = data['Time'];
    irs_hist_option.xAxis[1].data = data['Time'];

    irs_hist_option.series[3].data = data['国债:2Y'];
    irs_hist_option.series[4].data = data['国债:3Y'];
    irs_hist_option.series[5].data = data['国债:5Y'];
    irs_hist_option.series[6].data = data['FR007:5Y'];

    year_list = Array(2, 3, 5)
    for (i = 0; i < year_list.length; i++) {
        spread = []
        for (j = 0; j < data['Time'].length; j++) {
            spread.push((data['国债:' + year_list[i] + 'Y'][j] - data['FR007:5Y'][j]).toFixed(4))
        }
        irs_hist_option.series[i].data = spread
    }
    irs_hist.setOption(irs_hist_option);

}

//期货的日内分钟数据

function prepareBoxData(box_data) {
    let box_data_copy = JSON.parse(JSON.stringify(box_data))
    let box_return = Array()
    let data_len = box_data_copy[0].length
    for (i = 0; i < box_data_copy.length; i++) {
        let sorted_line = box_data_copy[i].sort()
        let min = sorted_line.sort()[0]
        let low = sorted_line.sort()[(data_len / 4).toFixed(0)]
        let mid = sorted_line.sort()[(data_len / 2).toFixed(0)]
        let high = sorted_line.sort()[(data_len / 4 * 3).toFixed(0)]
        let max = sorted_line.sort()[data_len - 1]
        box_return.push([min, low, mid, high, max])
    }
    return box_return
}

function plot_irs_box_line(data) {
    let opt = irs_box_option
    //箱型图
    let type_dict = {0: '国债', 1: '国开', 2: '口行'}

    let year_dict = {0: '1', 1: '2', 2: '3', 3: '5', 4: '7', 5: '10'}
    //债券种类
    for (let type = 0; type < Object.keys(type_dict).length; type++) {
        let box_data = Array()
        // 债券期限
        for (let year = 0; year < Object.keys(year_dict).length; year++) {
            let now_data = data[type_dict[type] + ':' + year_dict[year] + 'Y']
            box_data.push(now_data)
            //当前收益率
            let recent = now_data.slice(-1)[0]
            //当前分位数
            let quantile = (JSON.parse(JSON.stringify(now_data)).sort().indexOf(recent) / now_data.length * 100).toFixed(0) + '%'
            a = {
                'name': '当前分位数',
                'coord': [year, recent],
                'value': [quantile, recent.toFixed(4) + '%'].join('\n')
            }
            irs_box_option.series[type].markPoint.data.push(a)
        }
        //一次压入一种债的所有数据
        irs_box_option.series[type].data = prepareBoxData(box_data)
    }
    //TODO 还需要设置一个分位数值
    irs_box_option.title[0].subtext = data['Time'].slice(-1)[0].substring(0, 10)

    box_fig.setOption(irs_box_option);

}

function compute_spread(data1, data2) {
    let spread_list = Array()
    for (i = 0; i < data1.length; i++) {
        spread_list.push((data2[i] - data1[i]).toFixed(4))
    }
    return spread_list
}

function plot_time_spread(data) {
    //箱型图
    let type_dict = {0: '国债', 1: '国开'}
    let time_choice = [[1, 3], [3, 5], [3, 10], [1, 10]]
    // let year_dict={0:'1',1:'2',2:'3',3:'5',4:'7',5:'10'}
    //债券种类
    let x_label = 0
    let box_data = Array()
    let label_list = Array()
    for (let type = 0; type < Object.keys(type_dict).length; type++) {
        // 债券期限
        for (let time_twin = 0; time_twin < Object.keys(time_choice).length; time_twin++) {
            let now_data0 = data[type_dict[type] + ':' + time_choice[time_twin][0] + 'Y'] //收益率1
            let now_data1 = data[type_dict[type] + ':' + time_choice[time_twin][1] + 'Y'] //收益率2
            let spread = compute_spread(now_data0, now_data1)
            //当前分位数
            let recent = spread.slice(-1)[0]
            let quantile = (JSON.parse(JSON.stringify(spread)).sort().indexOf(recent) / spread.length * 100).toFixed(0) + '%'
            a = {
                'name': '当前分位数',
                'coord': [x_label, recent],
                'value': [quantile, (recent * 100).toFixed(0) + 'bp'].join('\n')
            }
            time_spread_option.series[0].markPoint.data.push(a)
            box_data.push(spread)
            label_list.push(type_dict[type] + time_choice[time_twin][0] + '*' + time_choice[time_twin][1])
            x_label += 1

        }
        //一次压入一种债的所有数据
    }
    time_spread_option.series[0].data = prepareBoxData(box_data)
    time_spread_option.xAxis.data = label_list
    time_spread_option.title[0].subtext = data['Time'].slice(-1)[0].substring(0, 10)

    time_spread.setOption(time_spread_option);

}

function plot_type_spread(data) {
    //箱型图
    // let type_dict={0:'国债',1:'国开'}
    // let time_choice=[[1,3],[3,5],[3,10],[1,10]]
    let year_dict = {0: '1', 1: '2', 2: '3', 3: '5', 4: '7', 5: '10'}
    //债券种类
    let x_label = 0
    let box_data = Array()
    let label_list = Array()
    for (let year = 0; year < Object.keys(year_dict).length; year++) {
        // 债券期限
        let now_data0 = data['国债:' + year_dict[year] + 'Y'] //收益率1
        let now_data1 = data['国开:' + year_dict[year] + 'Y'] //收益率2
        let spread = compute_spread(now_data0, now_data1)
        //当前分位数
        let recent = spread.slice(-1)[0]
        let quantile = (JSON.parse(JSON.stringify(spread)).sort().indexOf(recent) / spread.length * 100).toFixed(0) + '%'
        a = {
            'name': '当前分位数',
            'coord': [x_label, recent],
            'value': [quantile, (recent * 100).toFixed(0) + 'bp'].join('\n')
        }
        type_spread_option.series[0].markPoint.data.push(a)
        box_data.push(spread)
        label_list.push(year_dict[year] + 'Y')
        x_label += 1
        //一次压入一种债的所有数据
    }
    type_spread_option.series[0].data = prepareBoxData(box_data)
    type_spread_option.xAxis.data = label_list
    type_spread_option.title[0].subtext = data['Time'].slice(-1)[0].substring(0, 10)

    type_spread.setOption(type_spread_option);

}


function fetch_irs_data() {
    $.ajax({
        // type:'GET',
        url: "/irs_data",
        timeout: 10000,
        // contentType:'application/json',
        dataType: 'json',
        success: function (data) {
            plot_irs_hist_line(data) //历史数据
            plot_irs_box_line(data) // 收益率分位数
            plot_time_spread(data)//利差分位数
            plot_type_spread(data)
        },
        error: function () {
            console.log("失败了")
        }
    })
}

fetch_irs_data();


