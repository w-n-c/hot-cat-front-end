(function() {
	let   filepath  = "";
	const editor    = ace.edit("editor");
	const files     = document.getElementsByTagName("d2l-menu-item");
	const dirs      = document.getElementsByTagName("d2l-menu");
	const menuBtn   = document.getElementById("menu-button");
	const menuRoot  = document.getElementById("menu");

	const getData = (url) => {
		return new Promise((res, rej) => {
			const xhr = new XMLHttpRequest();
			xhr.open("GET", url, true);
			xhr.onload = () => res(JSON.parse(xhr.responseText))
			xhr.onerror = () => rej(xhr.statusText);
			xhr.send();
		});
	};
	const appDirMenu = (obj, root) => {
		Object.keys(obj).forEach(key => {
			if (key === 'directories') {
				Object.keys(obj[key]).forEach(el => {
					const file = document.createElement("d2l-menu-item");
					const dir = document.createElement("d2l-menu");
					file.setAttribute('text', el);
					file.appendChild(dir);
					root.appendChild(file);
					appDirMenu(obj[key][el], dir);
				});
			} else if (key === 'files') {
				obj[key].forEach(el => {
					const file = document.createElement("d2l-menu-item");
					file.setAttribute('text', el);
					root.appendChild(file);
				});
			} else {
				console.log("Unexpected key in directory object: " + key);
			}
		});
	};
	const toggleDisplay = (el) => {
		// causes a glitch with media query, need to update
		(style => {
			style.display = style.display === 'none' ? '' : 'none';
		})(el.style);
	};
	const managePath = (el) => {
		//used to build and track a directory string
		//on click check if name at end of string, if so remove else add`
	}
	const changeFile = (el) => {
		//editor.getValue();
		//post value
		//request new file contents
		//editor.setValue(contents)
	}
	
	menuBtn.onclick = () => { toggleDisplay(menu) };
	Array.from(dirs).forEach( el => {
		el.addEventListener('click', () => { managePath(el) });
	});
	Array.from(files).forEach( el => {
		el.addEventListener('click', () => { changeFile(el) });
	});
	getData("/api/v0/directory").then(directory => {
		appDirMenu(directory, menuRoot);
	}).catch(reason => {
		console.log("Directory menu creation failed: " + reason);
	});
	editor.setTheme("ace/theme/monokai");
	editor.getSession().setMode("ace/mode/javascript");
	document.getElementById('editor').style.fontSize='14px';
})();

