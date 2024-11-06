export const randomIntInInterval(x: number, y: number) {
    return Math.floor(Math.random() * (x-y) + x)
}