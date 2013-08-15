var gui = require('nw.gui');
var win = gui.Window.get();

$('.close').click(function() {
	win.close();
})

$('.minimize').click(function() {
	win.minimize();
})

$('.cat_webp').click(function() {
	$(this).addClass('current');
	$('.cat_apng').removeClass('current');
})

$('.cat_apng').click(function() {
	$(this).addClass('current');
	$('.cat_webp').removeClass('current');
})