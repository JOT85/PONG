const canvasDef = 0.2 ;

if (!("setImmediate" in window)) {
	window.setImmediate = (func, ...args) => setTimeout(func, 0, ...args) ;
}
let hrtime ;
if ("process" in window) {
	hrtime = process.hrtime ;
} else {
	hrtime = prev => {
		//Dont bother with decimal due to how it is used.
		if (!prev) {
			return [Date.now() / 1000, 0] ;
		} else {
			return [Date.now() / 1000 - prev[0], 0] ;
		}
	} ;
}

function getRecomendedEasy() {
	return {
		bspeed: 450,
		bacceleration: 0,
		bradius: 10,
		bshape: 0,
		bhitbox: 1,
		bscale: true,
		
		wlimit: 1,
		wmaxscore: 11,
		wwinby: 2,
		wwidth: 1366,
		wheight: 768,
		wquality:false,
		wscale: true,
		
		p1speed: 500,
		p1height: 150,
		p1width: 14,
		p1margin: 20,
		p1scale: true,
		
		p2speed: 500,
		p2height: 150,
		p2width: 14,
		p2margin: 20,
		p2scale: true,
		
		swidth: 1366,
		sheight: 768
	} ;
}

function getRecomendedNormal() {
	return {
		bspeed: 537,
		bacceleration: 9,
		bradius: 10,
		bshape: 1,
		bhitbox: 0.7,
		bscale: true,
		
		wlimit: 1,
		wmaxscore: 11,
		wwinby: 2,
		wwidth: 1366,
		wheight: 768,
		wquality:false,
		wscale: true,
		
		p1speed: 500,
		p1height: 120,
		p1width: 10,
		p1margin: 20,
		p1scale: true,
		
		p2speed: 500,
		p2height: 120,
		p2width: 10,
		p2margin: 20,
		p2scale: true,
		
		swidth: 1366,
		sheight: 768
	} ;
}

function getRecomendedHard() {
	return {
		bspeed: 580,
		bacceleration: 12,
		bradius: 6,
		bshape: 1,
		bhitbox: 0.7,
		bscale: true,
		
		wlimit: 1,
		wmaxscore: 21,
		wwinby: 2,
		wwidth: 1366,
		wheight: 768,
		wquality:false,
		wscale: true,
		
		p1speed: 515,
		p1height: 60,
		p1width: 8,
		p1margin: 50,
		p1scale: true,
		
		p2speed: 515,
		p2height: 60,
		p2width: 8,
		p2margin: 50,
		p2scale: true,
		
		swidth: 1366,
		sheight: 768
	} ;
}

function getRecomendedExtreme() {
	return {
		bspeed: 620,
		bacceleration: 16,
		bradius: 5,
		bshape: 1,
		bhitbox: 0.7,
		bscale: true,
		
		wlimit: 1,
		wmaxscore: 21,
		wwinby: 6,
		wwidth: 1366,
		wheight: 768,
		wquality:false,
		wscale: true,
		
		p1speed: 510,
		p1height: 45,
		p1width: 5,
		p1margin: 55,
		p1scale: true,
		
		p2speed: 510,
		p2height: 45,
		p2width: 5,
		p2margin: 55,
		p2scale: true,
		
		swidth: 1366,
		sheight: 768
	} ;
}

let getCustom, writeCustom ;
if ("require" in window) {
	getCustom = which => JSON.parse(require("fs").readFileSync(`custom${which}.pong`).toString()) ;
	writeCustom = which => {
		require("fs").writeFileSync(`custom${which}.pong`, JSON.stringify(currentSettings)) ;
		checkKeys(_=>currentPanel[0](4+which, true)) ;
	} ;
	const check = which => {
		if (!require("fs").existsSync(`custom${which}.pong`)) {
			require("fs").writeFileSync(`custom${which}.pong`, JSON.stringify(getRecomendedNormal())) ;
		}
	} ;
	check(1) ;
	check(2) ;
	check(3) ;
} else {
	getCustom = which => JSON.parse(localStorage["PONG-C" + which]) ;
	writeCustom = which => {
		localStorage["PONG-C" + which] = JSON.stringify(currentSettings) ;
		checkKeys(_=>currentPanel[0](4+which, true)) ;
	} ;
	const check = which => {
		if (!localStorage["PONG-C" + which]) {
			localStorage["PONG-C" + which] = JSON.stringify(getRecomendedNormal()) ;
		}
	} ;
	check(1) ;
	check(2) ;
	check(3) ;
}

