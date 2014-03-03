$(document).ready(function(){
	var link = $("a:contains('Find a Home')")[0];
	var url = link.href;
	console.log(url);
	location.href = url;
});