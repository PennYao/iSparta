(function ($) {
	var gui = require('nw.gui');
	var win = gui.Window.get();
	window.iSparta ={
		init:function(){
			var ui=window.iSparta.ui;
			ui.init();
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
		showProgress:function(progress,txt){
			if(!txt){
				txt="正在处理，请稍后...";
			}
			$(".pop_progress .load-bar-inner").css({width:progress*100+"%"})
			$(".pop_progress .txt").html(txt);
			$(".pop_progress").addClass("active");
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