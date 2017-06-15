$(document).ready(function() {
	stop = false; //是否加载（避免重复加载）
	/*判断是否存在缓存*/
	if(sessionStorage.wx_data){ 
		str = sessionStorage.wx_data; 
		obj = JSON.parse(str);
		$("#wraper").html(obj.data);
		setTimeout("$(document).scrollTop(obj.scroll)",1);
	}else{
		ajax(0,0);
	}

	/*点击导航条目*/
	$(".menu_bar>a").on('click', function() {
		var w = $(document).width();
		$(".menu_bar").removeClass('open');
		$(".cr").addClass('hide');
		$(this).siblings('a').removeClass('active');
		$(this).addClass('active');
		$(".menu_more").removeClass('is-active');
		$(this).parent().animate({scrollLeft: ($(this).index())*63-(w/2-29)});
		var item = $(".menu_bar>a").index(this);
		ajax(item,0);
	});

	/*更多菜单*/
	$(".menu_more").on('click', function() {
		$(".menu_bar").toggleClass('open');
		$(this).toggleClass('is-active');
		$(".cr").toggleClass('hide');
	});

	/*刷新*/
	$(".refresh").on('click', function() {
		$(".menu_bar").removeClass('open');
		$(".cr").addClass('hide');
		var item = $(".menu_bar>a.active").attr('id');
		ajax(item,0);
	});

	/*版本切换*/
	$(".vision").on('click',function() {
		$("#container").toggleClass('lite');
		if($(this).attr('lite')=="false"){
			$(this).text("标准");
			$(this).attr('lite',"true")
		}else{
			$(this).text("简版");
			$(this).attr('lite',"false")
		}
		$(".menu_bar").removeClass('open');
		$(".cr").addClass('hide');
		var item = $(".menu_bar>a.active").attr('id');
		ajax(item,0);
	});

	/*回顶部*/
	$(".top").on('click', function() {
		$('body,html').animate({scrollTop:0});
	});

	/*滑动到底部自动加载并关闭导航条*/
	$(window).scroll(function () {		
		cache(); /*缓存*/	
		$(".menu_bar").removeClass('open');
		$(".cr").addClass('hide');
		$(".menu_more").removeClass('is-active');
		if ($(document).scrollTop() + 200 >= $(document).height() - $(window).height() && $(document).scrollTop() > 0) {
			var item = $("#container li:last").attr("item");
			var page = $("#container li:last").attr("page");
			var name = $("title").text();
			ajax(item,page);
		}
	});
});

/*请求数据*/
function ajax(item,page){
	if(stop==true) return false;
	if(page>14){
		$(".more i").hide();
		$(".more .text").text("已无更多");
		return false;
	}
	var vision = ($("#container").hasClass('lite'))?2:1;
	$.ajax({
		url: 'index.php',
		type: 'post',
		timeout:5000,
		dataType: 'json',
		data: {"item": item,"page":page,"vision":vision},
		beforeSend:function(){
			stop=true;
			$(".more i").show();
			$(".more .text").text("正在加载");
		},
		success:function(msg){
			stop = false;
			if(msg.status==1){
				if(page==0){
					$('body,html').scrollTop(0);
					$("#container").empty();
					$("#container").html(msg.data);
				}else{
					$("#container ul").append(msg.data);
				}
				$("#container li:last").attr("item",item);
				$("#container li:last").attr("page",parseInt(page)+1);
				/*格式化时间*/
				var elements = document.getElementsByClassName('s2');
				for (var i = 0; i < elements.length; i++) {
					var time = elements[i].getAttribute('t');
					elements[i].innerHTML = jsDateDiff(time);
				}
				/*图片去除模糊效果*/	
				// $("img").load(function(){
				// 	$(this).css("filter","blur(0)");
				// });
				$('a').attr('target','_self');/*阻止新窗口打开链接*/
				cache();/*缓存数据*/	
			}else{
				$(".more i").hide();
				$(".more .text").text("加载失败");
				$(".tips").text(msg.info).show().delay(3000).fadeOut();
			}
		},
		error:function(){
			stop = false;
			$(".more i").hide();
			$(".more .text").text("加载失败");
			$(".tips").text('网络异常').show().delay(3000).fadeOut();
		}
	});
}

/*记录滚动条位置和缓存数据*/
function cache(){
	var data = $("#wraper").html();
	var scroll = $(document).scrollTop();
	var obj = {"data":data,"scroll":scroll}; 
	var str = JSON.stringify(obj); 
	sessionStorage.wx_data = str;	
}

/*时间转换*/
function jsDateDiff(publishTime){       
	var d_minutes,d_hours,d_days;       
	var timeNow = parseInt(new Date().getTime()/1000);       
	var d;       
	d = timeNow - publishTime;       
	d_days = parseInt(d/86400);       
	d_hours = parseInt(d/3600);       
	d_minutes = parseInt(d/60);       
	if(d_days>0 && d_days<4){       
		return d_days+"天前";       
	}else if(d_days<=0 && d_hours>0){       
		return d_hours+"小时前";       
	}else if(d_hours<=0 && d_minutes>0){       
		return d_minutes+"分钟前";       
	}else if(d<60 && d>0){       
		return d+"秒前"; 
	}else{       
		var s = new Date(publishTime*1000);       
		s.getFullYear()+"年";
		return (s.getMonth()+1)+"月"+s.getDate()+"日";  
	}       
}