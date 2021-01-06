function getTdValue(bond_type)
{
    var id_list={
        'zhongpiao':'zp_data',
        'qiyezhai':'qyz_data'
    } ;
    tableId=document.getElementById(id_list[bond_type])
    var year =  Array();
    var ytm =  Array();
    var pred =  Array();
    var bond_name = Array();
    var spread = Array();

    for(var i=1; i < tableId.rows.length;i++)
    {
        year.push(tableId.rows[i].cells[4].innerHTML)
        ytm.push(tableId.rows[i].cells[5].innerHTML)
        pred.push(tableId.rows[i].cells[6].innerHTML)
        spread.push(tableId.rows[i].cells[7].innerHTML)
        bond_name.push(tableId.rows[i].cells[1].innerHTML)

    }
    var real_data=[year,ytm,bond_name,spread];
    var pred_data=[year,pred,bond_name,spread];
    //定义一个新的数组
    function array_t(arr){
        var arr2=[];
        for(var i=0;i<arr[0].length;i++){
            arr2[i]=[];
        }
        for(var i=0;i<arr.length;i++){
            for(var j=0;j<arr[i].length;j++){
                arr2[j][i]=arr[i][j];
            }
        }
        return arr2
    }
    var real_data2=array_t(real_data)
    var pred_data2=array_t(pred_data)

    //成功！遍历arr2就是一个成功的数组
    var option_list={
        'zhongpiao':zhongpiao_option,
        'qiyezhai':qiyezhai_option
    }
    // zhongpiao_option.xAxis[0].data = arr2[0];
    option_list[bond_type].series[1].data = pred_data2;
    option_list[bond_type].series[0].data = real_data2;

    option_list[bond_type].tooltip.formatter = function (param){

        return param.data[2]+'<br/>'+param.data[0]+'年：'+param.data[1];};
    eval(bond_type).setOption(option_list[bond_type]);
}


getTdValue('zhongpiao');
getTdValue('qiyezhai');




