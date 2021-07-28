var canvas = document.getElementById("mywebgl");
var renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(0, -15, 20);
camera.up = new THREE.Vector3(0, 0, 1);
camera.lookAt(new THREE.Vector3(0, 0, 0));

//LIGHTS
var light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);
var light2 = new THREE.PointLight(0xffffff, 0.8);
light2.position.set(0, 20, 10);
light2.castShadow = true;
light2.shadow.camera.near = 0.1;
light2.shadow.camera.far = 25;
scene.add(light2);

// instantiate a loader
var loader = new THREE.TextureLoader();

//add Base ground
var baseTexture = new THREE.TextureLoader().load("images/purple-texture.jpg");
var groundBasePlane = new THREE.PlaneBufferGeometry(40, 2);
var groundBaseMat = new THREE.MeshPhongMaterial({ color: 0x8500d9, specular: 0x050505, map: baseTexture });
var groundBase = new THREE.Mesh(groundBasePlane, groundBaseMat);
groundBase.position.x = 0;
groundBase.position.y = 0;
groundBase.position.z = -10;
groundBase.doubleSided = true;
groundBase.receiveShadow = true;
scene.add(groundBase);

//add Road ground
var roadTexture = new THREE.TextureLoader().load("images/road.png");
roadTexture.wrapS = THREE.RepeatWrapping;
roadTexture.wrapT = THREE.RepeatWrapping;
roadTexture.repeat.set(1, 1);
var groundRoadPlane = new THREE.PlaneBufferGeometry(40, 10);
var groundRoadMat = new THREE.MeshPhongMaterial({ color: 0x404040, specular: 0x050505, map: roadTexture, side: THREE.DoubleSide });
var groundRoad = new THREE.Mesh(groundRoadPlane, groundRoadMat);
groundRoad.position.x = 0;
groundRoad.position.y = 6;
groundRoad.position.z = -10;
groundRoad.doubleSided = true;
groundRoad.receiveShadow = true;
scene.add(groundRoad);
var border = groundRoadPlane.parameters.width / 2;

//add 2nd Base ground
var groundEndBasePlane = new THREE.PlaneBufferGeometry(40, 2);
var groundEndBaseMat = new THREE.MeshPhongMaterial({ color: 0x8500d9, specular: 0x050505, map: baseTexture });
var groundEndBase = new THREE.Mesh(groundEndBasePlane, groundEndBaseMat);
groundEndBase.position.x = 0;
groundEndBase.position.y = 12;
groundEndBase.position.z = -10;
groundEndBase.doubleSided = true;
groundEndBase.receiveShadow = true;
scene.add(groundEndBase);

var topBorder = groundEndBase.position.y + groundBasePlane.parameters.height;

//add right wall
var rightWallPlane = new THREE.BoxGeometry(20, 22, 20);
var rightMat = new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x050505 });
var rightWall = new THREE.Mesh(rightWallPlane, rightMat);
rightWall.rotation.y = -Math.PI / 2;
rightWall.position.x = 30;
rightWall.position.y = 11;
rightWall.position.z = 0;
rightWall.doubleSided = true;
scene.add(rightWall);

//add left wall
var leftWallPane = new THREE.BoxGeometry(20, 22, 20);
var leftWallMat = new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x050505 });
var leftWall = new THREE.Mesh(leftWallPane, leftWallMat);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.x = -30;
leftWall.position.y = 11;
leftWall.position.z = 0;
leftWall.doubleSided = true;
scene.add(leftWall);

