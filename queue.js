/**
 * Puts the original async function calls in a queue
 * to be called right after the last call was finished.
 *
 * @since 4.18.0
 * @category Function
 * @param {Function} func The function to become queue.
 * @returns {Function} Returns the new queue function.
 * @example
 *
 * const lazyGreeter = name => new Promise(
 *   resolve => setTimeout(
 *     () => resolve(console.log(`hello, ${name}`)),
 *     1000,
 *   )
 * )
 * const queuedLazyGreeter = queue(lazyGreeter)
 * queuedLazyGreeter('Morphis')
 * queuedLazyGreeter('Oracle')
 * queuedLazyGreeter('Neo')
 */
function queue(func) {
  // initial empty queue of calls
  let q = []

  // remove the first job in the queue
  function decrementQueue() {
    q = q.slice(1)
  }

  // execute the job as it's its turn
  const execute = (resolve, reject, args) => () => (
    // invoke the original func by its original args
    Promise.resolve(func(...args))
    // once it's finished...
    .then(res => {
      // call its wrapper resolve function by its return value
      resolve(res)
      // and then remove this job from the queue
      decrementQueue()
    }, reject)
  )

  // wrapper function to be called instead of the original function
  const wrapper = (...args) => new Promise((resolve, reject) => {
    const exec = execute(resolve, reject, args)
    if (q.length === 0) {
      // if the queue is empty, execute it immediately
      q.push(exec())
    } else {
      // if theres more job in the queue, execute it after the last one
      q.push(q[q.length - 1].then(exec))
    }
  })

  return wrapper
}

export default queue
