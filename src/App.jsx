import { useEffect, useRef } from 'react'
import * as faceapi from 'face-api.js'
import './App.css'

function App() {
  const imgRef = useRef()
  const canvasRef = useRef()

  const handleImage = async () => {
    const detections = await faceapi
      .detectAllFaces(imgRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()

    canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(imgRef.current)
    faceapi.matchDimensions(canvasRef.current, {
      height: 750,
      width: 476
    })
    const resized = faceapi.resizeResults(detections, {
      height: 750,
      width: 476
    })
    faceapi.draw.drawDetections(canvasRef.current, resized)
    faceapi.draw.drawFaceExpressions(canvasRef.current, resized)
  }

  useEffect(() => {
    const loadModels = () => {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
      ])
        .then(handleImage)
        .catch(e => console.log(e))
    }
    imgRef.current && loadModels()
  }, [])
  return (
    <div className="app">
      <img
        crossOrigin="anonymous"
        ref={imgRef}
        src="https://images.pexels.com/photos/16853616/pexels-photo-16853616/free-photo-of-adulto-ramalhete-buque-crisantemo.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        alt="Imagem de teste"
      />
      <canvas ref={canvasRef} height="750" width="476" />
    </div>
  )
}

export default App
