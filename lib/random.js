export const genInRange = (min, max) => {
  if (max === undefined) {
    max = min
    min = 0
  }
  return ((Math.random() * (max - min)) | 0) + min
}