window.controls = {
	leftPadUp: false,
	leftPadDown: false,
	rightPadUp: false,
	rightPadDown: false,
	esc: false
} ;

function goWithClass(b, p1, p2, gW=window.innerWidth, gH=window.innerHeight, rH, rW, maxScore, winBy, renderPriority) {

	inSettings++ ;
	const thisTickProcess = inSettings ;

	const container = document.getElementById("pongContainer") ;
	const leftPad = document.getElementById("leftPad") ;
	const rightPad = document.getElementById("rightPad") ;
	const ball = document.getElementById("ball") ;
	//const canvas = document.getElementById("mainCanvas") ;
	//const draw = canvas.getContext("2d") ;
	const midLine = document.getElementById("midLine") ;
	const score1 = document.getElementById("score1") ;
	const score2 = document.getElementById("score2") ;
	const winner = document.getElementById("winner") ;
	const optsDiv = document.getElementById("optsDiv") ;

	let lastTick ;
	let player1score = 0 ;
	let player2score = 0 ;
	
	let thisPad = true ;
	let lastBallRender = new Array(2) ;
	let lastPad1Render = 0 ;
	let lastPad2Render = 0 ;

	function initRender() {
		winner.style.display = "none" ;
		optsDiv.style.display = "none" ;
		//canvas.width = rW ;
		//canvas.style.width = gW ;
		//canvas.height = rH ;
		//canvas.style.height = gH ;
		container.style.width = gW ;
		container.style.height = gH ;
		leftPad.style.height = p1.height ;
		rightPad.style.height = p2.height ;
		leftPad.style.left = p1.margin - p1.width / 2 ;
		rightPad.style.right = p2.margin - p1.width / 2 ;
		leftPad.style.width = p1.width ;
		rightPad.style.width = p2.width ;
		ball.style.width = b.radius * 2 ;
		ball.style.height = b.radius * 2 ;
		ball.style.borderRadius = b.shape + "px" ;
		ball.style.top = -1 * b.radius ;
		ball.style.left = -1 * b.radius ;
		container.style.display = "block" ;
	}

	function render() {
		let rendered = 0 ;
		let bRender = [b.pos[0], b.pos[1]] ;
		if (bRender !== lastBallRender) {
			ball.style.transform = `translate(${bRender[0]}px,${bRender[1]}px)` ;
			lastBallRender = bRender ;
			rendered++ ;
		}
		if (renderPriority) {
			if (thisPad) {
				let p1Render = p1.pos ;
				if (p1Render !== lastPad1Render) {
					leftPad.style.transform = `translateY(${p1Render}px)` ;
					lastPad1Render = p1Render ;
					rendered++ ;
				}
			} else {
				let p2Render = p2.pos ;
				if (p2Render !== lastPad2Render) {
					rightPad.style.transform = `translateY(${p2Render}px)` ;
					lastPad2Render = p2Render ;
					rendered++ ;
				}
			}
			if (rendered < 2) {
				if (!thisPad) {
					let p1Render = p1.pos ;
					if (p1Render !== lastPad1Render) {
						leftPad.style.transform = `translateY(${p1Render}px)` ;
						lastPad1Render = p1Render ;
					}
				} else {
					let p2Render = p2.pos ;
					if (p2Render !== lastPad2Render) {
						rightPad.style.transform = `translateY(${p2Render}px)` ;
						lastPad2Render = p2Render ;
					}
				}
			}
		} else {
			let p1Render = p1.pos ;
			if (p1Render !== lastPad1Render) {
				leftPad.style.transform = `translateY(${p1Render}px)` ;
				lastPad1Render = p1Render ;
			}
			let p2Render = p2.pos ;
			if (p2Render !== lastPad2Render) {
				rightPad.style.transform = `translateY(${p2Render}px)` ;
				lastPad2Render = p2Render ;
			}
		}
		/*draw.fillStyle = "#fff" ;
		draw.fillRect(p1.margin/gW*rW, p1.pos/gH*rH, p1.width/gW*rW, p1.height/gH*rH) ;
		draw.fillRect((gW - p2.margin - p2.width)/gW*rW, p2.pos/gH*rH, p2.width/gW*rW, p2.height/gH*rH) ;
		draw.beginPath() ;
		draw.moveTo(b.pos[0]/gW*rW, b.pos[1]/gH*rH) ;
		draw.arc(b.pos[0]/gW*rW, b.pos[1]/gH*rH, b.radius/gH*rH, 0, 2*Math.PI, false) ;
		draw.fill() ;
		draw.closePath() ;*/
	}

	function crender() {
		return ;
		draw.fillStyle = "#000" ;
		draw.fillRect(p1.margin/gW*rW - 1, p1.pos/gH*rH - 1, p1.width/gW*rW + 2, p1.height/gH*rH + 2) ;
		draw.fillRect((gW - p2.margin - p2.width)/gW*rW - 1, p2.pos/gH*rH - 1, p2.width/gW*rW + 2, p2.height/gH*rH + 2) ;
		draw.beginPath() ;
		draw.moveTo(b.pos[0]/gW*rW, b.pos[1]/gH*rH) ;
		draw.arc(b.pos[0]/gW*rW, b.pos[1]/gH*rH, b.radius/gH*rH + 1, 0, 2*Math.PI, false) ;
		draw.fill() ;
		draw.closePath() ;
	}

	function renderScore() {
		score1.innerText = player1score ;
		score2.innerText = player2score ;
	}

	function moveBall(time) {
		b.speed += time * b.acceleration ;
		const dist = time * b.speed ;
		const origPos0 = b.pos[0] ;
		const origPos1 = b.pos[1] ;
		b.pos[0] += (dist * Math.cos(b.angle)) * b.direction[0] ;
		b.pos[1] += (dist * Math.sin(b.angle)) * b.direction[1] ;
		return [Math.abs(b.pos[0] - origPos0), Math.abs(b.pos[1] - origPos1)] ;
	}

	function movePads(time) {
		const dist = time * p1.speed ;
		if (controls.leftPadUp && !controls.leftPadDown) {
			p1.pos = Math.max(p1.pos - dist, 0) ;
		} else if (!controls.leftPadUp && controls.leftPadDown) {
			p1.pos = Math.min(p1.pos + dist, gH - p1.height) ;
		}
		if (controls.rightPadUp && !controls.rightPadDown) {
			p2.pos = Math.max(p2.pos - dist, 0) ;
		} else if (!controls.rightPadUp && controls.rightPadDown) {
			p2.pos = Math.min(p2.pos + dist, gH - p2.height) ;
		}
	}

	function tick() {
		if (thisTickProcess !== inSettings) {
			return ;
		} else if (controls.esc) {
			loadSettings(_=>currentSettings) ;
			return ;
		}
		thisPad = !thisPad ;
		crender() ;
		const thisTick = hrtime(lastTick) ;
		const time = thisTick[0] + thisTick[1] * 1e-9 ;
		lastTick = hrtime() ;
		const distGone = moveBall(time) ;
		movePads(time) ;

		//Top/bottom check
		if (b.pos[1] - b.radius <= 0) {
			b.direction[1] = 1 ;
		} else if (b.pos[1] + b.radius >= gH) {
			b.direction[1] = -1 ;
		}
		//Pad hit check
		if (b.pos[0] - b.radius <= p1.margin && b.pos[0] + distGone[0] >= p1.margin && b.pos[1] + b.hitbox * b.radius >= p1.pos && b.pos[1] - b.hitbox * b.radius <= p1.pos + p1.height) {
			b.angle = (b.pos[1] - p1.pos - p1.height / 2) / p1.height * 1.5
			if (b.angle < 0) {
				b.angle *= -1 ;
				b.direction[1] = -1 ;
			} else {
				b.direction[1] = 1 ;
			}
			b.direction[0] = 1 ;
			b.pos[0] = p1.margin + b.radius ;
		} else if (b.pos[0] + b.radius >= gW - p2.margin && b.pos[0] - distGone[0] <= gW - p2.margin && b.pos[1] + b.hitbox * b.radius >= p2.pos && b.pos[1] - b.hitbox * b.radius <= p2.pos + p2.height) {
			b.angle = (b.pos[1] - p2.pos - p2.height / 2) / p2.height * 1.5
			if (b.angle < 0) {
				b.angle *= -1 ;
				b.direction[1] = -1 ;
			} else {
				b.direction[1] = 1 ;
			}
			b.direction[0] = -1 ;
			b.pos[0] = gW - p2.margin - b.radius ;
		}
		//else, goal check
		else if (b.pos[0] <= 0 || b.pos[0] >= gW) {
			b.direction[0] *= -1 ;
			b.angle = 0 ;
			b.speed = b.startSpeed ;
			if (b.pos[0] <= 0) {
				player2score++ ;
			} else {
				player1score++ ;
			}
			if (player1score >= maxScore && player1score - player2score >= winBy) {
				//Player 1 wins
				renderScore() ;
				winner.innerText = "Player 1 Wins!" ;
				winner.style.display = "block" ;
				setTimeout(_=>loadSettings(_=>currentSettings), 3000) ;
				return ;
			} else if (player2score >= maxScore && player2score - player1score >= winBy) {
				//Player 2 wins
				renderScore() ;
				winner.innerText = "Player 2 Wins!" ;
				winner.style.display = "block" ;
				setTimeout(_=>loadSettings(_=>currentSettings), 3000) ;
				return ;
			}
			renderScore() ;
			b.pos = [b.defaultPosition[0],b.defaultPosition[1]] ;
		}
		render() ;
		requestAnimationFrame(tick) ;
	}

	initRender() ;
	requestAnimationFrame(_=>{
		b.pos = [b.defaultPosition[0],b.defaultPosition[1]] ;
		p1.pos = gH / 2 - p1.height / 2 ;
		p2.pos = gH / 2 - p2.height / 2 ;
		render() ;
		renderScore() ;
		setTimeout(_=>{
			lastTick = hrtime() ;
			tick() ;
		},3000) ;
	}) ;

}

