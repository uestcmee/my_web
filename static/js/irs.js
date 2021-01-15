//期货的日内分钟数据

// function plot_irs_hist_line(data) {
//     irs_hist_option.xAxis[0].data = data['Time'];
//     // irs_hist_option.xAxis[1].data = data['Time'];
//
//     irs_hist_option.series[3].data = data['国债:2Y'];
//     irs_hist_option.series[4].data = data['国债:3Y'];
//     irs_hist_option.series[5].data = data['国债:5Y'];
//     irs_hist_option.series[6].data = data['FR007:5Y'];
//
//     let year_list = Array(2, 3, 5)//2年、3年、5年的国债收益率
//     for (i = 0; i < year_list.length; i++) {
//         let spread = []
//         //计算利差
//         for (j = 0; j < data['Time'].length; j++) {
//             spread.push((data['国债:' + year_list[i] + 'Y'][j] - data['FR007:5Y'][j]).toFixed(4))
//         }
//         irs_hist_option.series[i].data = spread
//         let recent=spread.slice(-1)[0]
//         let quantile =(JSON.parse(JSON.stringify(spread)).sort().indexOf(recent) / spread.length * 100).toFixed(0)
//         if (i==2){
//             gauge_option_4.series[0].data[0].value=parseFloat(quantile)
//             gauge_4.setOption(gauge_option_4);
//         }
//     }
//     irs_hist.setOption(irs_hist_option);
// }

