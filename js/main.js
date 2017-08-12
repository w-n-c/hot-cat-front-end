(function() {
	const editor    = ace.edit("editor");
	const modelist  = ace.require("ace/ext/modelist");
	const filepath  = "api/v0/file";
	const files     = document.getElementsByTagName("d2l-menu-item");
	const dirs      = document.getElementsByTagName("d2l-menu");
	const menuBtn   = document.getElementById("menu-button");
	const menuRoot  = document.getElementById("menu");
	let currentFile = filepath;

	const getData = (url) => {
		return new Promise((res, rej) => {
			const xhr = new XMLHttpRequest();
			xhr.open("GET", url, true);
			xhr.onload = () => res(JSON.parse(xhr.responseText))
			xhr.onerror = () => rej(xhr.statusText);
			xhr.send();
		});
	};
	const sendData = (url, data) => {
		return new Promise((res, rej) => {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", url, true);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.onload = () => res(true);
			xhr.onerror = () => rej(xhr.statusText);
			xhr.send(data);
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
		(style => {
			style.display = style.display === 'none' ? '' : 'none';
		})(el.style);
	};
	const changeFile = (event) => {
		if (currentFile != filepath) {
			sendData(currentFile, editor.getValue())
			.catch(reason => {
				console.log("Failed to post file changes: " + reason);
			});
		}
		currentFile = filepath;
		//event path starts at the local element and ends at html
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
		const mode = modelist.getModeForPath(currentFile).mode;
		editor.session.setMode(mode)
		getData(currentFile).then(file => {
			editor.setValue(file);
		}).catch(reason => {
			console.log("File loading failed: " + reason);
		});
	}
	menuBtn.onclick = () => { toggleDisplay(menu) };
	menu.addEventListener('d2l-menu-item-select', (e) => { changeFile(e) });

	getData("/api/v0/directory").then(directory => {
		appDirMenu(directory, menuRoot);
	}).catch(reason => {
		console.log("Directory menu creation failed: " + reason);
	});
	editor.setTheme("ace/theme/monokai");
	editor.getSession().setMode("ace/mode/javascript");
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
	// shows editor commands on load
	// editor.execCommand("showKeyboardShortcuts");
	document.getElementById("editor").style.fontSize="14px";
})();
