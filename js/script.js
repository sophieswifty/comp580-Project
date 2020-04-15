
////////////////////////////////////////////////////////////////////////////////
// VARIABLES
////////////////////////////////////////////////////////////////////////////////

// WEBSPEECH API VARIABLES
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var recognition = new SpeechRecognition();
var lastResultIndex = -1;

//webspeech setup
recognition.continuous = true;
recognition.lang = 'en_US';
recognition.interimResults = true;
recognition.onresult = OnVoiceRecognition;
recognition.onend = function() {console.log("Starting recognition again!"); recognition.start();}

function resetVoiceRecognition() {
    document.getElementById('command-text').className = '';
    recognition.stop();
    recognition.start();
}

// GAME VARIABLES
var game = new Phaser.Game(700, 700, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render:render });

var player;
var monsters;
var platforms;
var cursors;
var animationRunning = false;
var freezeStones;
var monsterFreezeCount = 0;

var steps = 0;
var winText;

var explosion;
var boom_sfx;
var bonk_sfx;
var freeze_sfx;
var monster_move_sfx;
var soldier_move_sfx;
var yes_commander;
var music;
var fanfare_sfx;

var thunder_sfx;
var electric;
var gas_sfx;
var gas;

var SCALE = 3;
// High score
var highScore = [100, 101, 102];


var soldierNames = ['red', 'green', 'blue'];
var monsterNames = ['black', 'purple', 'orange'];
var monsterColors = [0x404040, 0xf0f000, 0xf050a0];  // Used for tinting
var monsterColors2 = {
	black: 0x404040,
	yellow: 0xf0f000,
	orange: 0xf050a0
}; // Used for tinting back from freeze

// MAPS
var step = {
	left: {x:-100, y:0},
	right: {x:100, y:0},
	up: {x:0, y:-100},
	down:{x:0, y:100}//,
	// up_left: {x:-100, y:-100},
	// up_right: {x:100, y:-100},
	// down_left: {x:-100, y:100},
	// down_right:{x:100, y:100}
}

var directionMap = {
	north: 'up',
	app: 'up',
	south: 'down',
	east: 'right',
	west: 'left'
};

var algorithms = [
  function(x1, y1, x2, y2) {return Math.abs(x2-x1) + Math.abs(y2-y1);},
  function(x1, y1, x2, y2) {return Math.pow((x2-x1),2) +Math.pow((y2-y1),2);},
  function(x1, y1, x2, y2) {return Math.sqrt(Math.pow((x2-x1),2) +Math.pow((y2-y1),2));}
]

////////////////////////////////////////////////////////////////////////////////
// DOM initialization
////////////////////////////////////////////////////////////////////////////////
window.onload = function() {
	if(localStorage.hs) {
		loadHighScore();
	} else {
		localStorage.hs = JSON.stringify(highScore);
		loadHighScore();
	}
}


function loadHighScore() {
	highScore = JSON.parse(localStorage.hs);
	console.log('highScore:', highScore);

	var highScoreList = document.getElementById('high-score');
	for(var score of highScore) {
		var newLi = document.createElement('li');
		newLi.innerHTML = score;
		highScoreList.appendChild(newLi);
	}
}

function saveHighScore() {
	if(localStorage.hs) {
		for(var i = 0; i < highScore.length; i++) {
			if(steps < highScore[i]) {
				highScore.splice(i, 0, steps);
				console.log('highScore changed',highScore);
				highScore.pop();
				localStorage.hs = JSON.stringify(highScore);
				break;
			}
		}
	} else {
		console.log('highScore not saved');
		// Do nothing
	}

	var highScoreList = document.getElementById('high-score');
	highScoreList.innerHTML = ''
	for(var score of highScore) {
		var newLi = document.createElement('li');
		newLi.innerHTML = score;
		highScoreList.appendChild(newLi);
	}
}


////////////////////////////////////////////////////////////////////////////////
// Initialization
////////////////////////////////////////////////////////////////////////////////

