var urls = [];


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

var saveLinks = (tag, urls) => {

	chrome.storage.local.get('links', (result) => {
		if (result && result.links) {
			if (!alreadyExists(result.links, tag)) {
				var obj = {};
				obj[tag] = urls;
				var links = Object.assign(result.links, obj);
				saveNewLink(links);
			} else {
				document.getElementById("response").innerHTML = "This tag has already been used !";
				return;
			}
		} else {
			var links = {};
			links[tag] = urls;
			saveNewLink(links);
			console.log('saveve', links)
		}
		document.getElementById("response").innerHTML = "Successfully untabbed !";
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
		var tagValue = document.getElementById('search_query').value;
		if (tagValue && tagValue.length) {
			invokeUntab();
		} else {
			document.getElementById("response").innerHTML = "Must specify tag";
		}

	});

	document.getElementById('view_untabs').addEventListener('click', () => {
		chrome.storage.local.get('links', (result) => {
			if (result && result.links && Object.keys(result.links).length) {
				var html = "";
				for (var link in result.links) {
					html = html + "<div id='tablayer_id" + link + "' class='row untab'>" + link;
					html = html + "<div class='pull-right' > <button class='btn btn-success' id='untab_id" + link + "' > Untab </button>  <button class='btn btn-warning' > <span class='glyphicon glyphicon-edit'> </span> </button>  <button class='btn btn-danger' id='delete_id" + link + "' > <span class='glyphicon glyphicon-remove'> </span> </button>  </div>  </div>";

				}
				document.getElementById("untabbed_links").innerHTML = html;
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
				document.getElementById("untabbed_links").innerHTML = "No untab(s) found";
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
	}

	function downloadJsonObj(obj) {

		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
		var dlAnchorElem = document.createElement('a');
		dlAnchorElem.setAttribute("href", dataStr);
		dlAnchorElem.setAttribute("download", new Date().getTime() + ".json");
		dlAnchorElem.click();

	}

	document.getElementById('export').addEventListener('click', () => {
		chrome.storage.local.get('links', (result) => {
			if (result && result.links) {
				var exportObj = result;
				downloadJsonObj(exportObj);
			} else {
				alert('No founn')
			}
		});
	});

	document.getElementById('import').addEventListener('click', () => {
		chrome.tabs.create({
			url: "import.html"
		});
	});

});