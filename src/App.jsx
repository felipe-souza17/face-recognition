import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'
import './App.css'

function App() {
  const videoRef = useRef()
  const canvasRef = useRef()
  const [initializing, setInitializing] = useState()
  const videoWidth = 640
  const videoHeight = 480

  const startWebcam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    videoRef.current.srcObject = stream
  }

  useEffect(() => {
    const loadModels = () => {
      setInitializing(true)
      Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
      ])
        .then(startWebcam)
        .catch(e => console.log(e))
    }
    loadModels()
  }, [])

  const getLabeledFaceDescriptions = () => {
    const labels = ['felipe', 'magno']

    return Promise.all(
      labels.map(async label => {
        const descriptions = []
        for (let i = 1; i <= 2; i++) {
          const image = await faceapi.fetchImage(`/assets/${label}.jpg`)

          const detections = await faceapi
            .detectSingleFace(image)
            .withFaceLandmarks()
            .withFaceDescriptor()

          descriptions.push(detections.descriptor)
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  }

  const faceRecognition = async () => {
    // const labeledFaceDescriptors = await getLabeledFaceDescriptions()
    // const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors)
    canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(
      videoRef.current
    )
    const displaySize = {
      width: videoWidth,
      height: videoHeight
    }
    faceapi.matchDimensions(canvasRef.current, displaySize)
    if (initializing) {
      setInitializing(false)
    }
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvasRef.current
        .getContext('2d')
        .clearRect(0, 0, videoWidth, videoHeight)
      // console.log(resizedDetections)
      // const results = resizedDetections.map(d => {
      //   return faceMatcher.findBestMatch(d.labeledDescriptors.descriptors)
      // })

      // results.forEach((result, i) => {
      //   const box = resizedDetections[i].detection.box
      //   const drawBox = new faceapi.draw.DrawBox(box, { label: result })
      //   drawBox.draw(canvasRef.current)
      // })
      faceapi.draw.drawDetections(canvasRef.current, resizedDetections)
    }, 100)
  }
  return (
    <>
      <span>{initializing ? 'Inicializando modelos' : 'Pronto'}</span>
      <div className="app">
        <video ref={videoRef} autoPlay muted onPlay={faceRecognition} />
        <canvas ref={canvasRef} />
      </div>
    </>
  )
}

export default App