function preload() {

	game.time.advancedTiming = true;

	// Disable smoothing
	game.stage.smoothed = false;
	//Cessmap background. Each square is 100px.
	game.load.image('chessmap', 'assets/chessmap.png');

	// Create soldiers
	for(var color of soldierNames)
		game.load.spritesheet('soldier_'+color, 'assets/soldier_'+color+'.png', 28, 28);

	for(var color of monsterNames)
		game.load.spritesheet('monster_'+color, 'assets/monster_'+color+'.png', 28, 28);


	game.load.spritesheet('freezeStone', 'assets/freezeball_spritesheet.png', 28, 28);
	game.load.spritesheet('explosion', 'assets/explosion.png', 32,32);
	game.load.audio('boom_sfx', 'assets/SFX/Explosion.wav');
	game.load.audio('bonk_sfx', 'assets/SFX/Bonk.wav');
	game.load.audio('space_music', ['assets/SFX/Space.mp3', 'assets/SFX/Space.ogg']);
	game.load.audio('yes_commander', ['assets/SFX/yes_commander.mp3', 'assets/SFX/yes_commander.ogg']);
	game.load.audio('freeze_sfx', 'assets/SFX/freeze.wav');
	game.load.audio('monster_move_sfx', 'assets/SFX/monster_move.wav');
	game.load.audio('soldier_move_sfx', 'assets/SFX/soldier_move.wav');
	game.load.audio('fanfare_sfx', ['assets/SFX/fanfare.mp3', 'assets/SFX/fanfare.ogg']);
  game.load.spritesheet('electric', 'assets/electric.png', 32,32);
  game.load.spritesheet('gas', 'assets/gas.png', 64,64);
  game.load.audio('gas_sfx', 'assets/SFX/gas.ogg');
  game.load.audio('thunder_sfx', 'assets/SFX/thunder.ogg');
}


function create() {

	// New create stuff
	boom_sfx = game.add.audio('boom_sfx');
	boom_sfx.allowMultiple = true;
	boom_sfx.volume = .35;

	gas_sfx = game.add.audio('gas_sfx');
	gas_sfx.allowMultiple = true;
	gas_sfx.volume = .35;

	thunder_sfx = game.add.audio('thunder_sfx');
	thunder_sfx.allowMultiple = true;
	thunder_sfx.volume = .35;

	bonk_sfx = game.add.audio('bonk_sfx');
	bonk_sfx.allowMultiple = true;

	freeze_sfx = game.add.audio('freeze_sfx');
	freeze_sfx.allowMultiple = true;
	freeze_sfx.volume = .35;

	monster_move_sfx = game.add.audio('monster_move_sfx');
	monster_move_sfx.allowMultiple = true;
	monster_move_sfx.volume = .1;

	soldier_move_sfx = game.add.audio('soldier_move_sfx');
	soldier_move_sfx.allowMultiple = true;
	soldier_move_sfx.volume = .1;

	yes_commander = game.add.audio('yes_commander');

	fanfare_sfx = game.add.audio('fanfare_sfx');
	fanfare_sfx.volume = .5;

	music = game.add.audio('space_music');
	music.volume = .15;
	music.loop = true;
	music.play();

	//  A simple background for our game
	game.add.sprite(0, 0, 'chessmap');

	//Create sprites and animations
	createMonsters();
	createSoldiers();
	createFreezeStone();
	createExplosion();
  createElectricity();
  createGas();

	// Text
	winText = game.add.text(game.world.width/2, game.world.height/2, 'YOU WON!', { font: '60px "Press Start 2P"', fill: "#ff0"});
	winText.anchor.set(0.5);
	winText.visible = false;

	// Camera shake plugin
	game.plugins.cameraShake = game.plugins.add(Phaser.Plugin.CameraShake);

	// Set default selected player
	selectPlayer('blue');

	// Element with amount of moves
	document.getElementById('step-number').innerHTML = steps;

	//  Create our controls.
	configureKeys();

	// Start speech recognition
	recognition.start();
}

