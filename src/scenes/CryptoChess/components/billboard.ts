/**
 * Creates a video billboard that can be played and paused on click.
 * @param {string} src - The URL of the video you want to play.
 * @param {Transform} transform - The position and rotation of the billboard.
 */
export function addBillboard(src: string, transform: Transform): void {
    // Video billboard
    // Make it smaller?
    const myVideoClip = new VideoClip(src)
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
    screen.addComponent(transform)
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