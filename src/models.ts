export interface Vote {
  id: number
  scores: number[]
}

export interface Election {
  candidates: string[]
  votes: Vote[]
}
