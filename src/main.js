"use strict";
/*notes:
TECHNICAL
The canvas is not transformed, (0, 0) is the top left
No class properties are constant, for better or for worse

FORMATTING
𝚫variable = change in variable

classes:

class Thing {
	comment start
		ATTRIBUTES (that are meant to be used)
		attribute=type - definition -- implementation notes
		c-attributeInConstructor
		i-inheritedAttribute
		METHODS
		method(arguments) - definition -- implementation notes (not meant to be read as part of documentation)
}
*/

//constants
const STANDARD_INTERVAL = 50; //standard interval for Sprite.moveTimed() and Sprite.moveToTimed(), 20 times per second

//reusable functions
const indexLength = (array) => {
	return array.length - 1;
}
const compareBoxes = (a, b) => {
	return (a.y + a.height) - (b.y + b.height);
}
const createImage = (url) => {
	let image = new Image();
	image.src = url;
	return image;
}
const getIntegerRange = (start, end) => {
	let range = []
	for (let i = start; i <= end; i++) {
		range.push(i);
	}
	return range;
}

//classes
class Scene {
	/*
		A container for rendering sprites and collision boxes
		ATTRIBUTES
		sprites=array=Sprite - list of sprites in the scene, sorted by y top down
		collisions=array=Box
		c-width=number - the width of the scene in pixels
		c-height=number - the height size of the scene in pixels, should be sizeX
		c-background=string - image to use as background -- as url set using css attribute so it isnt cleared with the other Sprites
		METHODS
		render(context) - calls render of all sprites in array in order
		addSprite(sprite) - adds sprite to scene and sets Sprite.parent to the current scene
		removeSprite(id) - removes sprite from scene and sets Sprite.parent to undefined
		addCollision(box) - adds a box to the collisions array
		removeCollisionBox(id)
	*/
	constructor(width, height, background) {
		this.width = width;
		this.height = height;
		this.background = background;
	}

	sprites = [];
	collisions = [];

	render(context) {
		//sort sprites using compareBoxes(a, b)
		//then render sprites in order
		this.sprites.sort(compareBoxes);
		this.sprites.forEach((sprite) => {sprite.render(context)});
	}
	addSprite(sprite) {
		this.sprites[sprite.id] = sprite;
		sprite.parent = this;
	}
	removeSprite(id) {
		this.sprites[id].parent = undefined;
		delete sprites[id];
	};
	addCollision(box) {
		this.collisions[box.id] = box;
	}
}
class Box {
	/*
		A rectangle.
		ATTRIBUTES
		c-id=string - the id of the box, to be used in the associative array for collisions -- can be left undefined when not needed
		c-x=number - the x position
		c-y=number - the y position
		c-width=number = the width
		c-height=number = the height
		METHODS
		move(dx, dy) - moves sprite by dx and dy
		moveTimed(dx, dy, time, interval) move sprite by 𝚫x/interval and 𝚫y/interval over time milliseconds -- uses move with setinterval and counter
		moveTo(x, y) moves sprite to x and y -- uses move
		moveToTimed( x, y, time, interval) moves sprite to x and y by 𝚫x/interval and 𝚫y/interval over time milliseconds --uses movetimed
	*/
	constructor(id, x, y, width, height) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = width;
	}

	move(dx, dy) {
		this.x += dx;
		this.y += dy;
	}
	moveTo(x, y) {
		let dx = x - this.x;
		let dy = y - this.y;
		this.move(dx, dy);
	}
	moveTimed(dx, dy, time, dt=STANDARD_INTERVAL) {
		//n = repetitions
		let n = time / dt;
		dx = dx/n;
		dy = dy/n;
		let counter = 1;
		let loop;
		const moveLoop = async () => {
			if(counter == n) {
				clearInterval(loop);
			}
			this.move(dx, dy);
			counter++;
		}
		loop = setInterval(moveLoop, dt);
	}
	moveToTimed(x, y, time, interval) {
		let dx = x - this.x;
		let dy = x - this.y;
		this.moveTimed(dx, dy, time, interval);
	}
}
class Sprite extends Box {
	/*
		A renderable object on the screen, not called an object because thats taken
		ATTRIBUTES
		ci-id=string - the ID of the sprite, to be used in the associative array for sprites
		c-image=any canvas drawaable image - the image to be shown -- should be image stored in variable so it can be reused
		ci-x=number - the x position
		ci-y=number - the y position
		ci-width=number - width of the image -- automatically set to image width if not defined
		ci-height=number - height of the image -- automatically set to image height if not defined
		parent=Scene - parent scene, not defined until added to scene using Scene.addSprite()
		METHODS
		render(context) - renders sprite to the context at Sprite.x and Sprite.y
		i-move(dx, dy) - moves by dx and dy
		i-moveTimed(dx, dy, time, interval) moves by 𝚫x/interval and 𝚫y/interval over time milliseconds -- uses move with setinterval and counter
		i-moveTo(x, y) moves to x and y -- uses move
		i-moveToTimed(x, y, time, interval) moves to x and y by 𝚫x/interval and 𝚫y/interval over time milliseconds -- uses movetimed
	*/
	constructor(id, x, y, image, width, height) {
		if(!width) {
			width = image.width;
		}
		if (!height) {
			height = image.height;
		}
		super(id, x, y, width, height);
		this.image = image;
	}