// CARS
var geometry = new THREE.BoxGeometry(1, 1, 1);
// normal cars
var yellowCars = [];
var yellowCarTexture = new THREE.TextureLoader().load("images/yellow.jpg");
var greenSlowCars = [];
var greenSlowCarTexture = new THREE.TextureLoader().load("images/greenSlow.jpg");
var pinkCars = [];
var pinkCarTexture = new THREE.TextureLoader().load("images/pink.jpg");
var greenFastCars = [];
var greenFastCarTexture = new THREE.TextureLoader().load("images/greenFast.jpg");
greenFastCarTexture.wrapS = THREE.RepeatWrapping;
greenFastCarTexture.wrapT = THREE.RepeatWrapping;
greenFastCarTexture.repeat.set(4, 2);
var normalCarLength = 1;
// grey truck
var greyCars = [];
var greyCarLength = 3;
var greyCarTexture = new THREE.TextureLoader().load("images/truck.jpg");

// chicken
var chicken;
var end, start;

// instantiate a loader
var loader = new THREE.OBJLoader();

// load a resource
loader.load(
    // resource URL
    'models/golfball_lowpoly.obj',
    // Function when resource is loaded
    function (object) {
        //object.scale.set(0.015, 0.015, 0.015);
        object.scale.set(0.75, 0.75, 0.75);
        object.position.set(0, 0, -10);
        object.rotation.x = Math.PI / 2;
        object.rotation.y = Math.PI;
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                //child.material.color.setRGB(0.24, 0.56, 0.25);
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        chicken = object;
        scene.add(chicken);
    }
);

// Variables to determine whether chicke is dead/alive

var hit = false;
var onFinish = false;
var gameOver = false;
var startGame = false;
var gameCompleted = false;
var run = 0;
var lives = 3;
var level = 1;
var levelsCompleted = 0;
var finishNum = 0;
var justFinished = false;
var placeHolders = [];
var score = 0;
var INCREMENT_SPEED = 0.025;
var TOTAL_LEVELS = 5;

