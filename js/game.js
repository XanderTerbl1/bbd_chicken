//Const level params
const WIDTH = 40;
const INCREMENT_SPEED = 0.025;
const TOTAL_LEVELS = 2;
const MAX_LIVES = 1;
const resetEvent = new Event('reset');
const newBestScore = new Event('newScore');
localStorage.setItem("score", 0);

//Renderer
var canvas = document.getElementById("mywebgl");
var renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//Camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(0, -15, 20);
camera.up = new THREE.Vector3(0, 0, 1);
camera.lookAt(new THREE.Vector3(0, 0, 0));

//Lights
var light = new THREE.AmbientLight(0xffffff, 0.5); //Ambient
scene.add(light);
var light2 = new THREE.PointLight(0xffffff, 0.8); //Directional
light2.position.set(0, 20, 10);
light2.castShadow = true;
light2.shadow.camera.near = 0.1;
light2.shadow.camera.far = 25;
scene.add(light2);

//Add starting and ending strips
var groundBase = addGrassStrip(0, 0, -10); //Start
var groundEndBase = addGrassStrip(0, 12, -10); //End
var topBorder = groundEndBase.position.y + 2;
function addGrassStrip(x, y, z)
{
    var baseTexture = new THREE.TextureLoader().load("images/grass.jpg");
    var basePlane = new THREE.PlaneBufferGeometry(40, 2);
    var baseMat = new THREE.MeshPhongMaterial({ color: 0x00FF00, specular: 0x050505, map: baseTexture });
    var base = new THREE.Mesh(basePlane, baseMat);
    base.position.x = x;
    base.position.y = y;
    base.position.z = z;
    base.doubleSided = true;
    base.receiveShadow = true;
    scene.add(base);
    return base;
}

//Add road
var groundRoad = addRoad(0, 6, -10)
var border = WIDTH/2;
function addRoad(x, y, z)
{
    var roadTexture = new THREE.TextureLoader().load("images/road.png");
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(1, 1);
    var roadPlane = new THREE.PlaneBufferGeometry(40, 10);
    var roadMat = new THREE.MeshPhongMaterial({ color: 0x404040, specular: 0x050505, map: roadTexture, side: THREE.DoubleSide });
    var road = new THREE.Mesh(roadPlane, roadMat);
    road.position.x = x;
    road.position.y = y;
    road.position.z = z;
    road.doubleSided = true;
    road.receiveShadow = true;
    scene.add(road);
    return roadTexture;
}

//Add bounding walls
addEdgeWall(30, 11, 0); //right
addEdgeWall(-30, 11, 0); //left
function addEdgeWall(x, y, z)
{
    var wallPlane = new THREE.BoxGeometry(20, 22, 20);
    var mat = new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x050505 });
    var wall = new THREE.Mesh(wallPlane, mat);
    wall.rotation.y = -Math.PI / 2;
    wall.position.x = x;
    wall.position.y = y;
    wall.position.z = z;
    wall.doubleSided = true;
    scene.add(wall);
}

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
loadChicken(0, 0, -10);
function loadChicken(x, y, z)
{
    var loader = new THREE.OBJLoader();

    loader.load('models/Chicken1.obj',
        function (object) {
            object.scale.set(1, 1, 1);
            object.position.set(x, y, z);
            object.rotation.x = Math.PI / 2;
            object.rotation.y = Math.PI;
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            chicken = object;
            scene.add(chicken);
        }
    );
}

// Variables to determine whether chicke is dead/alive
var hit = false;
var onFinish = false;
var gameOver = false;
var startGame = false;
var gameCompleted = false;
var run = 0;
var lives = MAX_LIVES;
var level = 1;
var levelsCompleted = 0;
var finishNum = 0;
var justFinished = false;
var placeHolders = [];
var score = 0, tempScore = 0;