class Ball {
	constructor(radius=1, speed=1, acceleration=0, hitbox=1, shape=NaN, defaultPosition=[], angle=0, direction=[1,1]) {
		this.radius = radius ;
		this.startSpeed = speed ;
		this.speed = speed ;
		this.acceleration = acceleration ;
		this.angle = angle ;
		this.direction = direction ;
		this.defaultPosition = defaultPosition ;
		this.hitbox = hitbox ;
		this.shape = shape ;
		if (isNaN(this.shape)) {
			this.shape = radius ;
		}
		if (this.defaultPosition.length !== 2) {
			this.defaultPosition = [window.innerWidth/2, window.innerHeight/2] ;
		}
		this.pos = [this.defaultPosition[0],this.defaultPosition[1]] ;
	}
}

class Pad {
	constructor(margin, width, height, speed) {
		this.margin = margin ;
		this.width = width ;
		this.height = height ;
		this.speed = speed ;
		this.pos = 0 ;
	}
}

function roundTo(num, acc) {
	return Math.round(num/acc)*acc ;
}

const settingsP = {
	modeeasy:[3,"mode-easy",_=>loadSettings(getRecomendedEasy)],
	modenorm:[3,"mode-norm",_=>loadSettings(getRecomendedNormal)],
	modeclassic:[3,"mode-classic",_=>alert("CLASSIC!")],
	modehard:[3,"mode-hard",_=>loadSettings(getRecomendedHard)],
	modeextreme:[3,"mode-extreme",_=>loadSettings(getRecomendedExtreme)],
	modec1:[3,"mode-c1",_=>loadSettings(_=>getCustom(1))],
	modec2:[3,"mode-c2",_=>loadSettings(_=>getCustom(2))],
	modec3:[3,"mode-c3",_=>loadSettings(_=>getCustom(3))],
	
	go:[3,"GO-button",_=>go()],
	
	bspeed:[2,2,"ball-speed",1],
	bacceleration:[2,0.25,"ball-acceleration",0],
	bradius:[2,0.5,"ball-radius",1],
	bshape:[1,"shape-square","shape-circle"],
	bhitbox:[2,0.05,"ball-hitbox",0,1],
	bscale:[0,"ball-scale"],
	
	wlimit:[1,"limit-no","limit-yes"],
	wmaxscore:[2,1,"max-score",0],
	wwinby:[2,1,"win-by",0],
	wwidth:[2,1,"game-width",1],
	wheight:[2,1,"game-height",1],
	wquality:[0, "world-quality"],
	wscale:[0,"world-scale"],
	
	p1speed:[2,2,"pad1-speed",1],
	p1height:[2,1,"pad1-height",1],
	p1width:[2,1,"pad1-width",1],
	p1margin:[2,1,"pad1-offset",1],
	p1scale:[0,"pad1-scale"],
	p1c2:[3,"p1c2",_=>loadSettings(_=>{
		const newSettings = new Object() ;
		Object.assign(newSettings, currentSettings) ;
		newSettings.p1speed = newSettings.p2speed ;
		newSettings.p1height = newSettings.p2height ;
		newSettings.p1width = newSettings.p2width ;
		newSettings.p1margin = newSettings.p2margin ;
		newSettings.p1scale = newSettings.p2scale ;
		return newSettings ;
	})],
	
	p2speed:[2,2,"pad2-speed",1],
	p2height:[2,1,"pad2-height",1],
	p2width:[2,1,"pad2-width",1],
	p2margin:[2,1,"pad2-offset",1],
	p2scale:[0,"pad2-scale"],
	p2c1:[3,"p2c1",_=>loadSettings(_=>{
		const newSettings = new Object() ;
		Object.assign(newSettings, currentSettings) ;
		newSettings.p2speed = newSettings.p1speed ;
		newSettings.p2height = newSettings.p1height ;
		newSettings.p2width = newSettings.p1width ;
		newSettings.p2margin = newSettings.p1margin ;
		newSettings.p2scale = newSettings.p1scale ;
		return newSettings ;
	})],
	
	swidth:[2,1,"scale-width",1],
	sheight:[2,1,"scale-height",1],
	srescale:[3,"rescale-but",_=>{
		alert("lol") ;
	}],
	ssetscale:[3,"setscale-but",_=>{
		let theseSettings = new Object() ;
		Object.assign(theseSettings, currentSettings) ;
		theseSettings.swidth = window.innerWidth ;
		theseSettings.sheight = window.innerHeight ;
		loadSettings(_=>theseSettings) ;
	}],
	
	sc1:[3,"sc1-but",_=>writeCustom(1)],
	sc2:[3,"sc2-but",_=>writeCustom(2)],
	sc3:[3,"sc3-but",_=>writeCustom(3)]
} ;

