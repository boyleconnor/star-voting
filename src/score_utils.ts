// min & max scores (inclusive)
export const MIN_SCORE = 0
export const MAX_SCORE = 5
const GRADIENT_LEFT = [0xff, 0x00, 0x00]
const GRADIENT_RIGHT = [0x00, 0xff, 0x00]

export function getColor(score: number) {
  const progress = (score - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)
  const colorCodes = GRADIENT_LEFT.map((code, i) => {
    return (
      Math.ceil((1 - progress) * code) + Math.ceil(progress * GRADIENT_RIGHT[i])
    )
  })
  return `#${colorCodes[0].toString(16).padStart(2, "0")}${colorCodes[1].toString(16).padStart(2, "0")}${colorCodes[2].toString(16).padStart(2, "0")}`
}
