// Confetti animation for successful registration
function startConfetti() {
    const canvas = document.createElement("canvas")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    canvas.style.position = "fixed"
    canvas.style.top = "0"
    canvas.style.left = "0"
    canvas.style.pointerEvents = "none"
    canvas.style.zIndex = "9999"
    document.body.appendChild(canvas)
  
    const ctx = canvas.getContext("2d")
    const confettiPieces = []
    const colors = ["#e3d03a", "#ffffff", "#ff6b6b", "#4CAF50", "#2196F3"]
    const totalPieces = 200
  
    // Create confetti pieces
    for (let i = 0; i < totalPieces; i++) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 3 + 2,
        angle: Math.random() * 2 * Math.PI,
        rotation: Math.random() * 0.2 - 0.1,
        rotationSpeed: Math.random() * 0.01 - 0.005,
      })
    }
  
    // Animation loop
    let animationFrame
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
  
      let stillFalling = false
      confettiPieces.forEach((piece) => {
        piece.y += piece.speed
        piece.x += Math.sin(piece.angle) * 2
        piece.angle += piece.rotation
        piece.rotation += piece.rotationSpeed
  
        if (piece.y < canvas.height) {
          stillFalling = true
        }
  
        ctx.save()
        ctx.translate(piece.x, piece.y)
        ctx.rotate(piece.angle)
        ctx.fillStyle = piece.color
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size)
        ctx.restore()
      })
  
      if (stillFalling) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        cancelAnimationFrame(animationFrame)
        canvas.remove()
      }
    }
  
    animate()
  
    // Stop animation after 6 seconds
    setTimeout(() => {
      cancelAnimationFrame(animationFrame)
      canvas.remove()
    }, 6000)
  }
  