function configureKeys() {
	// Define keys
	var key_ONE = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
	var key_TWO = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
	var key_THREE = game.input.keyboard.addKey(Phaser.Keyboard.THREE);
	var key_W = game.input.keyboard.addKey(Phaser.Keyboard.W);
	var key_A = game.input.keyboard.addKey(Phaser.Keyboard.A);
	var key_S = game.input.keyboard.addKey(Phaser.Keyboard.S);
	var key_D = game.input.keyboard.addKey(Phaser.Keyboard.D);
	var key_ESC = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
	var key_V = game.input.keyboard.addKey(Phaser.Keyboard.V);
	var key_E = game.input.keyboard.addKey(Phaser.Keyboard.E);
	var cursors = game.input.keyboard.createCursorKeys();

	// Add callbacks to keys
	// selection keys
	key_ONE.onDown.add(function(){selectPlayer('red')}, this );
	key_TWO.onDown.add(function(){selectPlayer('green')}, this );
	key_THREE.onDown.add(function(){selectPlayer('blue')}, this );
	// movement keys
	key_W.onDown.add(function(){playerWalk('up')}, this );
	key_A.onDown.add(function(){playerWalk('left')}, this );
	key_S.onDown.add(function(){playerWalk('down')}, this );
	key_D.onDown.add(function(){playerWalk('right')}, this );
	cursors.up.onDown.add(function(){playerWalk('up')}, this );
	cursors.left.onDown.add(function(){playerWalk('left')}, this );
	cursors.down.onDown.add(function(){playerWalk('down')}, this );
	cursors.right.onDown.add(function(){playerWalk('right')}, this );

	// reset key
	key_ESC.onDown.add(reset, this);
	// reset voice recognition
	key_V.onDown.add(resetVoiceRecognition, this);
	// Use freeze
	key_E.onDown.add(function(){freezeMonsters(2)}, this);

}

////////////////////////////////////////////////////////////////////////////////
// METHODS
////////////////////////////////////////////////////////////////////////////////

// Gets frames numbers for a row from a spritesheet.
function row(row, col){return _.range(col*row, col*row+col);}

// Creates a new set of soldiers
function createSoldiers() {

	//Create soldier group
	soldiers = game.add.group();

	var positions = [[150,650], [350,650], [550,650]];

	//Add soldiers to group. Set anchor to middle so that character can be flipped without movement.
	for (var i = 0; i < soldierNames.length; i++) {
		var x = positions[i][0]; //250 + i*100;
		var y = positions[i][1]; //650;
		var soldier = soldiers.create(x, y, 'soldier_'+soldierNames[i]);
		soldier.anchor.setTo(.5, .5);
		soldier.scale.setTo(SCALE);
		soldier.type = 'soldier';
		soldier.newX = x;
		soldier.newY = y;
		//Add animations to group
		soldier.animations.add('walk_down', row(0, 4), 10, true);
		soldier.animations.add('walk_up', row(1, 4), 10, true);
		soldier.animations.add('walk_left', row(2, 4), 10, true);
		soldier.animations.add('walk_right', row(2, 4), 10, true);
	}

	animationRunning = false;
}

// Creates a new set of monsters
function createMonsters() {

	//Create monster group
	monsters = game.add.group();

	var positions = [[50,150], [150,450], [550,350]];

	//Add monsters to group
	for (var i = 0; i < 3; i++) {
		var x = positions[i][0]; //450 + i*100;
		var y = positions[i][1]; //550;
		var monster = monsters.create(x, y, 'monster_'+monsterNames[i]);
		monster.anchor.setTo(.5, .5);
		monster.scale.setTo(SCALE);
		monster.name = monsterNames[i];
		monster.type = 'monster';
		monster.newX = x;
		monster.newY = y;
		monster.animations.add('idle', row(0, 4), 5, true);
		monster.animations.add('walk', row(1, 4), 5, true);
		monster.play('idle');
    monster.distanceAlgorithm = algorithms[i];
	}
}

function createFreezeStone() {
	//Create freeze stone
	freezeStones = game.add.group();
	freezeStones.enableBody = true;

	var x = 350; //+ (Math.round(Math.random()*3) + 1)*100;
	var y = 150; //+ (Math.round(Math.random()*3) + 1)*-100;
	console.log(x,y);
	var freezeStone = freezeStones.create(x, y, 'freezeStone');
	freezeStone.anchor.setTo(.5, .5);
	freezeStone.scale.setTo(SCALE);

	freezeStones.callAll('animations.add', 'animations', 'burn', row(0, 5), 10, true);
	freezeStones.callAll('play', null, 'burn');
}

function createExplosion() {
	explosion = game.add.sprite(0, 0, 'explosion');
	explosion.visible = false;
	explosion.anchor.setTo(.5, .5);
	explosion.scale.setTo(SCALE);
	explosion.animations.add('boom');
	explosion.events.onAnimationComplete.add(function(){explosion.visible = false;},this);
}

