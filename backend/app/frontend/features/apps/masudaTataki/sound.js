export function createSound() {
  let context
  return {
    unlock() {
      try {
        const Audio = window.AudioContext || window.webkitAudioContext
        if (Audio) context ??= new Audio()
        context?.resume()?.catch(() => {})
      } catch {
        /* 音声非対応でもゲームを続行する */
      }
    },
    play(kind) {
      if (!context || context.state !== "running") return
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const now = context.currentTime
      oscillator.type = kind === "miss" ? "sawtooth" : "sine"
      oscillator.frequency.setValueAtTime(kind === "hit" ? 740 : kind === "end" ? 520 : 150, now)
      oscillator.frequency.exponentialRampToValueAtTime(kind === "miss" ? 60 : 260, now + 0.16)
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(now)
      oscillator.stop(now + 0.2)
      oscillator.onended = () => {
        oscillator.disconnect()
        gain.disconnect()
      }
    },
    dispose() {
      context?.close()?.catch(() => {})
      context = undefined
    },
  }
}
