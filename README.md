# Moon_lander_3d
### Moon lander game but in 3d

### What is this
This is a simple 3d game made in **webgl**, **typescript** and **nothing else** (without libraries).
It consist of a little spaceship placed in a procedurally generated moon-like world, needing to protect a rover from the asteroids.
### How to run
**The game is online**, but if you want to run it locally, execute:
```bash
git clone https://github.com/fantasyAlgo/Moon_lander_3d.git
cd Moon-lander_3d
python3 -m http.server // live-server works too.
```
### Features
Here's a list of the features present
- Procedurally generated terrain (3d perlin noise) with an optimized chunk system
- GJK Collision detection for polygon-polygon and polygon-terrain
- Particle system optimized using webgl instancing (essentially every particle is drawn using a single draw call)
- Rover (car) implementation using a mixture of a spring solver for the terrain and simple contraint solver for keeping it a proper rectangle. The model is drawn using an orthogonal matrix to keep the model coherent to the points (it was a mess making it work).
- Convex hull implementation for the procedurally generated asteroids (it was another mess lol).
- Obj object loader
- Bullet system
- A simple Math library that implements Quaternions, a non-performant recursive algorithm to calcuate determinants, and all the math i needed to make this game.

There are lots of features i want to add btw, here's a short list in order of priority
- biomes
- Alien spaceships
- An actually animated and real rover
- Moon-like trees
Feel free to request stuff!

### How to play
- Use SPACE to go in the direction the spaceship is facing
- Use WASD to change the direction
- Press left-click to shot a bullet
- Press right-click to aim
- Press E to toggle the default stabilizer 

The 'goal' of the game is to protect the rover (and yourself) as much as you can

Good luck!