function createElectricity() {
  electric = game.add.sprite(0, 0, 'electric');
  electric.visible = false;
  electric.anchor.setTo(.5, .5);
  electric.scale.setTo(SCALE);
  electric.animations.add('electricity');
  electric.animations.getAnimation('electricity').delay = 100;
  electric.events.onAnimationComplete.add(function(){electric.visible = false;},this);
}

function createGas() {
  gas = game.add.sprite(0, 0, 'gas');
  gas.visible = false;
  gas.anchor.setTo(.5, .5);
  gas.scale.setTo(SCALE*0.45);
  gas.animations.add('gascloud');
  gas.animations.getAnimation('gascloud').delay = 100;
  gas.events.onAnimationComplete.add(function(){gas.visible = false;},this);
}

function walk(character, direction) {
	var x = step[direction].x;
	var y = step[direction].y;

	//Calculate new position
	var newX = character.x + x;
	var newY = character.y + y;

	//Create a transition to the new location
	if(notOutside(newX, newY) ) {
		if( !soldierCollision(newX, newY) ) {
			character.newX = newX;
			character.newY = newY;

      if(character.type === 'soldier') character.animations.play('walk_'+direction, 10, true);

      if(character.type === 'monster') character.animations.play('walk', 10, true);

			animationRunning = true;
			// console.log(character.key+' is moving')
			tween = this.game.add.tween(character).to({x:newX, y:newY}, 800, null, true);
			tween.onComplete.addOnce(stopWalking, this);
		}
	}

}

function stopWalking(character) {
	//Stop walking animations
	character.scale.setTo(SCALE,SCALE); //Unmirror character
	player.animations.stop();
	character.frame = 0;

	if(character.type == 'soldier') {
		var monster = monsterCollision(character);
		if( monster != null ) {
			monster.destroy();
      switch (character.key){
        case 'soldier_blue':
        electricity(character.x,character.y);
        break;

        case 'soldier_red':
        explode(character.x, character.y);
        break;

        case 'soldier_green':
        gasCloud(character.x, character.y);
        break;
      }
		}
	}else{
    character.animations.play('idle');
  }

	animationRunning = false;
	winCheck();
	// console.log(character.key+' is idle');
}

// Special function for getting the player to walk
function playerWalk(direction){
	if(animationRunning) return; // Do nothing if an animation is still going
	//Calculate new position
	var newX = player.x + step[direction].x;
	var newY = player.y + step[direction].y;

	var shake = false;
	//Create a transition to the new location
	if( notOutside(newX, newY) ) {
		if( !soldierCollision(newX, newY) ) {
			if(step[direction].x ==100) player.scale.setTo(-SCALE,SCALE); //mirror character

			player.newX = newX;
			player.newY = newY;

			walk(player, direction);
			console.log(player.key, player.x, player.y);
			if (monsterFreezeCount == 0) {
				monsterAction();
				for (monster of monsters.children) {
					monster.tint = 0xFFFFFF;
				}
			} else if (monsterFreezeCount > 0) {
				monsterFreezeCount--
			}
			if(!winText.visible){
				updateScore();
			}

			soldier_move_sfx.play();

		} else {
			shake = true;
			bonk_sfx.play();
		}
	} else {
		shake = true;
		bonk_sfx.play();
	}

	if(shake) {
		switch(direction){
			case 'up': game.plugins.cameraShake.shake(5, 0, -1, .1); break;
			case 'down': game.plugins.cameraShake.shake(5, 0, 1, .1); break;
			case 'left': game.plugins.cameraShake.shake(5, -1, 0, .1); break;
			case 'right': game.plugins.cameraShake.shake(5, 1, 0, .1); break;
		}
	}
}