// Initializes on new level reset after death
function initObjects() {
    hit = false;
    if (gameOver) {
        run = 0;
        lives = 3;
        level = 1;
        levelsCompleted = 0;
        score = 0;
        document.getElementById("start").style.visibility = "hidden";
        document.getElementById("gameOverText").style.visibility = "hidden";
        for (var i = 0; i < placeHolders.length; i++)
            scene.remove(placeHolders[i]);
        placeHolders = [];
    }
    else
        document.getElementById("life").style.visibility = "visible";
    document.getElementById("score").style.visibility = "visible";

    if (gameCompleted) {
        run = 0;
        lives = 3;
        level = 1;
        levelsCompleted = 0;
        score = 0;
        for (var i = 0; i < placeHolders.length; i++)
            scene.remove(placeHolders[i]);
        placeHolders = [];

        //Reset
        scene.remove(chicken);
        chicken.position.x = 0;
        chicken.position.y = 0;
        chicken.position.z = -10;
        chicken.rotation.y = Math.PI;
        scene.add(chicken);
        document.getElementById("level").style.visibility = "hidden";
    }
    else
        document.getElementById("level").style.visibility = "visible";

    onFinish = false;
    gameOver = false;
    document.getElementById("life").innerHTML = "LIVES: " + lives;
    document.getElementById("levelNum").innerHTML = "LEVEL " + level;
    document.getElementById("score").innerHTML = "SCORE: " + score;

    if (run != 0) {
        //Reset
        scene.remove(chicken);
        chicken.position.x = 0;
        chicken.position.y = 0;
        chicken.position.z = -10;
        chicken.rotation.y = Math.PI;
        scene.add(chicken);
        if (lives > 0 && !justFinished) { }
        else
            justFinished = false;
    }
    else {
        // yellow cars slow
        for (var y = 0; y < yellowCars.length; y++)
            scene.remove(yellowCars[y]);
        yellowCars = [];
        for (var y = 0; y < 5; y++) {
            var carMat = new THREE.MeshPhongMaterial({ specular: 0x050505, map: yellowCarTexture });
            var car = new THREE.Mesh(geometry, carMat);
            car.position.x = groundRoadPlane.parameters.width / 2 + 8 * y;
            car.position.y = 2;
            car.position.z = -9.5;
            car.castShadow = true;
            car.receiveShadow = true;
            yellowCars.push(car);
            scene.add(car);
        }

        // green slow
        for (var gs = 0; gs < greenSlowCars.length; gs++)
            scene.remove(greenSlowCars[gs]);
        greenSlowCars = [];
        for (var gs = 0; gs < 5; gs++) {
            var carMat = new THREE.MeshPhongMaterial({ specular: 0x050505, map: greenSlowCarTexture });
            var car = new THREE.Mesh(geometry, carMat);
            car.position.x = -20 - 8 * gs;
            car.position.y = 4;
            car.position.z = -9.5;
            car.castShadow = true;
            car.receiveShadow = true;
            greenSlowCars.push(car);
            scene.add(car);
        }

        // pink a bit faster
        for (var p = 0; p < pinkCars.length; p++)
            scene.remove(pinkCars[p]);
        pinkCars = [];
        for (var p = 0; p < 4; p++) {
            var carMat = new THREE.MeshPhongMaterial({ specular: 0x050505, map: pinkCarTexture });
            var car = new THREE.Mesh(geometry, carMat);
            car.position.x = groundRoadPlane.parameters.width / 2 + 8 * p;
            car.position.y = 6;
            car.position.z = -9.5;
            car.castShadow = true;
            car.receiveShadow = true;
            pinkCars.push(car);
            scene.add(car);
        }

        // green2 fastest
        for (var gf = 0; gf < greenFastCars.length; gf++)
            scene.remove(greenFastCars[gf]);
        greenFastCars = [];
        for (var gf = 0; gf < 1; gf++) {
            var carMat = new THREE.MeshPhongMaterial({ specular: 0x050505, map: greenFastCarTexture });
            var car = new THREE.Mesh(geometry, carMat);
            car.position.x = -groundRoadPlane.parameters.width / 2 - 15 * gf;
            car.position.y = 8;
            car.position.z = -9.5;
            car.castShadow = true;
            car.receiveShadow = true;
            greenFastCars.push(car);
            scene.add(car);
        }

        // grey cars slow
        for (var gt = 0; gt < greyCars.length; gt++)
            scene.remove(greyCars[gt]);
        greyCars = [];
        for (var gt = 0; gt < 2; gt++) {
            var carMat = new THREE.MeshPhongMaterial({ specular: 0x050505, map: greyCarTexture });
            var carGeo = new THREE.BoxGeometry(3, 1, 1);
            var car = new THREE.Mesh(carGeo, carMat);
            car.position.x = groundRoadPlane.parameters.width / 2 + 15 * gt;
            car.position.y = 10;
            car.position.z = -9.5;
            car.castShadow = true;
            car.receiveShadow = true;
            greyCars.push(car);
            scene.add(car);
        }
    }
}

window.onkeydown = function (e) {
    return !(e.keyCode == 32 || e.keyCode == 38 || e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 40 && e.target == document.body);
};

var currentlyPressedKeys = {};
var down = false;
document.addEventListener('keydown', function () {
    if (down) return;
    down = true;
    currentlyPressedKeys[event.keyCode] = true;
    if (!hit || gameCompleted) {
        handleKeys();
    }
}, false);

document.addEventListener('keyup', function () {
    down = false;
    currentlyPressedKeys[event.keyCode] = false;
    if (!hit) {
        chicken.position.z = -10;
    }
}, false);

