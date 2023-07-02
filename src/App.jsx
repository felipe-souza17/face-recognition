import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'
import './App.css'

function App() {
  const videoRef = useRef()
  const canvasRef = useRef()
  const [initializing, setInitializing] = useState()
  const videoWidth = 640
  const videoHeight = 480

  const handleVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    videoRef.current.srcObject = stream
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
    setInterval(async () => {
      if (initializing) {
        setInitializing(false)
      }
      const displaySize = {
        width: videoWidth,
        height: videoHeight
      }
      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(
        videoRef.current
      )
      faceapi.matchDimensions(canvasRef.current, displaySize)
      const detections = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvasRef.current
        .getContext('2d')
        .clearRect(0, 0, videoWidth, videoHeight)
      faceapi.draw.drawDetections(canvasRef.current, resizedDetections)
    }, 100)
  }
  return (
    <>
      <span>{initializing ? 'Inicializando modelos' : 'Pronto'}</span>
      <div className="app">
        <video ref={videoRef} autoPlay muted onPlay={handleVideoOnPlay} />
        <canvas ref={canvasRef} />
      </div>
    </>
  )
}

export default App