function walkToward(character, targetColor) {

	if(character.type == 'monster') {
		var target = player;
	} else {
		if(animationRunning) return; // Do nothing if an animation is still going
		var target = monsters.iterate('name', targetColor, Phaser.Group.RETURN_CHILD);
	}

	// If no target found: return
	if(!target) {
		return;
	}

	var characterXPos = character.position.x;
	var characterYPos = character.position.y;

	var targetXPos = target.position.x;
	var targetYPos = target.position.y;

	if ( Math.abs(targetXPos - characterXPos) <= Math.abs(targetYPos - characterYPos) ) {
		if (targetYPos > characterYPos) {
			if(character.type == 'soldier') playerWalk('down');
			else walk(character, 'down');
		} else {
			if(character.type == 'soldier') playerWalk('up');
			else walk(character, 'up');
		}
	} else if ( Math.abs(targetXPos - characterXPos) > Math.abs(targetYPos - characterYPos) ) {
		if (targetXPos > characterXPos) {
			if(character.type == 'soldier') playerWalk('right');
			else walk(character, 'right');
		} else {
			if(character.type == 'soldier') playerWalk('left');
			else walk(character, 'left');
		}
	}
}

function monsterAction() {
	for (var monster of monsters.children) {
		// Determine the position of the closest soldier
		var x, y;
		var minDistance = 999;

    var calcDist = monster.distanceAlgorithm;

		for (var soldier of soldiers.children) {
			var distance = calcDist(monster.x, monster.y, soldier.newX, soldier.newY);
			if(distance < minDistance) {
				minDistance = distance;
				// console.log('minDistance', minDistance);
				x = soldier.newX;
				y = soldier.newY;
			}
		}

		// There is a maximum of 4 directions a monster can move.
		// Determine which one maximizes distance.
		var maxDistance = 0;
		var rightMove = 'up';
		for (var move in step) {
			if (step.hasOwnProperty(move)) {
				newX = monster.x + step[move].x;
				newY = monster.y + step[move].y;
				// console.log(monster.name, i);
				if( notOutside(newX, newY) && !monsterIsAt(newX, newY) ) {
					var distance = calcDist(x, y, newX, newY);
					if(distance > maxDistance) {
						maxDistance = distance;
						rightMove =  move;
					}
				}
			}
		}
		if(monsters.children.length > 0) {
			monster_move_sfx.play();
		}
		walk(monster, rightMove);
	}
}

		// var moves = [
		// 	[100, 0, 'right'],
		// 	[-100, 0, 'left'],
		// 	[0, 100, 'down'],
		// 	[0, -100, 'up']
		// ];
		// var index = 0;
		// for (var i = 0; i < moves.length; i++) {
		//
		// 	newX = monster.x + moves[i][0];
		// 	newY = monster.y + moves[i][1];
		// 	// console.log(monster.name, i);
		// 	if( notOutside(newX, newY) && !monsterIsAt(newX, newY) ) {
		//
		// 		var distance = calcDist(x, y, newX, newY);
		// 		if(distance > maxDistance) {
		// 			maxDistance = distance;
		// 			index = i;
		// 		}
		//
		// 	}
		//
		// }
		// console.log('monster move direction:',moves[index][2]);
		// walk(monster, moves[index][2]);
	// }



	// var randomMon = monsters.getRandom();
	// console.log(randomMon);
	// walkToward(randomMon, player);
// }

function notOutside(x, y) {
	return (x < game.world.width && x > 0 && y < game.world.height && y > 0);
}

function soldierCollision(newX, newY) {
	for (soldier of soldiers.children) {
		if(soldier.x == newX && soldier.y == newY) return true;
	}
	//If here then there is no collision
	return false;
}

function monsterCollision(character) {
	for (monster of monsters.children) {
		if(monster.newX == character.x && monster.newY == character.y) {
			return monster;
		}
	}
	//If here then there is no collision
	return null;
}

function monsterIsAt(x, y) {
	for (var monster of monsters.children) {
		if(monster.newX == x && monster.newY == y) {
			// console.log(monster.name, 'monsterIsAt', x, y);
			return true;
		}
	}
	return false;
}

function selectPlayer(color){
	if(animationRunning) return; // Do nothing if an animation is still going
	player = soldiers.iterate('key','soldier_'+color, Phaser.Group.RETURN_CHILD);
	var selectedPlayerDiv = document.getElementById('selected-player');
	selectedPlayerDiv.className = 'selected-'+color;
	selectedPlayerDiv.innerHTML = color;
}