	render(context) {
		context.drawImage(this.image, this.x, this.y, this.width, this.height);
	}
}
class SpriteSheet { //refer to external documentation for how this thing works, way too long to explain in comments
	/*
		A way of importing a spritesheet and sectioning it into groups that can be animated
		ATTRIBUTES
		c-image=image - the image object to be used
		c-frameWidth=number - the width of each frame
		c-frameHeight=number - the height of each frame
		frames=array=box - contains all frames with 0 for the first frame
		frameGroups=array=array=box - groups of frames
		currentFrame=box - the current frame shown
		currentFrameGroup=number
		currentFrameIndex=number
		METHODS
		createFrameGroup(...frames=number) - creates a framegroup from the list of frame indexes starting at 0
		createFrameGroupInRange(startFrame, endFrame) - creates a frame group from frame index startFrame to endFrame including all between
		nextFrame() - switches to the next frame in the group, returns true if ends at frame 0
		previousFrame() - switches to the previous frame in the, returns true if ends at frame 0
		toFrame(frame) - switches to the specified frame
		switchGroup(index) - switches to the specified group of frames on the spritesheet
	*/
	constructor(image, frameWidth, frameHeight) {
		this.image = image;
		let width = image.width;
		let height = image.height;
		this.frameWidth = frameWidth;
		this.frameHeight = frameHeight;
		this.frames = []
		this.frameGroups = [];
		this.currentFrameGroup = 0;
		this.currentFrameIndex = 0;
		let columns = Math.floor(width / frameWidth)
		let rows = Math.floor(height / frameHeight);
		if (!columns || !rows) {throw Error(`Image too small for specified frame height/width\nImage size: ${width}x${height}\nFrame size: ${frameWidth}x${frameHeight}`)}
		for (let i = 0; i < rows; i++) {
			for (let ii = 0; ii < columns; ii++) {
				this.frames.push(new Box(undefined, frameWidth * ii, frameHeight * i, frameWidth, frameHeight))
			}
		}
		this.currentFrame = this.frames[0];
	}
	createFrameGroup(...frames) {
		let newGroup = this.frameGroups[this.frameGroups.push([]) - 1]
		for (let frame of frames) {
			newGroup.push(this.frames[frame]);
		}
	}
	createFrameGroupInRange(start, end) {
		let newGroup = this.frameGroups[this.frameGroups.push([]) - 1]
		for (let i = start; i <= end; i++) {
			newGroup.push(this.frames[i]);
		}
	}

