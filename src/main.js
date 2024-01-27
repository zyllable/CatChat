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
		ATTRIBUTES
		attribute=type - definition -- implementation notes
		c-attributeInConstructor
		i-inheritedAttribute
		METHODS
		method(arguments) - definition -- implementation notes (not meant to be read as part of documentation)
}
*/

//constants
const STANDARD_INTERVAL = 20; //standard interval for Sprite.moveTimed() and Sprite.moveToTimed(), 50 times per second

//reusable functions
const compareBoxes = (a, b) => {
	return a.y - b.y;
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
		sprites.sort(compareBoxes);
		sprites.forEach((sprite) => {sprite.render(context)});
	}
	addSprite(sprite) {
		sprites[sprite.id] = sprite;
		sprite.parent = this;
	}
	removeSprite(id) {
		sprites[id].parent = undefined;
		delete sprites[id];
	};
	addCollision(box) {
		collisions[box.id] = box;
	}
}
class Box {
	/*
		A rectangle.
		ATTRIBUTES
		c-id=string - the id of the box, to be used in the associative array for collisions
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
		context.drawImage(this.image, x, y, width, height);
	}
}

//main functions