//期货的日内分钟数据
function prepareBoxData(box_data) {
    function compare(num1, num2) {
        var temp1 = parseFloat(num1);
        var temp2 = parseFloat(num2);
        if (temp1 < temp2) {
            return -1;
        } else if (temp1 == temp2) {
            return 0;
        } else {
            return 1;
        }
    }
    let box_data_copy = JSON.parse(JSON.stringify(box_data))
    let box_return = Array()
    let data_len = box_data_copy[0].length

    for (i = 0; i < box_data_copy.length; i++) {
        let sorted_line = box_data_copy[i].sort(compare)//直接使用sort会按照字符串排序
        let min = sorted_line[0]
        let low = sorted_line[(data_len / 4).toFixed(0)]
        let mid = sorted_line[(data_len / 2).toFixed(0)]
        let high = sorted_line[(data_len / 4 * 3).toFixed(0)]
        let max = sorted_line[data_len - 1]
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
    //重置一次标记点
    for (let type = 0; type < Object.keys(type_dict).length; type++) {
        irs_box_option.series[type].markPoint.data=[]
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
            if (year===5 && type===0){
                gauge_option_1.series[0].data[0].value=parseFloat(quantile)
                gauge_1.setOption(gauge_option_1);
            }
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
    //重置标记点
    time_spread_option.series[0].markPoint.data=[]

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
            if (time_twin===3 && type===0){
                gauge_option_2.series[0].data[0].value=parseFloat(quantile)
                gauge_2.setOption(gauge_option_2);
            }
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
    type_spread_option.series[0].markPoint.data=[]
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
        if (year==5){
            gauge_option_3.series[0].data[0].value=parseFloat(quantile)
            gauge_3.setOption(gauge_option_3);
        }
    }
    type_spread_option.series[0].data = prepareBoxData(box_data)
    type_spread_option.xAxis.data = label_list
    type_spread_option.title[0].subtext = data['Time'].slice(-1)[0].substring(0, 10)

    type_spread.setOption(type_spread_option);

}



function plot_calender(data,type='国债'){
    let calenderData_all =[];
    let name_str=type+':'
    if (type=='FR007'){
        name_str+='5Y'
    }else name_str+='10Y'

    for (var i = 1; i < data['Time'].length; i++) {

        calenderData_all.push([
            data['Time'][i],//需要把需要heatmap的放在最后一项
            parseFloat((data[name_str][i]).toFixed(4)),//国债收益率
            parseFloat(((data[name_str][i]-data[name_str][i-1])*100).toFixed(0)),//涨跌bp
        ]);
    }

    calender_option.series[0].data=calenderData_all
    calender_option.series[1].data=calenderData_all
    calender_option.title.text=name_str+' 涨跌日历图'
    calender.setOption(calender_option)
}

var data_raw
var data_now
function fetch_irs_data() {
    $.ajax({
        // type:'GET',
        url: "/irs_data",
        timeout: 30000,
        // contentType:'application/json',
        dataType: 'json',
        success: function (data) {

            // plot_irs_hist_line(data) //历史数据
            // calc_spread(data)
            // plot_irs_box_line(data) // 收益率分位数
            // plot_time_spread(data)//利差分位数
            // plot_type_spread(data)//品种利差
            // plot_calender(data)
            data_raw=data
            change_date(start=0)
        },
        error: function () {
            console.log("数据获取失败")
        }
    })

}

fetch_irs_data();


function change_date(start=0){
    let start_date= new Date()
    if (start===0){//所有数据
        start_date=new Date(2010,0,1)
    }
    else if (start===1 || start===2 || start===3 ){
        start_date=new Date().setFullYear((new Date().getFullYear()-start))
    }
    else if (start===4){
        start_date=new Date(2021,0,1)
    }
    else{
        //月份需要从0开始
        start_date=new Date(start.substring(0,4),parseFloat(start.substring(5,7))-1,start.substring(8,10))

        console.log(start)

    }
    start_date = new Date(start_date).format("yyyy-MM-dd");
    let small_dict={}
    for (var i = 1; i < data_raw['Time'].length; i++) {

        if (data_raw['Time'][i]>start_date){
            small_dict=JSON.parse(JSON.stringify(data_raw))
            for ( key in data_raw ){
                small_dict[key]=small_dict[key].slice(i,)
            }
            break
        }//需要把需要heatmap的放在最后一项
    }
    // plot_irs_hist_line(small_dict) //历史数据
    calc_spread(small_dict)
    plot_irs_box_line(small_dict) // 收益率分位数
    plot_time_spread(small_dict)//利差分位数
    plot_type_spread(small_dict)//品种利差
    plot_calender(small_dict)
    calc_repo_spread(small_dict)
    data_now=small_dict
}



Date.prototype.format = function(fmt) {
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}

function update_calendar(start=0){
    let type_dict = {0: '国债', 1: '国开', 2: '口行','3':'FR007'}
    plot_calender(data_raw,type=type_dict[start])
}

//单独计算一下 国债-repo 的利差
function calc_repo_spread(data){
    let data_str_1='国债:5Y'
    let data_str_2='FR007:5Y'
    let spread = []
    //计算利差
    for (j = 0; j < data['Time'].length; j++) {
        spread.push((data[data_str_1][j] - data[data_str_2][j]).toFixed(4))
    }
    let recent=spread.slice(-1)[0]
    let quantile =(JSON.parse(JSON.stringify(spread)).sort().indexOf(recent) / spread.length * 100).toFixed(0)
    gauge_option_4.series[0].data[0].value=parseFloat(quantile)
    gauge_4.setOption(gauge_option_4);//更新分位数图
}

function calc_spread(data){
    let data_str_1=$("#type1").val()+':'+$("#year1").val()
    let data_str_2=$("#type2").val()+':'+$("#year2").val()
    irs_hist_option.xAxis[0].data = data['Time'];
    irs_hist_option.series[1].data = data[data_str_1];
    irs_hist_option.series[2].data = data[data_str_2];

    irs_hist_option.series[1].name = data_str_1;
    irs_hist_option.series[2].name = data_str_2;
    irs_hist_option.series[0].name = data_str_1+'-'+data_str_2;
    irs_hist_option.legend.data = [data_str_1,data_str_2,data_str_1+'-'+data_str_2];

    let spread = []
    //计算利差
    for (j = 0; j < data['Time'].length; j++) {
        spread.push((data[data_str_1][j] - data[data_str_2][j]).toFixed(4))
    }
    irs_hist_option.series[0].data = spread

    let recent=spread.slice(-1)[0]
    let quantile =(JSON.parse(JSON.stringify(spread)).sort().indexOf(recent) / spread.length * 100).toFixed(0)

    //重置标记点
    irs_hist_option.series[3].markPoint.data=[]
    let a = {
        'name': '当前分位数',
        'coord': [0, recent],
        'value': [quantile+'%', (recent * 100).toFixed(0) + 'bp'].join('\n')
    }
    irs_hist_option .series[3].markPoint.data.push(a)
    irs_hist_option.series[3].data = prepareBoxData([spread])
    // console.log(prepareBoxData([spread]))
    irs_hist.setOption(irs_hist_option);

}