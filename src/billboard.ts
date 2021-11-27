export function addBillboard(): void {
    // Video billboard
    // Make it smaller?
    const myVideoClip = new VideoClip(
        "videos/bladerunner540.mp4"
    )
    const myVideoTexture = new VideoTexture(myVideoClip)
    const myMaterial = new Material()
    myMaterial.albedoColor = new Color3(1.5, 1.5, 1.5)
    myMaterial.albedoTexture = myVideoTexture
    myMaterial.roughness = 1
    myMaterial.specularIntensity = 1
    myMaterial.metallic = 0
    const screen = new Entity()
    let p = new PlaneShape()
    p.withCollisions = false
    screen.addComponent(p)
    screen.addComponent(
    new Transform({
        position: new Vector3(8, 3, 15.9),
        scale: new Vector3(16, 7, 1),
        rotation: new Quaternion(0, 180, 0, 0)
    })
    )
    screen.addComponent(myMaterial)
    screen.addComponent(
    new OnPointerDown(() => {
        myVideoTexture.playing = !myVideoTexture.playing
    })
    )
    if (screen.hasComponent(OnPointerDown))
    screen.removeComponent(OnPointerDown)
    engine.addEntity(screen)
    myVideoTexture.loop = true
    myVideoTexture.play()
}