// Initializes on new level reset after death
function initObjects() {
    hit = false;
    if (gameOver) {
        run = 0;
        lives = MAX_LIVES;
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
        lives = MAX_LIVES;
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

        document.dispatchEvent(resetEvent);
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

        document.dispatchEvent(resetEvent);
    }
    else {
        // yellow cars slow
        for (var y = 0; y < yellowCars.length; y++)
            scene.remove(yellowCars[y]);
        yellowCars = [];
        for (var y = 0; y < 5; y++) {
            var carMat = new THREE.MeshPhongMaterial({ specular: 0x050505, map: yellowCarTexture });
            var car = new THREE.Mesh(geometry, carMat);
            car.position.x = WIDTH/2 + 8 * y;
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
            car.position.x = WIDTH/2 + 8 * p;
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
            car.position.x = -WIDTH/2 - 15 * gf;
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
            car.position.x = WIDTH/2 + 15 * gt;
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
function handleKeys() 
{
    if (event.keyCode == 32)
        handleKeysBlock(0);
    else if (event.keyCode == 39)
        handleKeysBlock(1);
    else if (event.keyCode == 37)
        handleKeysBlock(2);
    else if (event.keyCode == 38)
        handleKeysBlock(3);
    else if (event.keyCode == 40)
        handleKeysBlock(4);
}

var pause = false;
function handleKeysBlock(keyIn)
{
    if (keyIn == 0) { // Press Space to begin game!
        initObjects();
        document.getElementById("start").style.visibility = "hidden";
        document.getElementById("gameOverText").style.visibility = "hidden";
        document.getElementById("levelCompleteText").style.visibility = "hidden";
        startGame = true;
        gameCompleted = false;
        gameOver = false;
    }
    else if (startGame && !gameOver && !gameCompleted) {
        if (keyIn == 1 && chicken.position.x + 2 < border) { // Press Right
            chicken.rotation.y = Math.PI / 2;
            chicken.position.x += 2;
            chicken.position.z = -9;
        }
        if (keyIn == 2 && chicken.position.x - 2 > -border) {  // Press Left
            chicken.rotation.y = -Math.PI / 2;
            chicken.position.x -= 2;
            chicken.position.z = -9;
        }
        if (keyIn == 3 && chicken.position.y + 2 < topBorder) { // Up
            chicken.rotation.y = Math.PI;
            chicken.position.y += 2;
            chicken.position.z = -9;
        }
        if (keyIn == 4 && chicken.position.y - 2 >= 0) { // Down
            chicken.rotation.y = 2 * Math.PI;
            chicken.position.y -= 2;
            chicken.position.z = -9;
        }
        tempScore += 1;
        pause = false;
        setTimeout(function () {
            chicken.position.z = -10;
        }, 50);
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
function findDist(x1, x2, y1, y2)
{
    return Math.sqrt(Math.pow((x1-x2), 2) +Math.pow((y1-y2), 2));
}

function findClosestDirec()
{
    var closestCar = findClosest(false);
    if(closestCar != null)
    {
        if(closestCar.position.x > chicken.position.x)
            return 1;
        else if(closestCar.position.x < chicken.position.x)
            return 2;
        else if(closestCar.position.y > chicken.position.y)
            return 3;
        else if(closestCar.position.y < chicken.position.y)
            return 4;
    }

    return -1;
}

function findClosestDist()
{
    return findClosest(true);
}

function findClosest(distanceBool)
{
    var closest = 0;
    var closestCar = null;
    //Cars
    //yellow cars
    for (var y = 0; y < yellowCars.length; y++)
    {
        if (findDist(yellowCars[y].position.x, chicken.position.x, yellowCars[y].position.y, chicken.position.y) < closest)
        {
            closest = findDist(yellowCars[y].position.x, chicken.position.x, yellowCars[y].position.y, chicken.position.y);
            closestCar = yellowCars[y];
        }
    }
    //green cars
    for (var gs = 0; gs < greenSlowCars.length; gs++)
    {
        if (findDist(greenSlowCars[gs].position.x, chicken.position.x, greenSlowCars[gs].position.y, chicken.position.y) < closest)
        {
            closest = findDist(greenSlowCars[gs].position.x, chicken.position.x, greenSlowCars[gs].position.y, chicken.position.y);
            closestCar = greenSlowCars[gs];
        }
    }
    //pink cars
    for (var p = 0; p < pinkCars.length; p++)
    {
        if (findDist(pinkCars[p].position.x, chicken.position.x, pinkCars[p].position.y, chicken.position.y) < closest)
        {
            closest = findDist(pinkCars[p].position.x, chicken.position.x, pinkCars[p].position.y, chicken.position.y);
            closestCar = pinkCars[p];
        }
    }
    //green cars
    for (var gf = 0; gf < greenFastCars.length; gf++)
    {
        if (findDist(greenFastCars[gf].position.x, chicken.position.x, greenFastCars[gf].position.y, chicken.position.y) < closest)
        {
            closest = findDist(greenFastCars[gf].position.x, chicken.position.x, greenFastCars[gf].position.y, chicken.position.y);
            closestCar = greenFastCars[gf];
        }
    }
    //grey cars
    for (var gt = 0; gt < greyCars.length; gt++) 
    {
        if (findDist(greyCars[gt].position.x, chicken.position.x, greyCars[gt].position.y, chicken.position.y) < closest)
        {
            closest = findDist(greyCars[gt].position.x, chicken.position.x, greyCars[gt].position.y, chicken.position.y);
            closestCar = greyCars[gt];
        }
    }

    if(distanceBool)
        return closest;
    return closestCar;
}

// returns true if chickenger has landed on finish spot at end, false otherwise
function landedOnFinish() {
    if (chicken.position.y == topBorder - 2) {
        justFinished = true;
        score += tempScore;

        if (level == TOTAL_LEVELS) {
            document.getElementById("levelCompleteText").innerHTML = "GAME COMPLETED!";
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
            startGame = false;

            //Handle best score
            var currScore = localStorage.getItem("score");
            console.log(currScore);
            if(currScore >= score || currScore == 0)
            {
                localStorage.setItem("score", score);
                document.dispatchEvent(newScore);
            }
        }
        // Otherwise, just show that user has completed level.
        else {
            setTimeout(function () {
                document.getElementById("levelCompleteText").style.visibility = "visible";
                document.getElementById("levelCompleteText").innerHTML = "LEVEL " + level + " COMPLETED!";
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
        tempScore = 0;
        return true;
    }
    return false;
}


// RENDERING THE SCENE
function render() {
    //requestAnimationFrame(render); 
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
//render();
setInterval(function(){requestAnimationFrame(render);}, 10);


function animatechickenDeath() {
    chicken.position.z -= 0.1;
}

function animateFinishSlot() {
    chicken.position.z -= 0.05;
}

function updateCars()
{
    if(pause == false)
    {
        hit = false;
        //Cars
        //yellow cars
        for (var y = 0; y < yellowCars.length; y++) {
            yellowCars[y].position.x -= 0.2 + INCREMENT_SPEED * levelsCompleted;
            if (yellowCars[y].position.x < -(border + normalCarLength))
                yellowCars[y].position.x = border + normalCarLength;
            if (hitsVehicle(yellowCars[y], false))
                hit = true;
        }
        //green cars
        for (var gs = 0; gs < greenSlowCars.length; gs++) {
            greenSlowCars[gs].position.x += 0.2 + INCREMENT_SPEED * levelsCompleted;
            if (greenSlowCars[gs].position.x > border + normalCarLength)
                greenSlowCars[gs].position.x = -(border + normalCarLength);
            if (hitsVehicle(greenSlowCars[gs], false))
                hit = true;
        }
        //pink cars
        for (var p = 0; p < pinkCars.length; p++) {
            pinkCars[p].position.x -= 0.3 + INCREMENT_SPEED * levelsCompleted;
            if (pinkCars[p].position.x < -(border + normalCarLength))
                pinkCars[p].position.x = border + normalCarLength;
            if (hitsVehicle(pinkCars[p], false))
                hit = true;
        }
        //green cars
        for (var gf = 0; gf < greenFastCars.length; gf++) {
            greenFastCars[gf].position.x += 0.5 + INCREMENT_SPEED * levelsCompleted;
            if (greenFastCars[gf].position.x > border + normalCarLength)
                greenFastCars[gf].position.x = -(border + normalCarLength);
            if (hitsVehicle(greenFastCars[gf], false))
                hit = true;
        }
        //grey cars
        for (var gt = 0; gt < greyCars.length; gt++) {
            greyCars[gt].position.x -= 0.5 + INCREMENT_SPEED * levelsCompleted;
            if (greyCars[gt].position.x < -(border + greyCarLength))
                greyCars[gt].position.x = border + greyCarLength;
            if (hitsVehicle(greyCars[gt], true))
                hit = true;
        }
        setTimeout(function () {
            pause = true;
        }, 150);
    }
}