function freezeMonsters(numTurns) {
	for (freezeStone of freezeStones.children) {
		if (player.x == freezeStone.x && player.y == freezeStone.y) {
			console.log("Activated");
			freezeStone.destroy();
			monsterFreezeCount = numTurns;
			for (monster of monsters.children) {
				monster.tint = 0x55a0ff;
			}
			freeze_sfx.play();
			game.plugins.cameraShake.shake(10, .5, -1, .3);
		}
	}
}

function explode(x,y){
	explosion.x = x;
	explosion.y = y;
	explosion.visible = true;
	explosion.play('boom');
	boom_sfx.play();
	game.plugins.cameraShake.shake(20, -1, 1, .6);
}

function electricity(x,y){
     electric.x = x;
     electric.y = y;
     electric.visible = true;
     electric.play('electricity');
     thunder_sfx.play();
}

function gasCloud(x,y){
     gas.x = x;
     gas.y = y;
     gas.visible = true;
     gas.play('gascloud');
     gas_sfx.play();
}

function updateScore() {
	steps++;
	console.log("updateScore",steps);
	document.getElementById('step-number').innerHTML = steps;
}

function reset() {
	monsters.destroy();
	soldiers.destroy();
	freezeStones.destroy();
	if(winText.visible) {
		winText.visible = false;
	}

	animationRunning = false;

    lastResultIndex = -1;
    monsterFreezeCount = 0;
    steps = 0;
    document.getElementById('step-number').innerHTML = steps;

	createMonsters();
	createSoldiers();
	createFreezeStone();

	selectPlayer('red');
	resetVoiceRecognition();
}

function winCheck() {
	if(monsters.children.length == 0 && !winText.visible) {
		winText.visible = true;
		winText.bringToTop();
		fanfare_sfx.play();
		//saveHighScore();
	}
}

////////////////////////////////////////////////////////////////////////////////
// CALLBACKS
////////////////////////////////////////////////////////////////////////////////

// Gets called when something is said in the microphone.
function OnVoiceRecognition(event) {

    // Check that we have not acted on this input before
    if(event.resultIndex != lastResultIndex) {

        // var speechInput = '';
        // var final_transcript = '';

        // Put all results into a single string
        // for (var i = event.resultIndex; i < event.results.length; ++i) {
        //     if (event.results[i].isFinal) {
        //         final_transcript += event.results[i][0].transcript;
        //     } else {
        //         speechInput = event.results[i][0].transcript.toLowerCase();
        //     }
        // }

        var speechInput = event.results[event.results.length-1][0].transcript.toLowerCase();
        console.log(speechInput);

        document.getElementById('command-text').innerHTML = speechInput;

        var match = '';
        if(animationRunning) return; // Do nothing if an animation is still going


        // SELECTION COMMANDS
        if ( match  = speechInput.match('(red|green|blue)') ) {
            selectPlayer(match[0]);
        }

        // MOVEMENT COMMANDS
        if ( match = speechInput.match('(up|left|right|down|app|north|south|east|west)') ) {
            if( dirMatch = directionMap[match[0]] ) {
                playerWalk(dirMatch);
            } else {
                playerWalk(match[0]);
            }
            if(steps%4 === 0) {
                yes_commander.play();
            }

            lastResultIndex = event.resultIndex;
            console.log(lastResultIndex);
        } else if ( match = speechInput.match('(black|yellow|orange)') ) {
            walkToward(player, match[0]);
            if(steps%4 === 0) {
                yes_commander.play();
            }

            lastResultIndex = event.resultIndex;
            console.log(lastResultIndex);
        } else if ( match = speechInput.match('(activate|freeze)') ) {
            freezeMonsters(2);

            lastResultIndex = event.resultIndex;
            console.log(lastResultIndex);
        }

        // RESTART COMMANDS
        if ( match  = speechInput.match('(restart|reset)') ) {
            reset();
        }

    } else {
        // If input is final display that we are waiting for next command
        if(event.results[event.results.length-1].isFinal) {
            document.getElementById('command-text').innerHTML = 'Awaiting command...';
            document.getElementById('command-text').className = '';
        // Else tell the user to wait
        } else {
            document.getElementById('command-text').innerHTML = 'Wait a moment...';
            document.getElementById('command-text').className = 'error';
        }
    }


}

//Gets called every frame
function update() {
	// Empty right now
}

function render() {
	// game.debug.text(game.time.fps || '--', 300, 300, "#f00");
}
