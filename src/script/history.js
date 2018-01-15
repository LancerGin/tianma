
var layer = layui.layer;
var LOADING;
//开启layer的加载提示
function loadingStart(){
    LOADING = layer.load(2, {
        time: 5*1000,            //设定最长等待5秒
        shade: [0.2,'#fff'] //0.1透明度的白色背景
    });
}
//关闭layer的加载提示
function loadingEnd(){
    layer.close(LOADING);
}
//显示提示信息
function showMsg(info){
    layer.msg(info);
}

var History = new Vue({
    el: "#history_container",
    data: {
        userID: null,     //用户ID
        chargeList:[],      //充值记录
        orderList:[]       //订单记录
    },
    mounted: function () {
        this.getUserInfo();
    },
    methods: {
        //查询当前用户信息
        getUserInfo: function () {
            loadingStart();
            this.$http.get(HTTP.url+"u/getUser",{credentials: true})
                .then(function(response){
                    console.log("查询当前用户信息-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    var userID = response.data.data.id;
                    this.$set(this,'userID',userID);
                    //查询充值记录
                    this.getChargeList();
                    //查询订单记录
                    this.getOrderList();
                })
                .catch(function(response) {
                    console.log("查询当前用户信息-请求错误：",response)
                });
        },
        //查询充值记录
        getChargeList: function () {
            this.$http.post(HTTP.url+"charge/searchByCndts",{
                "uId":this.userID      //用户id
            },{credentials: true})
                .then(function(response){
                    loadingEnd();
                    console.log("查询充值记录-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    var result = response.data.data;
                    var chargeList = [];
                    for(let i=0;i<result.length;i++){
                        chargeList.push({
                            time:result[i].payTime,
                            money:result[i].value,
                            status:result[i].payStatus,
                            num:result[i].transactionCode||"无"
                        });
                    }
                    this.$set(this,'chargeList',chargeList);
                    //初始化充值记录表格
                    var _this = this;
                    setTimeout(function(){
                        _this.initTable('#chargeTable');
                    },10);
                })
                .catch(function(response) {
                    console.log("查询充值记录-请求错误：",response)
                });
        },
        //查询订单记录
        getOrderList: function () {
            this.$http.post(HTTP.url+"order/searchByUId",{
                "uId":this.userID      //用户id
            },{credentials: true})
                .then(function(response){
                    console.log("查询订单记录-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    var result = response.data.data;
                    var orderList = [];
                    for(let i=0;i<result.length;i++){
                        orderList.push({
                            id:result[i].id,
                            time:result[i].payTime||result[i].createTime,
                            money:result[i].totalValue,
                            status:result[i].status,
                            num:result[i].onum||"无"
                        });
                    }
                    this.$set(this,'orderList',orderList);
                    //初始化订单记录表格
                    var _this = this;
                    setTimeout(function(){
                        _this.initTable('#orderTable');
                    },10);
                })
                .catch(function(response) {
                    console.log("查询订单记录-请求错误：",response)
                });
        },
        //对未付款的订单进行付款
        toPay: function(orderID){
            window.open("pay.html?"+orderID);
        },
        //表格初始化
        initTable: function(DOMid){
            $(DOMid).DataTable({
                "info": false,  //左下角信息
                "paging": true,   //开启分页
                "ordering": true,   //开启排序
                // "columnDefs": [
                //     { "orderable": false, "targets": 4 }
                // ],
                "lengthChange": false,   //每页显示多少条
                "pageLength": 20,
                "lengthMenu": [ 5, 10, 20, 50],
                "searching": false,    //本地搜索
                "language":{
                    "emptyTable":     "暂无数据",
                    "info":           "Showing _START_ to _END_ of _TOTAL_ entries",
                    "infoEmpty":      "Showing 0 to 0 of 0 entries",
                    "infoFiltered":   "(filtered from _MAX_ total entries)",
                    "infoPostFix":    "",
                    "thousands":      ",",
                    "lengthMenu":     "每页显示 _MENU_ 条",
                    "loadingRecords": "Loading...",
                    "processing":     "Processing...",
                    "search":         "搜索:",
                    "zeroRecords":    "无符合搜索条件的数据",
                    "paginate": {
                        "first":      "首页",
                        "last":       "末页",
                        "next":       "下一页",
                        "previous":   "上一页"
                    },
                    "aria": {
                        "sortAscending":  ": activate to sort column ascending",
                        "sortDescending": ": activate to sort column descending"
                    }
                }
            });
        }
    }
});

$().ready(function() {

});