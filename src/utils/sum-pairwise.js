export default function sumPairwise(arr) {
  const n = arr.length
  let s
  if (n <= 10) {
    // base case: simple summation for a sufficiently small array
    s = arr.reduce((sum, val) => sum + val, 0)
  } else {
    // divide and conquer: recursively sum two halves of the array
    const m = Math.floor(n / 2)
    s = sumPairwise(arr.slice(0, m)) + sumPairwise(arr.slice(m, n))
  }
  return s
}
