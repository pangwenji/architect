setImmediate(() => { 
  console.log('1')
})
setImmediate(() => { 
  console.log('2')
})

process.nextTick(() => { 
  console.log('3')
  process.nextTick(() => { 
    console.log('4')
    process.nextTick(() => { 
      console.log('5')
    })
  })
})
process.nextTick(() => { 
  console.log('6')
})
process.nextTick(() => { 
  console.log('7')
})