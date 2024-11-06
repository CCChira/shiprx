<template>
  <div class="game-container">
    <canvas ref="canvasRef" @click="handleClick" tabindex="0" class="game-canvas"></canvas>
    <div class="hud">
      <div class="boost-meter" :style="{ width: `${boostFuel}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { SpaceGame } from '../game/spaceGame'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const game = ref<SpaceGame | null>(null)
const boostFuel = ref(100)

// Function to update canvas size
const updateCanvasSize = () => {
  if (!canvasRef.value) return
  canvasRef.value.width = window.innerWidth
  canvasRef.value.height = window.innerHeight
}

onMounted(() => {
  if (!canvasRef.value) return

  // Set initial size
  updateCanvasSize()

  // Handle window resizing
  window.addEventListener('resize', updateCanvasSize)

  // Initialize game
  game.value = new SpaceGame(canvasRef.value)

  // Subscribe to game events
  game.value.on('boostUpdate', (fuel: number) => {
    boostFuel.value = fuel
  })

  // Focus canvas to capture keyboard events
  canvasRef.value.focus()
})

onBeforeUnmount(() => {
  game.value?.destroy()
  window.removeEventListener('resize', updateCanvasSize)
})

const handleClick = () => {
  game.value?.handleClick()
}
</script>

<style scoped>
.game-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* Prevent scrollbars */
}

.game-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  outline: none;
  display: block; /* Remove extra space below canvas */
}

.hud {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 200px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  z-index: 1; /* Ensure HUD appears above canvas */
}

.boost-meter {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.1s ease-out;
}
</style>
