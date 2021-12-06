@Component("scaleUpData")
export class ScaleUpData {
  origin: number = 0
  target: number = 1
  fraction: number = 0
}

// a system to carry out the movement
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



@Component("scaleDownData")
export class ScaleDownData {
  origin: number = 1
  target: number = 0
  fraction: number = 0
}

// a system to carry out the movement
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


export function scaleSystemInit() {
    engine.addSystem(scaleUpClass)
    engine.addSystem(scaleDownClass)
}