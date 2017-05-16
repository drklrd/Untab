var urls = [];
var flashRate = 3000;

var badgeCounter = (function counter() {
	chrome.storage.local.get('links', (result) => {
		document.getElementById("badge").innerHTML = result && result.links ? Object.keys(result.links).length : 0;
	});
	return counter;
})();

var saveNewLink = (links) => {
	chrome.storage.local.set({
		'links': links
	})
}

function alreadyExists(links, tag) {
	return links[tag] ? true : false;

}

function flashBanner(className){
	// $(className).css('display','block');
	$(className).show('fast');
	setTimeout(function(){
		$(className).hide('fast');
	},flashRate);
}

var saveLinks = (tag, urls) => {

	chrome.storage.local.get('links', (result) => {
		flashBanner('.response-info');
		if (result && result.links) {
			if (!alreadyExists(result.links, tag)) {
				var obj = {};
				obj[tag] = urls;
				var links = Object.assign(result.links, obj);
				saveNewLink(links);
			} else {
				$('.response-info').addClass('alert-danger');
				$('#response').html("<span class='glyphicon glyphicon-info-sign'></span> This tag has already been used !");
				// document.getElementById("response").innerHTML = "This tag has already been used !";
				return;
			}
		}else{
			var links = {};
			links[tag] = urls;
			saveNewLink(links);
			console.log('saveve', links)
		}
		$('.response-info').addClass('alert-success');
		$('#response').html("<span class='glyphicon glyphicon-ok-sign'></span> Successfully untabbed !");
		// document.getElementById("response").innerHTML = "Successfully untabbed !";
		document.getElementById('search_query').value = "";
		badgeCounter();

	})
}

var opentabs = (urls) => {

	if (urls && urls.length) {
		console.log('URKKKS', urls)
		urls.forEach(function(url) {
			chrome.tabs.create({
				url: url
			});
		})
	}
}

document.addEventListener('DOMContentLoaded', () => {

	document.getElementById('search_query').focus();

	function invokeUntab() {
		chrome.windows.getAll({
			populate: true
		}, function(windows) {
			windows.forEach(function(window) {
				window.tabs.forEach(function(tab) {
					urls.push(tab.url);
				});
			});
		});
		saveLinks(document.getElementById('search_query').value, urls);
	}

	document.getElementById('save_links').addEventListener('click', () => {

		$('.response-info').removeClass('alert-danger');
		$('.response-info').removeClass('alert-success');
		var tagValue = document.getElementById('search_query').value;
		if (tagValue && tagValue.length) {
			invokeUntab();
		} else {
			flashBanner('.response-info');
			$('.response-info').addClass('alert-danger');
			$('#response').html("<span class='glyphicon glyphicon-info-sign'></span> You must specify a tag !");
			// document.getElementById("response").innerHTML = "Must specify tag";
		}

	});
	document.getElementById('view_untabs').addEventListener('click', () => {
		chrome.storage.local.get('links', (result) => {
			if (result && result.links && Object.keys(result.links).length) {
				var html = "";
				for (var link in result.links) {

					html = html + 
									'<div class="panel-group"> \
									 <div class="panel panel-default">\
									 <div class="panel-heading">\
									 <h4 class="panel-title">'
									  

					html = html + "<div  id='tablayer_id" + link + "' class='row untab'>" + link;
					html = html + "<div class='pull-right' > <button class='btn btn-success' id='untab_id" + link + "' > Untab </button>  <a data-toggle='collapse' href='#collapse1'> <button class='btn btn-warning' > <span class='glyphicon glyphicon-edit'> </span> </button> </a> <button class='btn btn-danger' id='delete_id" + link + "' > <span class='glyphicon glyphicon-remove'> </span> </button>  </div>  </div>";
					html = html + '</h4></div>';
					html = html + 	'<div id="collapse1" class="panel-collapse collapse">\
								      <div class="panel-body">'+getIndividualUntabs(result.links,link)+'</div>\
								    </div>\
								  </div>\
								</div>';

				}

				document.getElementById("untabbed_links").innerHTML = html;
				result.links[link].forEach(function(untab,index){
					document.getElementById('eachuntab_' + index).addEventListener('click', () => {
						$("#eachuntab_"+index).css('display', 'none');
						result.links[link].splice(index,1);
						updateUntabs(result.links);
					});
				});
				for (let link in result.links) {
					document.getElementById('untab_id' + link).addEventListener('click', () => {
						opentabs(result.links[link]);
					});
					document.getElementById('delete_id' + link).addEventListener('click', () => {
						$("#tablayer_id" + link).css('display', 'none');
						delete result.links[link];
						updateUntabs(result.links);
					});
				}
			} else {
				document.getElementById("untabbed_links").innerHTML = '\
						<div class="row">\
				  			<div class="alert alert-danger">\
				  				<span class="glyphicon glyphicon-info-sign"> </span>  \
				  			  	<strong> No Untab(s) found. Well, its time you add some. </strong> \
				  			</div>\
				  		</div>';
			}

		})
	});

	document.getElementsByName('searchForm')[0].onsubmit = function(evt) {
		evt.preventDefault();
	}

	function updateUntabs(untabs) {
		chrome.storage.local.set({
			'links': untabs
		});
		badgeCounter();
		if(!Object.keys(untabs).length){
			document.getElementById("untabbed_links").innerHTML = '\
					<div class="row">\
			  			<div class="alert alert-danger">\
			  				<span class="glyphicon glyphicon-info-sign"> </span>  \
			  			  	<strong> No Untab(s) found. Well, its time you add some. </strong> \
			  			</div>\
			  		</div>';
		}
	}

	function downloadJsonObj(obj,fileName) {

		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
		var dlAnchorElem = document.createElement('a');
		dlAnchorElem.setAttribute("href", dataStr);
		dlAnchorElem.setAttribute("download", fileName + ".json");
		dlAnchorElem.click();

	}

	document.getElementById('export').addEventListener('click', () => {
		$('.export-info').removeClass('alert-danger');
		$('.export-info').removeClass('alert-success');
		chrome.storage.local.get('links', (result) => {
			flashBanner('.export-info');
			if (result && result.links && Object.keys(result.links).length) {
				var exportObj = result;
				var fileName = new Date().getTime();
				downloadJsonObj(exportObj,fileName);
				$('.export-info').addClass('alert-success');
				$('#export_info_text').html ("<span class='glyphicon glyphicon-ok-sign'></span> File Successfully exported as "+fileName+".json");
			} else {
				$('.export-info').addClass('alert-danger');
				$('#export_info_text').html("<span class='glyphicon glyphicon-info-sign'></span> No Untab links to export");
			}
		});
	});

	document.getElementById('import').addEventListener('click', () => {
		chrome.tabs.create({
			url: "import.html"
		});
	});

	function getIndividualUntabs(allTabs,link){

		var listTemplate = "";
		if(allTabs[link] && allTabs[link].length){
			listTemplate = listTemplate + '<ul>';
			allTabs[link].forEach(function(untab,index){
				listTemplate = listTemplate + 
					"<li class='truncate eachuntab' > \
						<button class='btn btn-danger' id='eachuntab_"+index+"' > <span class='glyphicon glyphicon-remove'></span> </button> \
						<a href='"+untab+"' target='blank'>" 
							+ untab + 
						"</a></li>";

				
			})
			listTemplate = listTemplate + '</ul>';
		}
		return listTemplate;

	}

});