import { Loader } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { Suspense } from 'react'
import { Experience } from './components/canvas/Experience'
import { Overlay } from './components/ui/Overlay'

function App() {
  return (
    <>
      <div className='relative w-full h-full bg-black'>
        <Canvas
          shadows
          camera={{ position: [68, 27, 47], fov: 45 }}
          gl={{
            antialias: true,
            toneMappingExposure: 0.895,
          }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </Canvas>

        <Overlay />
        <Loader />
        <Leva collapsed />
      </div>
    </>
  )
}

export default App
