// 百度地图API功能
var MAP = new BMap.Map("map");

var center = new BMap.Point(104.044605,30.601263);    // 创建点坐标
MAP.centerAndZoom(center,15);                     // 初始化地图,设置中心点坐标和地图级别。

MAP.addControl(new BMap.NavigationControl());
MAP.enableScrollWheelZoom();                  // 启用滚轮放大缩小。
MAP.enableKeyboard();

var myIcon = new BMap.Icon("../images/contact/marker.png", new BMap.Size(159, 57), {
    offset: new BMap.Size(0, 0),
    imageOffset: new BMap.Size(0, 0)
});

var marker = new BMap.Marker(new BMap.Point(104.044605,30.601263), {icon: myIcon}); // 创建标注
MAP.addOverlay(marker);              // 将标注添加到地图中
marker.setAnimation(BMAP_ANIMATION_DROP);    // 落下来就停止
//marker.setAnimation(BMAP_ANIMATION_BOUNCE);  // 动画一直跳

