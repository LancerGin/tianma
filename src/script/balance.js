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
//充值中的提示
var charging;
function chargingStart(){
    charging = layer.open({
        type: 1,
        closeBtn: 0, //不显示关闭按钮
        anim: 4,
        btnAlign: 'c',
        shadeClose: false, //不开启遮罩关闭
        area:'480px',
        title :false,
        content: '<span class="glyphicon glyphicon-exclamation-sign"></span><h2>消息</h2><p>请在弹出页面中完成充值</p>',
        btn: ['充值完成', '遇到问题'],
        yes: function(index, layero){
            Balance.getUserInfo();
            Balance.back();
            layer.close(index);
        },
        btn2: function(index, layero){
            //遇到问题？怎么办？

            layer.close(index);
        }
    });
}
function chargingEnd(){
    layer.close(charging);
}

var Balance = new Vue({
    el:"#balance_container",
    data:{
        userID:null,     //用户ID
        isVIP:false,      //是不是 VIP客户
        toRecharge:false,     //进入充值面板判断条件
        accountBalance:0,    //当前余额
        availableCredit:0,  //可用额度
        totalCredit:0,    //总额度
        money:"",   //用户输入的金额
        info:"",    //提示信息
        couldRecharge:false   //是否输入正确格式的金额，控制提交按钮
    },
    mounted:function(){
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
                    loadingEnd();
                    //用户ID
                    var userID = response.data.data.id;
                    this.$set(this,'userID',userID);
                    //账户余额
                    var accountBalance = response.data.data.cash||0;
                    this.$set(this,'accountBalance',accountBalance);
                    //总额度
                    var totalCredit = response.data.data.credit||0;
                    this.$set(this,'totalCredit',totalCredit);
                    //可用信用额度
                    var availableCredit = response.data.data.quota||0;
                    this.$set(this,'availableCredit',availableCredit);
                    // 是不是VIP客户？
                    var vip = response.data.data.vip||0;
                    this.$set(this,'isVIP',(vip === 1));
                })
                .catch(function(response) {
                    console.log("查询当前用户信息-请求错误：",response)
                });
        },
        //充血
        recharge: function () {
            $(".card1").css({
                display:'none'
            });
            $(".card2").css({
                display:'block',
                animation:'open 1s forwards'
            });
        },
        back: function () {
            $(".card2").css({
                display:'none'
            });
            $(".card1").css({
                display:'block',
                animation:'open 1s forwards'
            });
        },
        //检查输入的数字是否符合要求
        checkNum:function(){
            var money = this.money;
            if (money === "") {
                this.$set(this,'couldRecharge',false);
                this.$set(this,'info','请输入金额！');
                return false;
            }
            if (!(/(^[1-9]\d*$)/.test(money))) {
                this.$set(this,'couldRecharge',false);
                this.$set(this,'info','转入金额数值必须为正整数！');
                return false;
            } else {
                this.$set(this,'couldRecharge',true);
                this.$set(this,'info','');
            }
        },
        //立即充血啊！！
        confirmRecharge: function () {
            loadingStart();
            this.$http.post(HTTP.url+"charge/add",{
                "uId":this.userID,  //用户id
                "value":parseInt(this.money)  //充值金额
            },{credentials: true})
                .then(function(response){
                    loadingEnd();
                    console.log("充值-请求成功：",response.data);
                    //未登录就跳转到登录页面
                    if(response.data.code==="08"){
                        console.log(response.data.msg||"未登录");
                        window.location.href="login.html";
                    }
                    //响应一个form表单，加载到页面会自动提交，跳转到支付宝充值
                    $("#toAlipay").html(response.data);
                    // 充值请求过去马上打开socket，当支付完成后websocket会接收到信息
                    // 并刷新当前页面信息
                    webSocket();
                    //弹出正在充值的提示框
                    chargingStart();
                })
                .catch(function(response) {
                    console.log("充值-请求错误：",response)
                });
        }
    }
});

//socket连接
function webSocket() {
    var websocket = null;
    //判断当前浏览器是否支持WebSocket
    if('WebSocket' in window){
        websocket = new WebSocket(HTTP.ws+"websocket");
        //连接发生错误的回调方法
        websocket.onerror = function(){
            logInfo("socket error");
        };
        //连接成功建立的回调方法
        websocket.onopen = function(){
            logInfo("socket open");
        };
        //接收到消息的回调方法
        websocket.onmessage = function(response){
            logInfo(response.data);

            var code = JSON.parse(response.data).code;
            if(code==="00"){
                //关闭充值中的提示框，获取最新账户余额信息，返回第一面板
                chargingEnd();
                Balance.getUserInfo();
                Balance.back();
                showMsg("充值成功");
            }
        };
        //连接关闭的回调方法
        websocket.onclose = function(){
            logInfo("socket close");
        };
        //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        window.onbeforeunload = function(){
            websocket.close();
        };

        //在控制台打印信息
        function logInfo(info){
            console.log("socket返回信息：",info);
        }
        //关闭连接
        function closeWebSocket(){
            websocket.close();
        }
        //发送消息
        function send(){
            websocket.send("给我来点最新消息");
        }
    }
    else{
        alert('Not support websocket');
    }

}