// chicken movement
function handleKeys() {
    if (event.keyCode == 32) { // Press Space to begin game!
        initObjects();
        document.getElementById("start").style.visibility = "hidden";
        document.getElementById("gameOverText").style.visibility = "hidden";
        document.getElementById("levelCompleteText").style.visibility = "hidden";
        startGame = true;
        gameCompleted = false;
        gameOver = false;
        start = new Date();
    }
    else if (startGame && !gameOver && !gameCompleted) {
        if (event.keyCode == 39 && chicken.position.x + 2 < border) { // Press Right
            chicken.rotation.y = Math.PI / 2;
            chicken.position.x += 2;
            chicken.position.z = -9;
        }
        if (event.keyCode == 37 && chicken.position.x - 2 > -border) {  // Press Left
            chicken.rotation.y = -Math.PI / 2;
            chicken.position.x -= 2;
            chicken.position.z = -9;
        }
        if (event.keyCode == 38 && chicken.position.y + 2 < topBorder) { // Up
            chicken.rotation.y = Math.PI;
            chicken.position.y += 2;
            chicken.position.z = -9;
        }
        if (event.keyCode == 40 && chicken.position.y - 2 >= 0) { // Down
            chicken.rotation.y = 2 * Math.PI;
            chicken.position.y -= 2;
            chicken.position.z = -9;
        }
    }
}

// returns true if chickenger has hit vehicle, false otherwise
function hitsVehicle(vehicle, isTruck) {
    // dec is for when you have a truck since its x position is in middle
    // so need to dec one if check x bounds
    var dec = 0;
    var length = normalCarLength;
    if (isTruck) {
        length = greyCarLength
        dec = 1;
    }
    if (chicken.position.x + normalCarLength >= vehicle.position.x - dec // right edge
        && chicken.position.x <= vehicle.position.x + length - dec // left edge
        && chicken.position.y + normalCarLength >= vehicle.position.y // top edge
        && chicken.position.y <= vehicle.position.y + length - dec * 2 // bottom edge
    ) {
        return true;
    }
    return false;
}

// returns true if chickenger has landed on finish spot at end, false otherwise
function landedOnFinish() {
    if (chicken.position.y == topBorder - 2) {
        justFinished = true;
        end = new Date();
        score += Math.round(180 / ((end.getTime() - start.getTime()) / 1000) * 100);
        // Add a placeholder chicken for visual feedback that chicken was there
        // load a resource
        loader.load(
            // resource URL
            'models/golfball_lowpoly.obj',
            // Function when resource is loaded
            function (object) {
                //object.scale.set(0.025, 0.025, 0.025);
                object.scale.set(0.75, 0.75, 0.75);
                object.position.set(finishSpots[f].position.x, finishSpots[f].position.y, -10);
                object.rotation.x = Math.PI / 2;
                object.rotation.y = Math.PI;
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        //child.material.color.setRGB(0.12, 0.28, 0.125);
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                placeHolders.push(object);
                scene.add(object);
            }
        );

        if (level == TOTAL_LEVELS) {
            document.getElementById("levelCompleteText").innerHTML = "GAME COMPLETED!"
            document.getElementById("levelCompleteText").style.visibility = "visible";
            document.getElementById("levelComplete").style.visibility = "visible";
            setTimeout(function () {
                document.getElementById("level").style.visibility = "hidden";
                document.getElementById("start").style.visibility = "visible";

                for (var i = 0; i < placeHolders.length; i++) {
                    scene.remove(placeHolders[i]);
                }
                placeHolders = [];
                level++;
                levelsCompleted++;
            }, 2000);
            gameCompleted = true;
            console.log("game complete");
        }
        // Otherwise, just show that user has completed level.
        else {
            setTimeout(function () {
                document.getElementById("levelCompleteText").style.visibility = "visible";
                document.getElementById("levelCompleteText").innerHTML = "LEVEL " + level + " COMPLETED!"
                document.getElementById("levelComplete").style.visibility = "visible";

            }, 1000);
            setTimeout(function () {
                level++;
                document.getElementById("levelCompleteText").style.visibility = "hidden";
                document.getElementById("levelComplete").style.visibility = "hidden";
                document.getElementById("levelNum").innerHTML = "LEVEL " + level;
                document.getElementById("level").style.visibility = "visible";

                for (var i = 0; i < placeHolders.length; i++) {
                    scene.remove(placeHolders[i]);
                }
                placeHolders = [];
                levelsCompleted++;
            }, 2000);
        }
        start = new Date();
        return true;
    }
    return false;
}


