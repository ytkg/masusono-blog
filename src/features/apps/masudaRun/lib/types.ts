export type GameState = 'ready' | 'playing' | 'gameover'

export interface Player {
  x: number
  y: number
  vy: number
  w: number
  h: number
  onGround: boolean
  jumps: number
  spin: number
}

export interface Obstacle {
  x: number
  y: number
  w: number
  h: number
  kind: 'short' | 'tall'
}

export interface Cloud {
  x: number
  y: number
  w: number
  h: number
  speed: number
  alpha: number
}

export interface World {
  t: number
  speed: number
  groundY: number
  player: Player
  gravity: number
  obstacles: Obstacle[]
  nextSpawn: number
  clouds: Cloud[]
  nextCloud: number
}
