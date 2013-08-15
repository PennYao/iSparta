(function ($) {
	var gui = require('nw.gui');
	var win = gui.Window.get();
	var os = require('os');
	var version="1.0";
	window.iSparta ={
		init:function(){
			var ui=window.iSparta.ui;
			ui.init();
			this.checkVersion();
		},
		getOsInfo:function(){
			var _pf = navigator.platform;
			var appVer = navigator.userAgent;
			
			if(_pf == "Win32" || _pf == "Windows") 
			{
				if(appVer.indexOf("WOW64")>-1){ 
					_bit = "win64"; 
				}else{ 
					_bit = "win32";
				}
				return _bit;
			}
			if(_pf == "Mac68K" || _pf == "MacPPC" || _pf == "Macintosh") 
			{ 
				return "mac"; 
			}else if(_pf == "X11") 
			{ 
				return "unix"; 
			}else if(String(_pf).indexOf("Linux") > -1) 
			{ 
				return "linux"; 
			}else 
			{
				return "unknown"; 
			} 
		},
		postData:function(data,type){
			var hostname=os.hostname();
			var osInfo=this.getOsInfo();
			var timestamp = Date.parse(new Date());

			for(var i=0;i<data.length;i++){
				data[i].hostname=hostname;
				data[i].osInfo=osInfo;
				data[i].timestamp=timestamp;
				if(!data[i].num){
					data[i].num=1;
				}
				data[i].version=version;
				data[i].type=type;
				$.post("http://zhijie.me/iSparta/data.php",data[i],function(result){
					console.log(result);

				});
			}
		},
		checkVersion:function(){
			var ui=this.ui;
			$.get("http://zhijie.me/iSparta/data.php",{versioncheck:version},function(result){
				console.log(result)
				if(result=="new"){
					console.log(version)
				}else{
					ui.showTips("有版本更新！<br/>"+result);
				}
				
			});			
		}
	};
	window.iSparta.ui={
		init:function(){
			this.sysInit();
			this.viewInit();
			this.popInit();
			$(document).on({
		        dragleave:function(e){    
		            e.preventDefault();
		        },
		        drop:function(e){           
		            e.preventDefault();
		        },
		        dragenter:function(e){      
		            e.preventDefault();
		        },
		        dragover:function(e){      
		            e.preventDefault();
		        }
		    });
		},
		sysInit:function(){
			$('.close').click(function() {
				win.close();
			});
			$('.minimize').click(function() {
				win.minimize();
			});
		},
		viewInit:function(){
			
			$(".func_tab .tab_trigger>li").click(function(){

				var trigger=$(".func_tab .tab_trigger>li");
				var index=trigger.index($(this));
				trigger.removeClass("active");
				$(this).addClass("active");
				$(this).closest(".func_tab").find(".tab_content>.cont").removeClass("active");
				$(this).closest(".func_tab").find(".tab_content>.cont").eq(index).addClass("active");
			});
		},
		popInit:function(){
			$(".pop button[data-trigger='close']").click(function(){
				window.iSparta.ui.hideTips();
			});
		},
		showLoading:function(txt){
			if(!txt){
				txt="正在处理，请稍后...";
			}

			$(".pop_loading .txt").html(txt);
			$(".pop_loading").addClass("active");
		},
		hideLoading:function(){
			$(".pop_loading").removeClass("active");
		},
		showProgress:function(progress,txt,closeCallback){
			if(!txt){
				txt="正在处理，请稍后...";
			}
			$(".pop_progress .load-bar-inner").css({width:progress*100+"%"})
			$(".pop_progress .txt").html(txt);
			$(".pop_progress").addClass("active");
			$(".pop_progress  button[data-trigger='close']").one("click",function(){

				closeCallback();
				
			});
		},
		hideProgress:function(){
			$(".pop_progress").removeClass("active");
		},
		showTips:function(txt){
			if(!txt){
				txt="出错了，请重试！";
			}
			$(".pop_tips .txt").html(txt);
			$(".pop_tips").addClass("active");
		},
		hideTips:function(){
			$(".pop_tips").removeClass("active");
		}
	};
	window.iSparta.localData={
		storage:window.localStorage,
		get:function(key){
			return this.storage.getItem(key);
		},
		set:function(key,value){
			this.storage.setItem(key,value);
		},
		getJSON:function(key){
			var val=this.storage.getItem(key);
			val=JSON.parse(val);
			return val;
		},
		setJSON:function(key,value){
			this.storage.setItem(key,JSON.stringify(value));
		}
	}
})(jQuery);