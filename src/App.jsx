import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'
import './App.css'

function App() {
  const videoRef = useRef()
  const canvasRef = useRef()
  const [initializing, setInitializing] = useState()

  const handleVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    videoRef.current.srcObject = stream

    // canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(
    //   videoRef.current
    // )
    // faceapi.matchDimensions(canvasRef.current, {
    //   height: 750,
    //   width: 476
    // })
    // const resized = faceapi.resizeResults(detections, {
    //   height: 750,
    //   width: 476
    // })
    // faceapi.draw.drawDetections(canvasRef.current, resized)
    // faceapi.draw.drawFaceExpressions(canvasRef.current, resized)
  }

  useEffect(() => {
    const loadModels = () => {
      setInitializing(true)
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
      ])
        .then(handleVideo)
        .catch(e => console.log(e))
    }
    loadModels()
  }, [])

  const handleVideoOnPlay = () => {
    // setInterval(async () => {
    //   if (initializing) {
    //     setInitializing(false)
    //   }
    //   const detections = await faceapi
    //     .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
    //     .withFaceLandmarks()
    //     .withFaceExpressions()
    //   console.log(detections)
    // }, 1000)
  }
  return (
    <div className="app">
      <span>{initializing ? 'Inicializando modelos' : 'Pronto'}</span>
      <video
        ref={videoRef}
        autoPlay
        muted
        height="750"
        width="476"
        onPlay={handleVideoOnPlay}
      />
      <canvas ref={canvasRef} height="750" width="476" />
    </div>
  )
}

export default App
