const {app} = require("electron") ;
const bw = require("electron").BrowserWindow ;
const url = require("url") ;
const path = require("path") ;

app.on("ready", _=>{
	const {screen} = require("electron") ;
	const disp = screen.getPrimaryDisplay() ;
	let win = new bw({width:disp.size.width,height:disp.size.height,fullscreen:true,frame:false}) ;
	//win.webContents.openDevTools() ;
	win.loadURL(url.format({
		pathname: path.join(__dirname, "index.html"),
		protocol: "file:",
		slashes: true
	})) ;
	win.on("close", _=>app.quit()) ;
	win.setSize(disp.size.width+1, disp.size.height+1) ;
}) ;