let settings = {} ;

function writeNumberInput(val, acc, id, min=-Infinity, max=Infinity) {
	if (val > max) {
		val = max ;
	} else if (val < min) {
		val = min ;
	}
	val = roundTo(val, acc) ;
	document.getElementById(id).value = val.toFixed(2) ;
	return val ;
}

function writeMultiInput(val, ...opts) {
	if (val >= opts.length) {
		val -= opts.length ;
	} else if (val < 0) {
		val += opts.length ;
	}
	for (let doing = 0 ; doing < opts.length ; doing++) {
		if (doing !== val) {
			document.getElementById(opts[doing]).classList.remove("op-selected") ;
		} else {
			document.getElementById(opts[doing]).classList.add("op-selected") ;
		}
	}
	return val ;
}

function writeSelection(val, id) {
	document.getElementById(id).classList[val?"add":"remove"]("ss") ;
}

function highlight(val, opt) {
	let id ;
	if (opt[0] === 0 || opt[0] === 3) {
		id = opt[1] ;
	} else if (opt[0] === 2) {
		id = opt[2] ;
	} else {
		for (let doing = 1 ; doing < opt.length ; doing++) {
			document.getElementById(opt[doing]).classList[val?"add":"remove"]("highlighted") ;
		}
		return ;
	}
	document.getElementById(id).classList[val?"add":"remove"]("highlighted") ;
}

