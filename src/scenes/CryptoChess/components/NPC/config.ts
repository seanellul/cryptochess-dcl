import { VECTOR_OFFSET } from 'offsets'

export const config = {
    hovertext: 'Talk with RoVi',
    reactDistance: 3,
    position: new Vector3(2.5, 0, 2).add(VECTOR_OFFSET),
    rotation: Quaternion.Euler(0, 180, 0)
}