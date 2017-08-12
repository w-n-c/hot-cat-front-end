(function() {
	const editor    = ace.edit("editor");
	const modelist  = ace.require("ace/ext/modelist");
	const filepath  = "api/v0/file";
	const menuBtn   = document.getElementById("menu-button");
	const menuRoot  = document.getElementById("menu");
	let currentFile;

	const request = (method, params) => {
		return new Promise((res, rej) => {
			const xhr = new XMLHttpRequest();
			xhr.open(method, params.url, true);
			xhr.onload = () => res(JSON.parse(xhr.responseText))
			xhr.onerror = () => rej(xhr.statusText);
			if (params.data) {
				xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xhr.send(params.Data);
			} else {
				xhr.send();
			}
		});
	};
	const getData = (url) => {
		return request("GET", { url: url });
	};
	const sendData = (url, data) => {
		return request("POST", { url: url, data: data })
	};
	const saveFile = () => {
		if (currentFile) {
			sendData(currentFile, editor.getValue())
			.catch(reason => {
				console.log("Failed to post file changes: " + reason);
			});
		}
	}
	const loadFile = (event) => {
		saveFile();
		currentFile = filepath;
		// the event builds the path in direction of bubbling (inner to <html>)
		for(let i = event.path.length - 1; i >= 0; i--) {
			const el = event.path[i]
			if (el.nodeName === 'D2L-MENU') {
				if (el.getAttribute("label") === "filesystem");
				else {
					currentFile += `/${el.getAttribute("label")}`;
				}
			}
		};
		currentFile += `/${event.target.getAttribute("text")}`;
		getData(currentFile).then(file => {
			editor.setValue(file);
		}).then(() => {
			const mode = modelist.getModeForPath(currentFile).mode;
			editor.session.setMode(mode)
		}).catch(reason => {
			console.log("File loading failed: " + reason);
		});
	}
	const toggleDisplay = (el) => {
		(style => {
			style.display = style.display === 'none' ? '' : 'none';
		})(el.style);
	};
	// asynchronously building the menu and appending to dom proved to be
	// far more efficient than templating the menu in go
	const loadDirMenu = (obj, root) => {
		Object.keys(obj).forEach(key => {
			if (key === 'directories') {
				Object.keys(obj[key]).forEach(el => {
					const file = document.createElement("d2l-menu-item");
					const dir = document.createElement("d2l-menu");
					file.setAttribute('text', el);
					file.appendChild(dir);
					root.appendChild(file);
					loadDirMenu(obj[key][el], dir);
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
	
	getData("/api/v0/directory").then(directory => {
		loadDirMenu(directory, menuRoot);
	}).catch(reason => {
		console.log("Directory menu creation failed: " + reason);
	});
	setInterval(saveFile(), 10000);
	menuBtn.onclick = () => { toggleDisplay(menu) };
	menu.addEventListener('d2l-menu-item-select', (e) => { loadFile(e) });

	// shows editor keyboard shortcuts on load
	// editor.execCommand("showKeyboardShortcuts");
	editor.setTheme("ace/theme/monokai");
	editor.getSession().setMode("ace/mode/javascript");
	editor.setValue("press ctrl+alt+h for keybinds");
	editor.$blockScrolling = Infinity;
	editor.setOptions({
		enableBasicAutocompletion: true,
		enableSnippets: true,
		enableLiveAutocompletion: false
	})
	editor.commands.addCommand({
		name: "showKeyboardShortcuts",
		bindKey: {win: "Ctrl+Alt+h", mac: "Command-Alt-h"},
		exec: (editor) => {
			ace.config.loadModule("ace/ext/keybinding_menu", (module) => {
				module.init(editor);
				editor.showKeyboardShortcuts();
			})
		}
	});
})();
