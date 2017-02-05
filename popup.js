var urls = [];

var saveNewLink = (links) => {
	chrome.storage.local.set({
		'links': links
	})
}

var saveLinks = (tag, urls) => {

	chrome.storage.local.get('links', (result) => {

		if (result && result.links) {
			var obj = {};
			obj[tag] = urls;
			var links = Object.assign(result.links, obj);
			saveNewLink(links);

		} else {
			var links = {};
			links[tag] = urls;
			saveNewLink(links);
		}

		document.getElementById("response").innerHTML = "Successfully untabbed !";

	})
}

var opentabs = (urls) => {
	if (urls && urls.length) {
		urls.forEach(function(url) {
			chrome.tabs.create({
				url: url
			});
		})
	}
}

document.addEventListener('DOMContentLoaded', () => {

	

	document.getElementById('save_links').addEventListener('click', () => {
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
	});



	document.getElementById('view_untabs').addEventListener('click', () => {
		chrome.storage.local.get('links', (result) => {

			if (result && result.links) {
				var html = "";
				for (var link in result.links) {
					html = html + "<div class='row untab'>" +   link ;
					html = html + "<div class='pull-right'> <button class='btn btn-warning' id='untab_id" + link + "' > Untab </button> </div>  </div>";
					document.getElementById("untabbed_links").innerHTML = html;
					document.getElementById('untab_id' + link).addEventListener('click', () => {
						opentabs(result.links[link]);
					});
				}

				// document.getElementById("favorites").innerHTML = result.favorites.join("<br>");


			} else {
				document.getElementById("untabbed_links").innerHTML = "No untabs found";
			}


		})
	});

});