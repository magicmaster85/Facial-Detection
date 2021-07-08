const video = document.getElementById('video')

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

async function startVideo() {
    const LabeledFaceDescriptors = await loadLabeledFaces()
    // Percent value of matched image
    const faceMatcher = new faceapi.faceMatcher(LabeledFaceDescriptors, 
        .6)
    const results = resizeDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    resizeDetections.forEach(detection => {
        const box = detection.detection.box
        const drawBox = new faceapi.draw.DrawBox(box, { label: 'Face'})
        drawBox.draw(canvas)
    })
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

function loadLabeledFaces() {
    const labels = ['Aaron', 'Ardeth', 'John', 'Karen', 'Tyler', 'Melissa', 'Nina', 'Jarom']
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for (let i = 1; i <= 2; i++) {
                const img = await faceapi.fetchImage('https://github.com/magicmaster85/Facial-Detection/tree/main/Pictures/${label}/${i}.png')
                const detections = await faceapi.detectSingleFace(img)
                .withFaceLandmarks().withFaceDescriptors()
                descriptions.push(detections.descriptor)
            }

            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video,
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks
        ().withFaceExpressions()
        console.log(detections)
        const resizeDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizeDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizeDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizeDetections)
    }, 100)
})