let inSettings = 0 ;
let lastPressed = 0 ;
function controlCheckTick(move, val, iAm) {
	if (inSettings !== iAm) {
		return ;
	}
	if (Date.now() - lastPressed < 200) {
		if (!(!controls.leftPadDown && !controls.leftPadUp && !controls.rightPadDown && !controls.rightPadUp && !controls.esc)) {
			setImmediate(_=>controlCheckTick(move, val, iAm)) ;
			return ;
		}
		lastPressed = 0 ;
	}
	if (controls.leftPadDown) {
		move(1) ;
	} else if (controls.leftPadUp) {
		move(-1) ;
	} else if (controls.rightPadDown) {
		val(-1) ;
	} else if (controls.rightPadUp) {
		val(1) ;
	} else if (controls.esc) {
		if (currentPanel[3]() === 8) {
			window.close() ;
			return ;
		}
		move(8, true) ;
	} else {
		setImmediate(_=>controlCheckTick(move, val, iAm)) ;
		return ;
	}
	lastPressed = Date.now() ;
	setImmediate(_=>controlCheckTick(move, val, iAm)) ;
}

function setUpMenu(panel, ob) {
	let opts = Object.keys(panel) ;
	let currentOption = 8 ;
	for (let opt in opts) {
		let tp = panel[opts[opt]] ;
		let ts = ob[opts[opt]] ;
		if (tp[0] === 2) {
			writeNumberInput(ts, ...tp.slice(1,tp.length)) ;
		} else if (tp[0] === 1) {
			writeMultiInput(ts, ...tp.slice(1,tp.length)) ;
		} else if (tp[0] === 0) {
			writeSelection(ts, ...tp.slice(1,tp.length)) ;
		} 
	}
	let moveOption = (move, moveTo=false) => {
		highlight(false, panel[opts[currentOption]]) ;
		if (!moveTo) {
			currentOption += move ;
		} else {
			currentOption = move ;
		}
		if (currentOption < 0) {
			currentOption += opts.length ;
		} else if (currentOption >= opts.length) {
			currentOption -= opts.length ;
		}
		highlight(true, panel[opts[currentOption]]) ;
	} ;
	highlight(true, panel[opts[currentOption]]) ;
	let moveValue = move => {
		let tp = panel[opts[currentOption]] ;
		if (tp[0] === 0) {
			ob[opts[currentOption]] = !ob[opts[currentOption]] ;
			writeSelection(ob[opts[currentOption]], ...tp.slice(1,tp.length))
		} else if (tp[0] === 1) {
			ob[opts[currentOption]] += move ;
			ob[opts[currentOption]] = writeMultiInput(ob[opts[currentOption]], ...tp.slice(1,tp.length)) ;
		} else if (tp[0] === 2) {
			ob[opts[currentOption]] += move * tp[1] ;
			ob[opts[currentOption]] = writeNumberInput(ob[opts[currentOption]], ...tp.slice(1,tp.length)) ;
		} else if (tp[0] === 3) {
			tp[2]() ;
		}
	} ;
	return [moveOption, moveValue, _=>{
		highlight(false, panel[opts[currentOption]]) ;
	}, _=>currentOption] ;
}

