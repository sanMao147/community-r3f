import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { RefObject, useCallback, useRef } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export const useCameraAnimation = (controlsRef: RefObject<OrbitControlsImpl | null>) => {
  const { camera } = useThree()
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  const flyTo = useCallback(
    (
      position: [number, number, number],
      target: [number, number, number],
      duration = 1.5,
      onComplete?: () => void
    ) => {
      if (!controlsRef.current) return

      // Kill previous animation if running
      if (timelineRef.current) {
        timelineRef.current.kill()
      }

      // Disable controls during animation
      controlsRef.current.enabled = false

      const tl = gsap.timeline({
        onComplete: () => {
          if (controlsRef.current) {
            controlsRef.current.enabled = true
            // Ensure final state is set correctly
            controlsRef.current.update()
          }
          onComplete?.()
          timelineRef.current = null
        },
      })
      
      timelineRef.current = tl

      tl.to(camera.position, {
        x: position[0],
        y: position[1],
        z: position[2],
        duration,
        ease: 'power3.inOut', // Smoother ease
      })

      tl.to(
        controlsRef.current.target,
        {
          x: target[0],
          y: target[1],
          z: target[2],
          duration,
          ease: 'power3.inOut',
          onUpdate: () => {
             // Force update controls to sync with camera if needed, 
             // but usually modifying target + camera pos is enough for next frame
             controlsRef.current?.update()
          }
        },
        '<'
      )
    },
    [camera, controlsRef]
  )

  return { flyTo }
}
