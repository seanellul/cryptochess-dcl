
export function initSound(path: string) {
    const entity =  new Entity()
    engine.addEntity(entity)
    entity.addComponent(
        new AudioSource(new AudioClip(path))
    )
    entity.getComponentOrCreate(Transform).position = new Vector3(8,0,8)
    return entity
}

export function spawnEntity(shape: Shape, position: Vector3, rotation?: Quaternion) {
    const entity = new Entity()
    
    entity.addComponent(new Transform({ position: position, rotation }))
    entity.addComponent(shape)
    engine.addEntity(entity)
    
    return entity
}
