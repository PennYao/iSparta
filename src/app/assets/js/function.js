var fs = require('fs');
var exec = require('child_process').exec;

var $preview = $('.preview');
var $convert = $('#operate a');
var $filePath = $('#outputPath');
var fileList = new Array();
var fileNameList = new Array();
var holder = document.getElementById('holder');

// prevent default behavior from changing page on dropped file
window.ondragover = function(e) { 
	e.preventDefault(); 
	return false;
};

window.ondrop = function(e) { 
	e.preventDefault(); 
	return false;
};

holder.ondragover = function() { 
	this.className = 'hover';
	return false;
};

holder.ondragleave = function(e) { 
	holder.className = '';
	return false;
};

holder.ondrop = function(e) {
	e.preventDefault();
	this.className = '';
	$filePath.removeClass("manual").addClass("auto");

  	var path = e.dataTransfer.files[0].path + '\\';

  	// 如果是目录（循环递归）
  	if(path.indexOf('.jpg') == -1 && path.indexOf('.png') == -1 ){

  		$filePath.val(path);

		fs.readdir(path, function(err, files) {
			if (err) throw err;
			for (var i = 0; i < files.length; ++i) {
				readPics(path + files[i]);
			}
		});
	} else {

		$filePath.val(path.substring(0, e.dataTransfer.files[0].path.lastIndexOf('\\')) + '\\');

		for (var i = 0; i < e.dataTransfer.files.length; ++i) {
			readPics(e.dataTransfer.files[i].path);
		}
	}
	
	return false;
};

// click to open file dialog
$('#holder').click(function() {
	chooseFile('#fileDialog');
	$filePath.removeClass("manual").addClass("auto");
});

// click to choose a save path
$(".path a").click(function() {
	chooseSavePath('#outputDialog');
	$filePath.addClass("manual").removeClass("auto");
});

// click to convert 
$convert.click(function() {
	var cwebp = process.cwd() + '\\app\\libs\\libwebp-0.3.1-windows-x64\\cwebp.exe ';
	var param = '-q 75 ';
	if($filePath.hasClass("auto")){
		var upper = $filePath.val().substring(0, $filePath.val().lastIndexOf('\\'));
		var dirName = upper.substring(upper.lastIndexOf('\\')+1);
		var output = upper.substring(0, upper.lastIndexOf('\\')) + '\\' + dirName + '_webp\\';
	}else {
		var output = $filePath.val()+'\\';
	}
	console.log($filePath.val());
	console.log(output);

	if(!fs.existsSync(output)) {
		fs.mkdirSync(output)
	}

	for(var i=0; i<fileList.length; i++) {
		exec(cwebp + param + fileList[i] + ' -o ' + output + fileNameList[i] +'.webp');
		console.log(cwebp + param + fileList[i] + ' -o ' + output + fileNameList[i] +'.webp')
	}
});


/* 弹出文件选择框 */
function chooseFile(name) {
    var chooser = $(name);
    chooser.change(function(evt) {

		var thumbnails = $(this).val().split(';');
		$filePath.val(thumbnails[0].substring(0, thumbnails[0].lastIndexOf('\\'))+'\\');

		for(var i=0; i<thumbnails.length; i++){
			readPics(thumbnails[i]);
		}
    });
    chooser.trigger('click');
}


/* 弹出保存路径选择框 */
function chooseSavePath(name) {
	var chooser = $(name);
	chooser.change(function(evt) {
		if($(this).val() != ''){
			$filePath.val($(this).val());
		}
	});

	chooser.trigger('click');  
}

/* 循环读取图片 */
function readPics(files) {
	// 过滤掉非 .png/.jpg 的文件
	if(files.indexOf('.jpg') != -1 || files.indexOf('.png') != -1){
		if($preview.children('img').length == 0){
			$preview.empty();
		}
		$preview.append('<img class="thumbnail" src="'+files+'" />');
		fileList.push(files);
		fileNameList.push(files.slice(files.lastIndexOf('\\')+1, -4));
	}
}

/* 进度条 */
function progressStart(step, sum) {

}
function progressEnd() {

}