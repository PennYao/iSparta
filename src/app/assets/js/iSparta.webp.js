(function ($) {

	var fs = require('fs'),
		path = require('path'),
		exec = require('child_process').exec;

		// setting
	var $config = $("#webp_select_config"),
		$ratio = $("#webp_select_ratio"),
		$savePath = $("#webp_select_savePath"),
		$btnSavePath = $("#webp_btn_savePath"),
		$hSavePath = $("#webp_savePath_hidden"),
		$btnCov = $("#webp_btn_cov"),

		// preview
		$boxPreview = $("#pngToWebp .box_preview"),
		$dragArea = $("#pngToWebp .drag_area"),

		// status
		$currentPath = $("#webp_select_currentPath"),
		$btnCurrentPath = $("#webp_btn_currentPath"),
		$hPath = $("#webp_path_hidden"),
		$refresh = $("#webp_currentPath_refresh");


	window.iSparta.webp = {

		options: {
			config: '',						// 有损/无损
			ratio: '75',					// 压缩比例
			savePath: ["self","parent"],	// 保存路径数组
			currentPath: [],				// 当前预览区域路径
			otherFiles: [],					// 其他
			savePathIndex: 0,				// 保存路径索引
			currentPathIndex: 0				// 当前路径索引
		},
		
		dirName: '',		// 文件夹名
		fileList: {},		// 文件列表
		isDir: true,		// 是否目录

		init: function() {

			var localData = window.iSparta.localData;
			var options = localData.getJSON("webp");
			$.extend(this.options, options);
			
			options = this.options;
			$config.val(options.config);
			$ratio.val(options.ratio);

			var opt;
			for(var i=0; i<options.savePath.length; i++){
				if(options.savePath[i] == "parent"){
					opt = new Option("上级目录", options.savePath[i]);
				}else if(options.savePath[i]=="self"){
					opt = new Option("同级目录", options.savePath[i]);
				}else{
					opt = new Option(options.savePath[i], options.savePath[i]);
				}
				if(i == options.savePathIndex){
					$(opt).attr("selected", "selected");
				}
				$savePath[0].options.add(opt);
			}

			for(var i=0; i<options.currentPath.length; i++){
				var opt = new Option(options.currentPath[i], options.currentPath[i]);

				if(i == options.currentPathIndex){
					$(opt).attr("selected", "selected");
					$boxPreview.empty();
					this.ui.fillImgDirList(options.currentPath[i] + path.sep);
					window.iSparta.webp.dirName = options.currentPath[i] + path.sep ;

					/**********************/
					console.log(this.dirName);
				}
				$currentPath[0].options.add(opt);
			}

			this.ui.init();
		},

		exec: function(dir) {

			var sysInfo;
			if(window.iSparta.getOsInfo() == 'win32') {
				sysInfo = path.sep+'app'+path.sep+ 'libs'+path.sep+'webp'+path.sep+'libwebp-0.3.1-windows-x32'+path.sep+'cwebp.exe';
			}else if(window.iSparta.getOsInfo() == 'win64') {
				sysInfo = path.sep+'app'+path.sep+'libs'+path.sep+'webp'+path.sep+'libwebp-0.3.1-windows-x64'+path.sep+'cwebp.exe';
			}else {
				sysInfo = '';	// for other os
			}

			var cwebp = process.cwd() + sysInfo;
			var dConfig = ' -m 6 ';
			var param = dConfig + this.options.config + ' -q ' + this.options.ratio + ' ';
			var currentPath = this.options.currentPath[this.options.currentPathIndex];
			var savePath = this.options.savePath[this.options.savePathIndex];
			var config = this.options.config === '' ? '-lossy' : '-lossless';
			var dirName = currentPath.substring(currentPath.lastIndexOf(path.sep)+1) + '-webp' + config + this.options.ratio;

			var finalSavePath;
			if(savePath == 'parent') {
				finalSavePath = currentPath.substring(0, currentPath.lastIndexOf(path.sep)) + path.sep + dirName + path.sep;
			}else if(savePath == 'self') {
				finalSavePath = currentPath + path.sep + dirName + path.sep;
			}else {
				finalSavePath = savePath + path.sep + dirName + path.sep;
			}
			/**********************/
			console.log(finalSavePath);

			if(!fs.existsSync(finalSavePath)) {
				fs.mkdirSync(finalSavePath)
			}

			/**********************/
			console.log('Dir:'+window.iSparta.webp.isDir);
			if(window.iSparta.webp.isDir) {
				fs.readdir(dir, function(err, files) {
					if (err) {
						window.iSparta.ui.showTips("读取文件夹出错！");
						$boxPreview.append('<div class="empty"><span class="drag_area">+</span></div>')
					}else {
						for (var i = 0; i < files.length; ++i) {
							var progress = (i+1)/files.length;

							if(files[i].indexOf('.jpg') != -1 || files[i].indexOf('.png') != -1){
								
								/**********************/
								console.log('"'+cwebp+'" '+param+'"'+currentPath + path.sep +files[i]+'"'+ ' -o ' + '"' +
								 finalSavePath + files[i].substring(0, files[i].lastIndexOf('.')) + '.webp"');

								exec('"'+cwebp+'" '+param+'"'+currentPath + path.sep +files[i]+'"'+ ' -o ' + '"' +
								 finalSavePath + files[i].substring(0, files[i].lastIndexOf('.')) + '.webp"');
							}
						}
						window.iSparta.ui.showTips("转换完成！");
					}
				});
			} else {
				var files = window.iSparta.webp.fileList;
				for(var i=0; i<files.length; i++){
					if(files[i].path.indexOf('.jpg') != -1 || files[i].path.indexOf('.png') != -1){

						/**********************/
						console.log('"'+cwebp+'"'+param+'"'+currentPath + path.sep +files[i].name+'"'+ ' -o ' + '"' +
						 finalSavePath + files[i].name.substring(0, files[i].name.lastIndexOf('.')) + '.webp"');

						exec('"'+cwebp+'" '+param+'"'+currentPath + path.sep +files[i].name+'"'+ ' -o ' + '"' +
						 finalSavePath + files[i].name.substring(0, files[i].name.lastIndexOf('.')) + '.webp"');
					}
				}
				window.iSparta.ui.showTips("转换完成！");
			}
		}
	},

	window.iSparta.webp.ui = {

		dataHelper: {},

		init: function() {

			this.dataHelper = window.iSparta.webp.dataHelper;
			this.topbar();
			this.preview();
			this.status();
		},

		topbar: function() {

			var ui = this;

			$config.on('change', function() {
				ui.dataHelper.changeConfig($(this).val());
			})

			$ratio.on('change', function() {
				ui.dataHelper.changeRatio($(this).val());
			})

			$savePath.on("change", function() {
				ui.dataHelper.changeSavaPath($(this).val());
			});

			$btnSavePath.on("click", function() {
				$hSavePath.click();
			});

			$hSavePath.on("change", function(e) {
				var val = $(this).val();
				var opt = new Option(val, val);
				$(opt).attr("selected", "selected");
				$savePath[0].insertBefore(opt, $savePath[0].options[0])
				ui.dataHelper.changeSavaPath(val);
			});

			$btnCov.click(function() {
				if($boxPreview.is(':empty')) {
					window.iSparta.ui.showTips();
				}else {
					window.iSparta.webp.exec(window.iSparta.webp.dirName);	
				}
			})
		},

		preview: function() {
			
			var ui = this;

			$("body").on("click", ".drag_area", function(){
			  $hPath.click();
			});

			$hPath.on("change", function(e) {

				window.iSparta.webp.isDir = true;

				var val = $(this).val();
				var opt = new Option(val, val);
				$(opt).attr("selected", "selected");
				$currentPath[0].insertBefore(opt, $currentPath[0].options[0]);
				ui.dataHelper.changeCurrentPath(val);

				$boxPreview.empty();
				ui.fillImgDirList(val + path.sep);
				window.iSparta.webp.dirName = val + path.sep;

				return false;
			});

			// 只有 DOM 才能获取 e 对象，所以需要转换
			$boxPreview[0].ondragover = function() {
				$dragArea.addClass("hover");
				return false;
			}

			$boxPreview[0].ondragleave = function() {
				$dragArea.removeClass("hover");
				return false;
			}

			$boxPreview[0].ondrop = function(e) {
				e.preventDefault();
				$dragArea.removeClass("hover");

				var fileList = e.dataTransfer.files; //获取文件对象

				// 目录
				if(fileList[0].path.lastIndexOf('.png') == -1 && fileList[0].path.lastIndexOf('.jpg') == -1 ){

					window.iSparta.webp.isDir = true;

					var pathstr = fileList[0].path;
					var opt = new Option(pathstr, pathstr);
			        $(opt).attr("selected", "selected");
					$currentPath[0].insertBefore(opt, $currentPath[0].options[0]);
			        ui.dataHelper.changeCurrentPath(pathstr);

					$boxPreview.empty();
					ui.fillImgDirList(pathstr + path.sep);
					window.iSparta.webp.dirName = pathstr + path.sep;
				}
				// 拖曳文件
				else {

					window.iSparta.webp.isDir = false;
					window.iSparta.webp.fileList = fileList;

					var pathstr = fileList[0].path.substring(0, fileList[0].path.lastIndexOf('\\'));
					var opt = new Option(pathstr, pathstr);
			        $(opt).attr("selected", "selected");
					$currentPath[0].insertBefore(opt, $currentPath[0].options[0]);
			        ui.dataHelper.changeCurrentPath(pathstr);

					$boxPreview.empty();
					ui.fillImgList(fileList);
					window.iSparta.webp.dirName = pathstr + path.sep;
				}

				return false;
			}
		},

		status: function() {

			var ui = this;

			$currentPath.on("change", function() {
				window.iSparta.webp.isDir = true;
				var options = window.iSparta.webp.options;
				ui.dataHelper.changeCurrentPath($(this).val());

				$boxPreview.empty();
				ui.fillImgDirList($(this).val() + path.sep);
				window.iSparta.webp.dirName = $(this).val() + path.sep;

				return false;
			});

			$btnCurrentPath.on("click",function(){
				$hPath.click();
			});

			$refresh.on("click",function(){
				window.iSparta.webp.isDir = true;
				var pathstr = $currentPath.val();
				$boxPreview.empty();
				ui.fillImgDirList(pathstr + path.sep);
				window.iSparta.webp.dirName = pathstr + path.sep;
				return false;
			});
		},

		fillImgDirList: function(path) {
			var manager = window.iSparta.webp.fileManager;

			fs.readdir(path, function(err, files) {
				if (err) {
					window.iSparta.ui.showTips("读取文件夹出错！");
					$boxPreview.empty().append('<div class="empty"><span class="drag_area">+</span></div>')
				}else {
					for (var i = 0; i < files.length; ++i) {
						manager.readPics(path + files[i]);
					}
				}
			});
		},

		fillImgList: function(fileList) {
			var manager = window.iSparta.webp.fileManager;

			for(var i=0; i<fileList.length; i++){
				manager.readPics(fileList[i].path);
			}
		}

	};

	// 数据控制
	window.iSparta.webp.dataHelper = {

		changeConfig: function(config) {
			var webp = window.iSparta.webp;
			webp.options.config = config;
			window.iSparta.localData.setJSON("webp", webp.options);
		},

		changeRatio: function(ratio) {
			var webp = window.iSparta.webp;
			webp.options.ratio = ratio;
			window.iSparta.localData.setJSON("webp", webp.options);
		},

		changeSavaPath: function(savePath) {
			var webp = window.iSparta.webp;
			var theSavePath = webp.options.savePath;
			for(var i=0; i<theSavePath.length; i++){
				if(savePath == theSavePath[i]){
					break;
				}
			}
			var index = $savePath[0].selectedIndex;

			// where did this i comes from ?
			if((i != theSavePath.length) || savePath == "parent" || savePath == "self"){
				webp.options.savePathIndex = i;
				window.iSparta.localData.setJSON("webp", webp.options);
			}else{
				if(webp.options.savePath.length > 6){
					webp.options.savePath.splice(4, 1);
				}
				var len = webp.options.savePath.length;
				webp.options.savePath.unshift(savePath);
				webp.options.savePathIndex = 0;
				window.iSparta.localData.setJSON("webp", webp.options);
			}
		},

		changeCurrentPath: function(currentPath) {
			var webp = window.iSparta.webp;
			var theCurrentPath = webp.options.currentPath;

			if(currentPath instanceof Object){
				for(var i=0; i<theCurrentPath.length; i++){
					if(currentPath[0] == theCurrentPath[i]){
						break;
					}
				}
				var index = $currentPath[0].selectedIndex;
				if(i != theCurrentPath.length){
					webp.options.currentPathIndex = i;
					window.iSparta.localData.setJSON("webp", webp.options);
				}else{
					if(webp.options.currentPath.length > 4){
						webp.options.currentPath.splice(4, 1);
					}
					webp.options.currentPath.unshift(currentPath[0].path);
					var len = webp.options.currentPath.length;
					webp.options.currentPathIndex = 0;
					var otherFiles = [];
					window.iSparta.localData.setJSON("webp",webp.options);
				}
			}else{
				for(var i=0; i<theCurrentPath.length; i++){
					if(currentPath == theCurrentPath[i]){
						break;
					}
				}
				var index = $currentPath[0].selectedIndex;
				if(i != theCurrentPath.length){
					webp.options.currentPathIndex = i;
					window.iSparta.localData.setJSON("webp", webp.options);
				}else{
					if(webp.options.currentPath.length > 4){
						webp.options.currentPath.splice(4, 1);
					}
					webp.options.currentPath.unshift(currentPath);
					var len = webp.options.currentPath.length;
					webp.options.currentPathIndex = len-i+1;
					
					window.iSparta.localData.setJSON("webp", webp.options);
				}
			}
		}
	},

	window.iSparta.webp.fileManager = {

		readPics: function(files) {
			if(files.indexOf('.jpg') != -1 || files.indexOf('.png') != -1){
				$boxPreview.append('<img class="thumbnail" src="'+files+'" alt="" />');
			}
		}
	}

})(jQuery);