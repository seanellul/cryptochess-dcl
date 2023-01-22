/* It's a class that holds the data for the scale up animation */
@Component("scaleUpData")
export class ScaleUpData {
  origin: number = 0
  target: number = 1
  fraction: number = 0
}

// a system to carry out the movement
/* "This system updates the scale of entities in the scaleUpGroup group."

The system is a class that implements the ISystem interface. The ISystem interface is defined in the
engine and requires that the class have an update method. The update method is called once per frame
and is passed the time in seconds since the last frame */
export class ScaleUp implements ISystem {
  update(dt: number) {
    for (let piece of scaleUpGroup.entities) {
        let transform = piece.getComponent(Transform)
        let lerp = piece.getComponent(ScaleUpData)
        if (lerp.fraction < 1) {
          let newScale = Scalar.Lerp(lerp.origin, lerp.target, lerp.fraction)
          transform.scale.setAll(newScale)
          lerp.fraction += dt / 0.4
        }
    }
  }
}



/* It's a class that holds the data for a scale down animation */
@Component("scaleDownData")
export class ScaleDownData {
  origin: number = 1
  target: number = 0
  fraction: number = 0
}

// a system to carry out the movement
/* It's a system that updates the scale of entities in the `scaleDownGroup` group */
export class ScaleDown implements ISystem {
  update(dt: number) {
    for (let piece of scaleDownGroup.entities) {
        let transform = piece.getComponent(Transform)
        let lerp = piece.getComponent(ScaleDownData)
        if (lerp.fraction < 1) {
          let newScale = Scalar.Lerp(lerp.origin, lerp.target, lerp.fraction)
          transform.scale.setAll(newScale)
          lerp.fraction += dt / 0.4
        }
    }
  }
}

const scaleUpClass = new ScaleUp()
const scaleUpGroup = engine.getComponentGroup(ScaleUpData)

const scaleDownClass = new ScaleDown()
const scaleDownGroup = engine.getComponentGroup(ScaleDownData)

// cube.addComponent(new ScaleUpData())
// cube.getComponent(ScaleUpData).origin = 0.1
// cube.getComponent(ScaleUpData).target = 2

// // engine.addEntity(cube)

// robot.addComponent(new ScaleUpData())
// engine.addSystem(scaleUpClass)


/**
 * It adds the scaleUpClass and scaleDownClass to the engine.
 */
export function scaleSystemInit() {
    engine.addSystem(scaleUpClass)
    engine.addSystem(scaleDownClass)
}