(function ($) {
	var exec = require('child_process').exec,
		os = require('os'),
		fs = require('fs'),
		gui = require('nw.gui');
	var $loop=$("#apng_select_loop"),
		$rate=$("#apng_select_rate"),
		$savePath=$("#apng_select_savePath"),
		$currentPath=$("#apng_select_currentPath"),
		$btnCurrentPath=$("#apng_btn_currentPath"),
		$refresh=$("#apng_currentPath_refresh"),
		$btnSavePath=$("#apng_btn_savePath"),
		$hSavePath=$("#apng_savePath_hidden"),
		$hPath=$("#apng_path_hidden"),
		$btnCov=$("#apng_btn_cov"),
		$dragArea=$("#pngToApng .drag_area"),
		$boxPreview=$("#pngToApng .box_preview"),
		
		$itemOpenPos=$("#pngToApng .imglist .icon-folder-open"),
		tmplFileList = $('#apng_tmpl_filelist').html();
	
	window.iSparta.apng ={
		options:{
			loop:0,
			rate:1,
			savePath:["parent","self"],
			currentPath:[],
			otherFiles:[],
			mixListIndex:0,
			savePathIndex:0,
			currentPathIndex:0
		},
		fileList:[],
		nums:0,
		index:0,
		isClose:false,
		mixIndex:0,
		init:function(){
			localData=window.iSparta.localData;
			var options=localData.getJSON("apng");
			$.extend(this.options,options);
			
			options=this.options;
			$loop.val(options.loop);
			$rate.val(options.rate);
			for(var i=0;i<options.savePath.length;i++){
				if(options.savePath[i]=="parent"){
					var opt=new Option("上级目录",options.savePath[i]);
				}else if(options.savePath[i]=="self"){
					var opt=new Option("同级目录",options.savePath[i]);
				}else{
					var opt=new Option(options.savePath[i],options.savePath[i]);
				}
				
				if(i==options.savePathIndex){
					$(opt).attr("selected","selected");
				}
				$savePath[0].options.add(opt);
		        
			}
			for(var i=0;i<options.currentPath.length;i++){
				var opt=new Option(options.currentPath[i],options.currentPath[i]);
				if(i==options.currentPathIndex){
					$(opt).attr("selected","selected");
					var fileList=[{path:options.currentPath[i]}];
					var otherFiles=[];
					if(options.currentPath[i].indexOf("转换列表")==0){

						fileList=[];
						for(var j=0;j<options.otherFiles.length;j++){
							if(options.currentPath[i]=="转换列表"+options.otherFiles[j].id){
								for(var k=0;k<options.otherFiles[j].path.length;k++){
									fileList.push({path:options.otherFiles[j].path[k]});
								}
							}
						}
					}
					
					this.ui.fillImglist(fileList);
				}
				$currentPath[0].options.add(opt);
		        
			}
			this.ui.init();
		},
		switch:function(id){
			if(!this.fileList[0]){
				window.iSparta.ui.showTips("未选择任何图片！");
				return;
			}
			var files=this.fileList[0].files;
			if(this.nums==0){
	            for(var j=0;j<files.length;j++){
	            	if(files[j].selected==true){
	            		this.nums++;
	            	}
	            }
			}
			if(this.nums==0){
				window.iSparta.ui.showTips("未选择任何图片！");
			}else{
				
				if(!id){
					id=0;
					
				}
				while(files[id]){
					if(files[id].selected==true){
						break;
					}
					id++;
				}
				
				if(id<files.length&&this.isClose==false){
					var progress=(this.index+1)/this.nums;
		
					window.iSparta.ui.showProgress(progress,"正在处理第"+(this.index+1)+"张(共"+this.nums+"张)图片",function(){
						window.iSparta.apng.isClose=true;
					});
					this.index++;
					this.exec(id);
				}else{
					this.nums=0;
					this.index=0;
					var filesInfo=window.iSparta.apng.fileList[0].files;
					
					var Allinfo=[];
					for(var i=0;i<filesInfo.length;i++){
						if(filesInfo[i].selected==true){
							var info={};
							info.name=filesInfo[i].name;
							info.beforesize=filesInfo[i].allPngSize;
							info.aftersize=filesInfo[i].apngsize;

							info.num=filesInfo[i].url.length;
							Allinfo.push(info);
						}
					}
					window.iSparta.postData(Allinfo,"apng");
					this.isClose=false;
					window.iSparta.ui.hideProgress();
				}
			}
			

		},
		exec:function(id){
   			var loop=this.options.loop;
			var rate=this.options.rate;
			var savePath=this.options.savePath[this.options.savePathIndex];
			var files=this.fileList[0].files;
			var url=files[id].url[0];
            var name=files[id].name;
            var path=savePath+"\\"+name+".png";
            if(savePath=="parent"){
            	var path=files[id].pppath+"\\"+name+".png";
            }else if(savePath=="self"){
            	var path=files[id].ppath+"\\"+name+".png";
            }
            
            var apngasm = process.cwd() + '\\app\\libs\\apng\\'+iSparta.getOsInfo()+'\\apngasm.exe';
            var apngopt = process.cwd() + '\\app\\libs\\apng\\'+iSparta.getOsInfo()+'\\apngopt.exe';
           
			exec('"'+apngasm+'" "'+path+'" "'+url+'" '+rate+" 10"+" /l"+loop, {timeout: 10000}, function(e){
                exec('"'+apngopt+'" "'+path+'" "'+path, {timeout: 10000}, function(e){
                	
                	var size=fs.statSync(path).size;
                	files[id].apngsize=size;
                    window.iSparta.apng.switch(id+1);
                });
            });
		}
	};
	// 界面操作
	window.iSparta.apng.ui={
		dataHelper:{},
		init:function(){
			this.dataHelper=window.iSparta.apng.dataHelper;
			this.topbar();
			this.preview();
			this.items();
			this.status();
		},
		topbar:function(){
			var ui=this;
			$loop.on("change",function(){
				ui.dataHelper.changeLoop($(this).val());
			});
			$rate.on("change",function(){
				ui.dataHelper.changeRate($(this).val());
			});
			$savePath.on("change",function(){
				ui.dataHelper.changeSavaPath($(this).val());
			});
			$btnSavePath.on("click",function(){
				$hSavePath.click();
			});
			$hSavePath.on("change",function(e){
				var val=$(this).val();
				var opt=new Option(val,val);
				$(opt).attr("selected","selected");
				$savePath[0].insertBefore(opt,$savePath[0].options[0])
				//$savePath[0].options.add(opt);
				ui.dataHelper.changeSavaPath(val);
			});
			$btnCov.on("click",function(){
				window.iSparta.apng.switch();
			});
		},
		preview:function(){
			var ui=this;
			$boxPreview[0].ondragover = function() { 
				$dragArea.addClass("hover");
				return false;
			};

			$boxPreview[0].ondragleave = function(e) { 
				$dragArea.removeClass("hover");
				return false;
			};
			$boxPreview[0].ondrop = function(e) {
				var apng=window.iSparta.apng;
				e.preventDefault();
				$dragArea.removeClass("hover");
				e.preventDefault(); //取消默认浏览器拖拽效果
		        var otherFiles = e.dataTransfer.files; //获取文件对象
		        apng.options.mixListIndex++;
		        var mixIndex=apng.options.mixListIndex;
		        //var opt=new Option(fileList[0].path,fileList[0].path);
		        var v=ui.fillImglist(otherFiles);
		        if(v){
			        var fileList="转换列表"+mixIndex;
			        var opt=new Option("转换列表"+mixIndex,"转换列表"+mixIndex);
			        $(opt).attr("selected","selected");
					$currentPath[0].insertBefore(opt,$currentPath[0].options[0]);
		        	ui.dataHelper.changeCurrentPath(fileList,otherFiles);
		        }
		        
				return false;
			};
			$dragArea.click(function(e) {
				$hPath.click();
			});
			$hPath.on("change",function(e){
				var fileList = e.delegateTarget.files; //获取文件对象
				var val=$(this).val();
				if(ui.fillImglist(fileList)){
					var opt=new Option(val,val);
					$(opt).attr("selected","selected");
					$currentPath[0].insertBefore(opt,$currentPath[0].options[0]);
				
				
		        
		        	ui.dataHelper.changeCurrentPath(val);
		        }
		        
				return false;
			});
		},
		fillImglist:function(fileList){
			if(fileList.length == 0){
	            return false;
	        }
	        window.iSparta.ui.showLoading();
	        window.iSparta.apng.fileManager.walk(fileList,function(){});
	       	window.iSparta.ui.hideLoading();

	        var datas={};
	        datas.all=window.iSparta.apng.fileList;
	       
	        if(datas.all.length==0){
	        	window.iSparta.ui.showTips("文件名序列化！");
	        	return false;
	        }else{
	        	var doTtmpl = doT.template(tmplFileList);
	        	var html=doTtmpl(datas);
	        	$boxPreview.html(html);
	        	return true;
	        }
	        
		},
		items:function(){
			var timer=null;
			var ui=this;
			var urlIndex=0;
			$boxPreview.on("click",".imglist .thumb",function(){
				var fileList=window.iSparta.apng.fileList;
		        var li=$(this).closest("li");
		        var pid=li.attr("data-pid");
		        var id=li.attr("data-id");
		        li.toggleClass("checked");
		        if(li.hasClass("checked")){
		            fileList[pid].files[id].selected=true;
		        }else{
		            fileList[pid].files[id].selected=false;
		        }
		    });
		    $boxPreview.on("mouseover",".imglist .thumb",function(){
		    	var fileList=window.iSparta.apng.fileList;
		    	var li=$(this).closest("li");
		        var pid=li.attr("data-pid");
		        var id=li.attr("data-id");
				
				var that=$(this);
				timer=setInterval(function(){
					if(urlIndex>fileList[pid].files[id].url.length-1){
						urlIndex=0;
					}
					that.find("img").attr("src",fileList[pid].files[id].url[urlIndex]);
					urlIndex++;
				},window.iSparta.apng.options.rate*100);
		    });
		    $boxPreview.on("mouseout",".imglist .thumb",function(){
		    	var fileList=window.iSparta.apng.fileList;
		    	var li=$(this).closest("li");
		        var pid=li.attr("data-pid");
		        var id=li.attr("data-id");
		    	clearInterval(timer);
		    	$(this).find("img").attr("src",fileList[pid].files[id].url[0]);
		    });
		    $boxPreview.on("click",".imglist .icon-folder-open",function(){
		        var url=$(this).attr("data-href");
		        gui.Shell.showItemInFolder(url);
		    });
		    $boxPreview.on("blur",".imglist input[type='text']",function(){
		        var name=$(this).val();
		        var fileList=window.iSparta.apng.fileList;
		    	var li=$(this).closest("li");
		        var pid=li.attr("data-pid");
		        var id=li.attr("data-id");
		        fileList[pid].files[id].name=name;
		    });
		},
		status:function(){
			var ui=this;
			$currentPath.on("change",function(){
				var options=window.iSparta.apng.options;
				var path=$(this).val();

				if(path.indexOf("转换列表")==0){
					var fileList=[];
					for(var j=0;j<options.otherFiles.length;j++){

						if(path=="转换列表"+options.otherFiles[j].id){
							for(var k=0;k<options.otherFiles[j].path.length;k++){
								fileList.push({path:options.otherFiles[j].path[k]});
							}
						}
					}
				}else{
					var fileList=[{path:path}];
				}
				ui.dataHelper.changeCurrentPath($(this).val());
				ui.fillImglist(fileList);
				

			});
			$btnCurrentPath.on("click",function(){
				$hPath.click();
			});
			
			$refresh.on("click",function(){
				var path=$currentPath.val();
				if(path){
					var fileList=[{path:path}];
					ui.fillImglist(fileList);
				}
				
				return false;
			});

		}
	};
	// 数据控制
	window.iSparta.apng.dataHelper={
		changeLoop:function(loop){
			var apng=window.iSparta.apng;
			apng.options.loop=loop;
			window.iSparta.localData.setJSON("apng",apng.options);
		},
		changeRate:function(rate){
			var apng=window.iSparta.apng;
			apng.options.rate=rate;
			window.iSparta.localData.setJSON("apng",apng.options);
		},
		changeSavaPath:function(savePath){
			var apng=window.iSparta.apng;
			var theSavePath=apng.options.savePath;
			for(var i=0;i<theSavePath.length;i++){
				if(savePath==theSavePath[i]){
					break;
				}
			}

			var index=$savePath[0].selectedIndex;
			if((i!=theSavePath.length)||savePath=="parent"||savePath=="self"){
				apng.options.savePathIndex=i;
				window.iSparta.localData.setJSON("apng",apng.options);
			}else{
				if(apng.options.savePath.length>6){
					apng.options.savePath.splice(4,1);
				}
				var len=apng.options.savePath.length;
				apng.options.savePath.unshift(savePath);
				apng.options.savePathIndex=0;
				window.iSparta.localData.setJSON("apng",apng.options);
			}
			
		},
		changeCurrentPath:function(currentPath,theOtherFiles){
			var apng=window.iSparta.apng;
			var theCurrentPath=apng.options.currentPath;
			
			if(currentPath.indexOf("转换列表")==0){
				for(var i=0;i<theCurrentPath.length;i++){
					if(currentPath==theCurrentPath[i]){
						break;
					}
				}
				var index=$currentPath[0].selectedIndex;
				if(i!=theCurrentPath.length){
					apng.options.currentPathIndex=i;
					window.iSparta.localData.setJSON("apng",apng.options);
				}else{
					if(apng.options.currentPath.length>4){
						apng.options.currentPath.splice(4,1);
					}
					apng.options.currentPath.unshift(currentPath);
					var len=apng.options.currentPath.length;
					apng.options.currentPathIndex=0;
					var otherFiles={id:apng.options.mixListIndex,path:[]};
					for(var i=0;i<theOtherFiles.length;i++){
						otherFiles.path.push(theOtherFiles[i].path);
					}
					
					apng.options.otherFiles.push(otherFiles);
					
					window.iSparta.localData.setJSON("apng",apng.options);
				}
			}else{
				for(var i=0;i<theCurrentPath.length;i++){
					if(currentPath==theCurrentPath[i]){
						break;
					}
				}
				var index=$currentPath[0].selectedIndex;
				if(i!=theCurrentPath.length){
					apng.options.currentPathIndex=i;
					window.iSparta.localData.setJSON("apng",apng.options);
				}else{
					if(apng.options.currentPath.length>4){
						apng.options.currentPath.splice(4,1);
					}
					apng.options.currentPath.unshift(currentPath);
					var len=apng.options.currentPath.length;
					apng.options.currentPathIndex=len-i+1;
					
					window.iSparta.localData.setJSON("apng",apng.options);
				}
			}
			
		}
	};
	// 文件目录递归与操作
	window.iSparta.apng.fileManager={
	    length:-1,
	    nowLen:0,
	    names:[],
	    allsize:0,
	    walk:function(fileList,callback){
	        // 一次只拉一个文件夹
	        var apng=window.iSparta.apng;
	        this.length=0;
	        apng.fileList=[];
	        this.names=[];
	        for(var i=0;i<fileList.length;i++){
	            var path=fileList[i].path;
	            var dirs={};
	            if(fs.statSync(path).isDirectory()){
	                var url=path.substring(0,path.lastIndexOf("\\"));
	                dirs.url=url;
	                dirs.length=this.length+i;
	                dirs.files=[];
	                apng.fileList.push(dirs);
	                this.walkDir(path);
	                //fileWalk.length++;
	            }else if(fs.statSync(path).isFile()){
	                var url=path.substring(0,path.lastIndexOf("\\"));

	                //if(fileWalk.length==0||url!=fileWalk.allFileList[fileWalk.length].url){
	                    dirs.url=url;
	                    dirs.files=[];
	                    if(this.nowLen!=this.length||(this.length==0&&(!apng.fileList[this.length]||url!=apng.fileList[this.length].url))){
	                        apng.fileList.push(dirs);
	                    }
	                    if(this.nowLen!=this.length){
	                        this.nowLen=this.length
	                    }
	                    this.walkFile(path);
	                    //return ;
	               // }
	                //fileWalk.walkFile(path);

	            }
	            
	            
	        }
	        var len=apng.fileList.length;
	        var listTemp=apng.fileList;
	        for(var i=len-1;i>=0;i--){
	            var len2=apng.fileList.length;
	            if(apng.fileList[i].files.length==0){
	                
	                apng.fileList.splice(len2-1,1);
	               
	            }
	        }
	        if((typeof callback)=='function'){
	        	callback();
	        }
	    },
	    walkFile:function(path){
	        //var apng={name:name};
	         var apng=window.iSparta.apng;
	        if(/.*\d+\.png$/i.test(path)){
	            //apng.frames.push(path);
	            var url=path;
	            var repeatIndex=-1;
	           
	            var allfile=apng.fileList[this.length].files;
	            var stat=fs.statSync(path);
	            var size=stat.size;
	            path2=path;
	            path=path.replace(/\d+\.png$/i,"");
	            
	            var ppath=path.substring(0,path.lastIndexOf("\\"));
	            var pppath=ppath.substring(0,ppath.lastIndexOf("\\"));
	            var name=path.substring(path.lastIndexOf("\\")+1,path.length);
	            if(name.length<2){
	                name=path.substring(0,path.lastIndexOf("\\"));
	                name=name.substring(name.lastIndexOf("\\")+1,name.length);
	            }
	            var index=0;
	            for(var i=0;i<this.names.length;i++){
	                if(name==this.names[i]){
	                    
	                    var name2=this.names[i].match(/(.*?)(\d+)$/i);

	                    if(name2){
	                        
	                        var num=parseInt(name2[2]);
	                        var pre=name2[1];
	                        if(num>index){
	                            num=num+1;
	                            name=pre+num;
	                        }
	                    }else{
	                         name=name+1;
	                    }
	                }
	            }
	            for(var i=0;i<allfile.length;i++){
	                if(path==allfile[i].path){
	                    repeatIndex=i;
	                }
	            }
	            if(allfile.length!=0&&repeatIndex!=-1){
	                allfile[repeatIndex].url.push(url);
	                allfile[repeatIndex].allPngSize+=size;

	            }else{
	                if(allfile.length!=0&&allfile[allfile.length-1].url.length==1){
	                    allfile.splice(allfile.length-1,1);
	                }
	                var file={path2:path,path:path,ppath:ppath,pppath:pppath,selected:true};
	                file.url=[];
	                
	                
	                file.name=name;
	                file.allPngSize=size;
	                this.names.push(name);
	                file.url.push(url);
	                allfile.push(file);
	                file.allPngSize=0;
	            }
	        }
	    },
	    walkDir:function(path){
	        var dirList = fs.readdirSync(path);
	        var that=this;
	        dirList.forEach(function(item){
	            if(fs.statSync(path + '\\' + item).isDirectory()){ 
	                that.walkDir(path + '\\' + item);
	            }else if(fs.statSync(path + '\\' + item).isFile()){
	                that.walkFile(path + '\\' + item);
	            }
	        });
	    }
	}


})(jQuery);