let currentPanel ;
let currentSettings ;
function loadSettings(genFunc) {
	document.getElementById("pongContainer").style.display = "none" ;
	document.getElementById("optsDiv").style.display = "flex" ;
	if (currentPanel) {
		currentPanel[2]() ;
	}
	currentSettings = genFunc() ;
	currentPanel = setUpMenu(settingsP, currentSettings) ;
	inSettings++ ;
	checkKeys(_=>controlCheckTick(currentPanel[0], currentPanel[1], inSettings)) ;
}

const checkKeys = (cb, final=false) => {
	if (!controls.leftPadDown && !controls.leftPadUp && !controls.rightPadDown && !controls.rightPadUp && !controls.esc) {
		if (final) {
			cb() ;
		} else {
			setTimeout(_=>checkKeys(cb, true), 50) ;
		}
	} else {
		setTimeout(_=>checkKeys(cb, false), 50) ;
	}
} ;

function go() {
	let pad1, pad2, theBall, gD ;
	if (!currentSettings.wscale) {
		gD = [currentSettings.wwidth, currentSettings.wheight, currentSettings.wwidth*currentSettings.wquality, currentSettings.wheight*currentSettings.wquality] ;
	} else {
		gD = [currentSettings.wwidth/currentSettings.swidth*window.innerWidth, currentSettings.wheight/currentSettings.sheight*window.innerHeight, currentSettings.wwidth/currentSettings.swidth*window.innerWidth*currentSettings.wquality, currentSettings.wheight/currentSettings.sheight*window.innerHeight*currentSettings.wquality] ;
	}
	if (!currentSettings.bscale) {
		theBall = new Ball(currentSettings.bradius, currentSettings.bspeed, currentSettings.bacceleration, currentSettings.bhitbox, currentSettings.shape*currentSettings.bradius, [gD[0]/2, gD[1]/2]) ;
	} else {
		theBall = new Ball(	currentSettings.bradius/currentSettings.sheight*window.innerHeight,
							currentSettings.bspeed/currentSettings.swidth*window.innerWidth,
							currentSettings.bacceleration/currentSettings.swidth*window.innerWidth,
							currentSettings.bhitbox/currentSettings.sheight*window.innerHeight,
							currentSettings.bshape*(currentSettings.bradius/currentSettings.sheight*window.innerHeight),
							[gD[0]/2, gD[1]/2]
							) ;
	}
	if (!currentSettings.p1scale) {
		pad1 = new Pad(currentSettings.p1margin, currentSettings.p1width, currentSettings.p1height, currentSettings.p1speed) ;
	} else {
		pad1 = new Pad(	currentSettings.p1margin/currentSettings.sheight*window.innerHeight,
						currentSettings.p1width/currentSettings.swidth*window.innerWidth,
						currentSettings.p1height/currentSettings.sheight*window.innerHeight,
						currentSettings.p1speed/currentSettings.sheight*window.innerHeight
						) ;
	}
	if (!currentSettings.p2scale) {
		pad2 = new Pad(currentSettings.p2margin, currentSettings.p2width, currentSettings.p2height, currentSettings.p2speed) ;
	} else {
		pad2 = new Pad(	currentSettings.p2margin/currentSettings.sheight*window.innerHeight,
						currentSettings.p2width/currentSettings.swidth*window.innerWidth,
						currentSettings.p2height/currentSettings.sheight*window.innerHeight,
						currentSettings.p2speed/currentSettings.sheight*window.innerHeight
						) ;
	}
	if (currentSettings.wlimit) {
		goWithClass(theBall, pad1, pad2, gD[0], gD[1], gD[2], gD[3], currentSettings.wmaxscore, currentSettings.wwinby, currentSettings.wquality) ;
	} else {
		goWithClass(theBall, pad1, pad2, gD[0], gD[1], gD[2], gD[3], Infinity, Infinity, currentSettings.wquality) ;
	}
}

function start() {
	document.getElementById("splash").style.display = "none" ;
	document.getElementById("controls").style.display = "none" ;
	if (!("require" in window)) {
		if (document.body.requestFullscreen) {
			document.body.requestFullscreen() ;
		} else if (document.body.webkitRequestFullscreen) {
			document.body.webkitRequestFullscreen() ;
		} else if (document.body.mozRequestFullScreen) {
			document.body.mozRequestFullScreen() ;
		}
	}
	loadSettings(getRecomendedNormal) ;
}
