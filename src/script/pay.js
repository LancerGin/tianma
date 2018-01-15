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

var Pay = new Vue({
    el: "#pay_container",
    data: {
        userID: null,     //用户ID
        appID:null,   //所属应用ID
        isVIP:false,   //判断用户是否是VIP！！
        orderID:parseInt(location.href.split("?")[1]),      //订单ID
        editionID:null,  //版本ID
        priceOfSetmeal:19999,     //解决方案总额
        serviceOfIntegrate:{checked:true,value:19999},   //集成服务价格
        serviceOfMaintain:{checked:true,value:19999},   //运维服务价格
        name:"",            //联系人姓名
        phone:"",           //联系人电话
        isCheck:true,      //未勾选“同意并接受服务条款”不能支付
        comfirmPay: false,     //展开支付界面
        orderNum:"",         //订单编号
        usebalance:{checked:true,value:0},   //账户余额
        usecredit:{checked:false,value:0},   //可用信用额度
        finishPay: false,     //展开支付结果
        whereToGo:"appOverview.html",   //支付成功后跳转去建立此订单的版本的设置页面
        result:  null             //支付成功为 0，失败为 -1
    },
    computed: {
        //计算订单总金额（未勾选服务时，就是基础套餐价格）
        priceOfOrder: function(){
            var price1 = this.priceOfSetmeal;
            var price2 = this.serviceOfIntegrate.checked?this.serviceOfIntegrate.value:0;
            var price3 = this.serviceOfMaintain.checked?this.serviceOfMaintain.value:0;
            return price1+price2+price3;
        },
        //可用于支付的总金额（勾选账户余额和信用额度后计算的总额度，可以只勾选其中一个）
        totalBalance: function(){
            var price1 = this.usebalance.checked?this.usebalance.value:0;
            var price2 = this.usecredit.checked?this.usecredit.value:0;
            return price1+price2;
        },
        //勾选的支付方式余额是否足够支付订单
        enoughToPay:function(){
            var enough = this.totalBalance > this.priceOfOrder;
            return enough;
        }
    },
    mounted: function () {
        //查询当前用户信息
        this.getUserInfo();
        //查询订单
        this.getOrder();
    },
    methods: {
        //查询当前用户信息
        getUserInfo: function () {
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
                    var balance = response.data.data.cash;
                    this.$set(this.usebalance,'value',balance);
                    var credit = response.data.data.quota;
                    this.$set(this.usecredit,'value',credit);
                    // 是不是VIP客户？
                    var vip = response.data.data.vip||0;
                    this.$set(this,'isVIP',(vip === 1));
                })
                .catch(function(response) {
                    console.log("查询当前用户信息-请求错误：",response)
                });
        },
        //账户余额不足时，默认给他把信用额度勾选上
        balanceNotEnough: function(){
            if(this.priceOfOrder>this.usebalance.value){
                this.$set(this.usecredit,"checked",true);
            }
        },
        //查询订单
        getOrder: function () {
            loadingStart();
            this.$http.post(HTTP.url+"order/searchById",{
                oId:this.orderID
            },{credentials: true})
                .then(function(response){
                    console.log("查询订单信息-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    var editionID = response.data.data.verid;
                    this.$set(this,'whereToGo',"appSetting.html?"+editionID+"#step=6");
                    this.$set(this,'editionID',editionID);
                    var appID = response.data.data.appid;
                    this.$set(this, "appID", appID);
                    var orderNum = response.data.data.onum;
                    this.$set(this,'orderNum',orderNum);
                })
                .catch(function(response) {
                    console.log("查询订单信息-请求错误：",response)
                });
        },
        //展开支付界面
        openComfirmPay:function(){
            var phone =this.phone;
            if(this.name===""){
                showMsg("请填写联系人姓名！");
                $("#name").focus();
            }else if(phone===""){
                showMsg("请填写联系人电话！");
                $("#phone").focus();
            }else if(!(/^1[34578]\d{9}$/.test(phone))){
                showMsg("电话号码格式不正确！");
                $("#phone").focus();
            }else{
                $("#card1").css({
                    display:'none'
                });
                $("#card2").css({
                    display:'block',
                    animation:'open 1s forwards'
                });
                this.$set(this,"comfirmPay",true);
                this.balanceNotEnough(); //最终展开支付面板的时候判断是否需要勾选信用额度
            }

        },
        //去充值
        torecharge:function(){
            window.location.href = "balance.html";
        },
        //确认支付
        pay:function(){
            //暂时默认只有一种方式。。。
            if(this.usebalance===0&&this.usecredit!==0){
                var payType = 0;  //使用信用额度支付
            }else if(this.usecredit===0&&this.usebalance!==0){
                var payType = 0;  //使用账户余额支付
            }else if(this.usecredit!==0&&this.usebalance!==0){
                var payType = 0;  //使用两种方式一起支付
            }
            loadingStart();
            this.$http.post(HTTP.url+"order/pay",{
                uId:this.userID,
                appId:this.appID,
                payType:payType,
                payName:this.name,
                contactNo:this.phone,
                serviceIdList:[5,6], //那两个服务，默认都要购买，暂时直接写死。。以后再改成勾选哪些就把哪些服务的ID弄到这个数组里面
                orderList:[this.orderID]
            },{credentials: true})
                .then(function(response){
                    console.log("确认支付-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    loadingEnd();
                    if(response.data.code==="00"){
                        this.$set(this,"result",0);
                        //支付完成后给他打包打起
                        this.$http.post(HTTP.url+"trail/add",{
                            vId:this.editionID,
                            status: 1, //表示用户提交打包申请
                            description:"www.mangrove.com",
                            pkg:{
                                androidPkg:"www.mangrove.com",
                                bgPkg:"www.mangrove.com",
                                iosPkg:"www.mangrove.com"
                            }
                        },{credentials: true})
                            .then(function(response){
                                console.log("申请打包-请求成功：",response.data);
                            })
                            .catch(function(response) {
                                console.log("申请打包-请求错误：",response)
                            });
                    }else{
                        this.$set(this,"result",-1);
                    }
                    this.openPayResult();
                })
                .catch(function(response) {
                    console.log("确认支付-请求错误：",response)
                });
        },
        //展开支付结果
        openPayResult:function(){
            $("#card2").css({
                display:'none'
            });
            $("#card3").css({
                display:'block',
                animation:'open 1s forwards'
            });
            this.$set(this,"finishPay",true);
        }
    }
});