	toFrame(i) {
		this.currentFrameIndex = i;
		this.currentFrame = this.frameGroups[this.currentFrameGroup][this.currentFrameIndex];
	}
	switchGroup(i) {
		this.currentFrameGroup = i;
		this.toFrame(0);
	}
	nextFrame() {
		this.currentFrameIndex++;
		if (this.currentFrameIndex == this.frameGroups[this.currentFrameGroup].length) {
			this.currentFrameIndex = 0;
		}
		this.currentFrame = this.frameGroups[this.currentFrameGroup][this.currentFrameIndex];
		if (this.currentFrameIndex == 0) {
			return true;
		}
		return false;
	}
	previousFrame() {
		this.currentFrameIndex--;
		if (this.currentFrameIndex == -1) {
			this.currentFrameIndex = this.frameGroups[this.currentFrameGroup].length - 1;
		}
		this.currentFrame = this.frameGroups[this.currentFrameGroup][this.currentFrameIndex];
		if (this.currentFrameIndex == 0) {
			return true;
		}
		return false;
	}
}
class AnimatedSprite extends Sprite {
	/*
		A renderable object that supports animations, also used for players
		ATTRIBUTES
		ci-id=string - the ID of the sprite, to be used in the associative array for sprites
		c-spriteSheet=SpriteSheet - the spritesheet to be used
		ci-x=number - the x position
		ci-y=number - the y position
		ci-width=number - width of the image -- automatically set to image width if not defined
		ci-height=number - height of the image -- automatically set to image height if not defined
		i-parent=Scene - parent scene, not defined until added to scene using Scene.addSprite()
		METHODS
		render(context) - renders sprite to the context at Sprite.x and Sprite.y
		i-move(dx, dy) - moves by dx and dy
		i-moveTimed(dx, dy, time, interval) moves by 𝚫x/interval and 𝚫y/interval over time milliseconds -- uses move with setinterval and counter
		i-moveTo(x, y) moves to x and y -- uses move
		i-moveToTimed(x, y, time, interval) moves to x and y by 𝚫x/interval and 𝚫y/interval over time milliseconds -- uses movetimed
		startAnimation(reverse=bool, interval) - starts the animation, does not return This
		stopAnimation() - removes the animation timer, returns This so it an be chained with toFrame
		switchAnimation(frameGroup) - sets spritesheet frameGroup to specified number - returns This so it can be chained
		toFrame(group) - goes to frameGroup[frame, group] from spritesheet - returns This so it can be chained
		loopAnimation(reps, interval, reverse) - goes through animation the specified amount of times
	*/

	constructor(id, spriteSheet, x, y, width, height) {
		super(id, x, y, undefined, width, height);
		this.spriteSheet = spriteSheet;
	}

	render(context) {
		context.drawImage(this.spriteSheet.image, 
			this.spriteSheet.currentFrame.x, 
			this.spriteSheet.currentFrame.y, 
			this.spriteSheet.frameWidth, 
			this.spriteSheet.frameHeight, 
			this.x, 
			this.y, 
			this.width, 
			this.height
		)
	}

	//stores the interval for frameswaps
	animationInterval;
	startAnimation(reverse=false, interval=STANDARD_INTERVAL) {
		if (!reverse) {
			this.animationInterval = setInterval(() => {this.spriteSheet.nextFrame()}, interval);
		} else {
			this.animationInterval = setInterval(() => {this.spriteSheet.previousFrame()}, interval);
		}
		
	}
	stopAnimation() {
		clearInterval(this.animationInterval);
		return this;
	}
	toFrame(group) {
		if (group) {
			this.spriteSheet.switchGroup(group)
		}
		this.spriteSheet.toFrame(group);

	}
	switchAnimation(frameGroup) {
		this.spriteSheet.switchGroup(frameGroup);
		return this;
	}
	loopAnimation(reps, interval=STANDARD_INTERVAL, reverse=false) {
		let counter = 0;
		let totalFrames = reps * this.spriteSheet.currentFrameGroup.length;
		let loopInterval;
		let countFrame;
		if (!reverse) {
			countFrame = () => {
				this.spreadSheet.nextFrame();
				counter++;
				if (counter == totalFrames) {
					clearInterval(loopInterval)
				}
			}
		} else {
			countFrame = () => {
				this.spreadSheet.previousFrame();
				counter++;
				if (counter == totalFrames) {
					clearInterval(loopInterval)
				}
			}
		}
		loopInterval = setInterval(countFrame, STANDARD_INTERVAL);
	}
}

//main functions
const setCanvasBackground = (scene, canvas) => {
	canvas.style.background = "url(" + scene.background + ")";
}

let canvas = document.querySelector("#theCanvas");
let context = canvas.getContext("2d")

const renderLoop = (scene) => {
	context.clearRect(0, 0, canvas.width, canvas.height)
	scene.render(context)
	requestAnimationFrame(() => {renderLoop(scene)})
}
window.addEventListener("load", 
	() => {
		let scene = new Scene(1000, 1000, "./sample.png")
		let h = new Image();
		h.src = "./exp2.png";
		let j = new SpriteSheet(h, 64, 64)
		j.createFrameGroupInRange(0, 15);
		j.createFrameGroup(1, 13, 7);
		let x = new AnimatedSprite(1, j, 50, 50, 200, 200);
		scene.addSprite(x);
		setCanvasBackground(scene, canvas);
		renderLoop(scene);
		x.switchAnimation(1)
		console.log(x)
		x.startAnimation(false, 100)
	}
)