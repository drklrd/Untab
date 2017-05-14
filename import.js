document.addEventListener('DOMContentLoaded', () => {

	document.getElementById('importfile').addEventListener('change', (evt) => {
		var file = evt.target.files[0];
		var reader = new FileReader();
		reader.onload = onReaderLoad;
		reader.readAsText(file);

	});

	var saveNewLink = (links) => {
		chrome.storage.local.set({
			'links': links
		})
	}

	function onReaderLoad(event) {
		try {
			var importObj = JSON.parse(event.target.result);
			if(!(importObj && importObj.links)) throw "Not valid JSON";
			chrome.storage.local.get('links', (result) => {
				if (result && result.links) {
					var links = Object.assign(result.links, importObj.links);
					saveNewLink(links);
				} else {
					saveNewLink(importObj.links);

				}
				$("#success_message").css('display', 'block');
			})

		} catch (e) {
			$("#error_message").css('display', 'block');
		}

	}

});