// RENDERING THE SCENE
function render() {
    requestAnimationFrame(render);
    if (startGame) {
        if (hit && !onFinish) {
            if (chicken.position.z > -11)
                animatechickenDeath();
            else {
                run++;
                lives--;
                if (lives == 0) {
                    // if no lives left, show Game Over and Start text and hide Level
                    setTimeout(function () {
                        document.getElementById("level").style.visibility = "hidden";
                        document.getElementById("start").style.visibility = "visible";
                        document.getElementById("gameOverText").style.visibility = "visible";
                    }, 1000);
                }
                else
                    justFinished = false;
                initObjects();
            }
        }
        else if (onFinish) {
            if (chicken.position.z > -11)
                animateFinishSlot();
            else {
                run++;
                initObjects();
            }
        }
        else if (chicken.position.x > border || chicken.position.x < -border) {
            //went to border by riding log / turtles
            if (chicken.position.z > -11)
                animatechickenDeath();
            else {
                run++;
                lives--;
                if (lives == 0) {
                    setTimeout(function () {
                        document.getElementById("level").style.visibility = "hidden";
                        document.getElementById("start").style.visibility = "visible";
                        document.getElementById("gameOverText").style.visibility = "visible";
                    }, 1000);
                }
                else
                    justFinished = false;
                initObjects();
            }
        }
        else if (lives == 0)
            gameOver = true;
        else {
            updateCars();
            if (landedOnFinish())
                onFinish = true;
        }
    }
    renderer.render(scene, camera);
}
render();

function animatechickenDeath() {
    chicken.position.z -= 0.1;
}

function animateFinishSlot() {
    chicken.position.z -= 0.05;
}

function updateCars() {
    hit = false;
    //Cars
    //yellow cars
    for (var y = 0; y < yellowCars.length; y++) {
        yellowCars[y].position.x -= 0.02 + INCREMENT_SPEED * levelsCompleted;
        if (yellowCars[y].position.x < -(border + normalCarLength))
            yellowCars[y].position.x = border + normalCarLength;
        if (hitsVehicle(yellowCars[y], false))
            hit = true;
    }
    //green cars
    for (var gs = 0; gs < greenSlowCars.length; gs++) {
        greenSlowCars[gs].position.x += 0.02 + INCREMENT_SPEED * levelsCompleted;
        if (greenSlowCars[gs].position.x > border + normalCarLength)
            greenSlowCars[gs].position.x = -(border + normalCarLength);
        if (hitsVehicle(greenSlowCars[gs], false))
            hit = true;
    }
    //pink cars
    for (var p = 0; p < pinkCars.length; p++) {
        pinkCars[p].position.x -= 0.03 + INCREMENT_SPEED * levelsCompleted;
        if (pinkCars[p].position.x < -(border + normalCarLength))
            pinkCars[p].position.x = border + normalCarLength;
        if (hitsVehicle(pinkCars[p], false))
            hit = true;
    }
    //green cars
    for (var gf = 0; gf < greenFastCars.length; gf++) {
        greenFastCars[gf].position.x += 0.05 + INCREMENT_SPEED * levelsCompleted;
        if (greenFastCars[gf].position.x > border + normalCarLength)
            greenFastCars[gf].position.x = -(border + normalCarLength);
        if (hitsVehicle(greenFastCars[gf], false))
            hit = true;
    }
    //grey cars
    for (var gt = 0; gt < greyCars.length; gt++) {
        greyCars[gt].position.x -= 0.05 + INCREMENT_SPEED * levelsCompleted;
        if (greyCars[gt].position.x < -(border + greyCarLength))
            greyCars[gt].position.x = border + greyCarLength;
        if (hitsVehicle(greyCars[gt], true))
            hit = true;
    }
}