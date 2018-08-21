let table
let tableHeader
let horizontalScroll
let fixedTable
let fixedColumn
let rightInterval
let leftInterval
let isTouching = false
let observer

function detectTouchStart () {
  isTouching = true
  window.removeEventListener('touchstart', detectTouchStart)
}
window.addEventListener('touchstart', detectTouchStart)

function scrollOnMousePosition (event) {
  let left = horizontalScroll.getBoundingClientRect().left
  let width = horizontalScroll.offsetWidth
  let x = event.clientX

  if (x < left + 100) {
    if (rightInterval) {
      clearInterval(rightInterval)
      rightInterval = undefined
    }
    if (!leftInterval && horizontalScroll.scrollLeft) {
      leftInterval = setInterval(() => {
        horizontalScroll.scrollBy({left: -100, behavior: 'smooth'})
        if (!horizontalScroll.scrollLeft) {
          stopScrollOnMouseOut()
        }
      }, 100)
      horizontalScroll.style.cursor = 'w-resize'
    }
  } else if (left + width - x < 100) {
    if (leftInterval) {
      clearInterval(leftInterval)
      leftInterval = undefined
    }
    if (!rightInterval && horizontalScroll.scrollLeft + horizontalScroll.offsetWidth < table.offsetWidth) {
      rightInterval = setInterval(() => {
        horizontalScroll.scrollBy({left: 100, behavior: 'smooth'})
        if (horizontalScroll.scrollLeft + horizontalScroll.offsetWidth === table.offsetWidth) {
          stopScrollOnMouseOut()
        }
      }, 100)
      horizontalScroll.style.cursor = 'e-resize'
    }
  } else {
    if (leftInterval) {
      clearInterval(leftInterval)
      leftInterval = undefined
      horizontalScroll.style.cursor = 'auto'
    }
    if (rightInterval) {
      clearInterval(rightInterval)
      rightInterval = undefined
      horizontalScroll.style.cursor = 'auto'
    }
  }
}

function stopScrollOnMouseOut () {
  if (leftInterval) {
    clearInterval(leftInterval)
    leftInterval = undefined
    horizontalScroll.style.cursor = 'auto'
  }
  if (rightInterval) {
    clearInterval(rightInterval)
    rightInterval = undefined
    horizontalScroll.style.cursor = 'auto'
  }
}

function positionTableHeader () {
  let offset = table.getBoundingClientRect().top
  if (offset > 0) {
    fixedTable.style.display = 'none'
    return
  }

  fixedTable.style.display = 'table'
  fixedTable.style.marginTop = (-offset) + 'px'
}

function positionTableCol () {
  if (!fixedColumn) {
    return
  }

  let offset = horizontalScroll.scrollLeft
  if (!offset) {
    fixedColumn.style.display = 'none'
    return
  }

  fixedColumn.style.display = 'table'
  fixedColumn.style.marginLeft = offset + 'px'
}

function calculateTableHeaderWidth () {
  let ths = tableHeader.querySelectorAll('th')
  ths.forEach((th, i) => {
    let pos = i + 1
    let width = th.offsetWidth + 'px'
    fixedTable.querySelector('th:nth-child(' + pos + ')').style.minWidth = width
    fixedTable.querySelector('th:nth-child(' + pos + ')').style.maxWidth = width
  })
}

function mountFixedColumn () {
  let prevFixedCol = document.querySelector('[data-fixed_column]')
  if (prevFixedCol) {
    horizontalScroll.removeChild(prevFixedCol)
  }

  fixedColumn = fixedTable.cloneNode(false)
  fixedColumn.style.top = '10px' // .table margin
  fixedColumn.style.marginTop = '0px'
  fixedColumn.style.borderRight = '1px solid darkgray'
  fixedColumn.dataset.fixed_column = 'fixed_column'
  fixedColumn.style.zIndex = 10
  let fixedColumnTbody = table.querySelector('tbody')
  if (fixedColumnTbody) {
    fixedColumnTbody = fixedColumnTbody.cloneNode()
    let fixedColumnThead = fixedTable.querySelector('thead').cloneNode()
    let fixedColumnTheadTr = fixedTable.querySelector('tr').cloneNode()
    let fixedColumnTheadTh = fixedTable.querySelector('th').cloneNode(true)
    let originalTh = table.querySelector('th')

    fixedColumn.style.width = originalTh.offsetWidth + 'px'

    let height = originalTh.offsetHeight + 'px'

    fixedColumnTheadTh.style.height = height
    fixedColumnTheadTh.style.minHeight = height
    fixedColumnTheadTh.style.maxHeight = height

    fixedColumnTheadTr.appendChild(fixedColumnTheadTh)
    fixedColumnThead.appendChild(fixedColumnTheadTr)
    fixedColumn.appendChild(fixedColumnThead).cloneNode()
    table.querySelectorAll('tbody>tr').forEach((tr, i) => {
      let pos = i + 1
      let fixedColumnTbodyTr = tr.cloneNode()
      let fixedColumnTbodyTd = tr.querySelector('td').cloneNode(true)
      let height = table.querySelector('tbody>tr:nth-child(' + pos + ')>td').offsetHeight + 'px'

      fixedColumnTbodyTd.style.height = height
      fixedColumnTbodyTd.style.minHeight = height
      fixedColumnTbodyTd.style.maxHeight = height

      fixedColumnTbodyTr.appendChild(fixedColumnTbodyTd)
      fixedColumnTbody.appendChild(fixedColumnTbodyTr)
    })
    fixedColumn.appendChild(fixedColumnTbody)
    horizontalScroll.appendChild(fixedColumn)
  }
}

export default function superTable () {
  table = undefined
  tableHeader = undefined
  horizontalScroll = undefined
  fixedTable = undefined
  fixedColumn = undefined
  rightInterval = undefined
  leftInterval = undefined
  observer = undefined

  table = document.querySelector('table:not([data-fixed_table])')
  horizontalScroll = document.querySelector('.table')
  if (observer) {
    observer.disconnect()
  }

  if (!table || !horizontalScroll) {
    return
  }

  let prevFixedTable = horizontalScroll.querySelector('table[data-fixed_table=fixed_table]')
  if (prevFixedTable) {
    horizontalScroll.removeChild(prevFixedTable)
  }

  tableHeader = table.querySelector('thead')
  fixedTable = document.createElement('table')
  fixedTable.style.position = 'absolute'
  fixedTable.style.backgroundColor = 'white'
  fixedTable.style.display = 'none'
  fixedTable.style.top = '0px'
  fixedTable.style.left = '0px'
  fixedTable.style.zIndex = 11
  fixedTable.dataset.fixed_table = 'fixed_table'
  fixedTable.appendChild(tableHeader.cloneNode(true))

  calculateTableHeaderWidth()
  mountFixedColumn()

  table.style.position = 'relative'

  horizontalScroll.removeEventListener('mouseout', stopScrollOnMouseOut)
  horizontalScroll.removeEventListener('mousemove', scrollOnMousePosition)
  window.removeEventListener('scroll', positionTableHeader)
  window.removeEventListener('resize', positionTableHeader)
  horizontalScroll.removeEventListener('scroll', positionTableCol)

  if (!isTouching) {
    horizontalScroll.addEventListener('mousemove', scrollOnMousePosition)
    horizontalScroll.addEventListener('mouseout', stopScrollOnMouseOut)
  }
  window.addEventListener('scroll', positionTableHeader)
  window.addEventListener('resize', positionTableHeader)
  horizontalScroll.addEventListener('scroll', positionTableCol)

  horizontalScroll.appendChild(fixedTable)

  let observerOptions = {
    attributes: false,
    childList: true,
    subtree: true
  }

  observer = new MutationObserver(() => {
    observer.disconnect()

    calculateTableHeaderWidth()
    mountFixedColumn()

    observer.observe(horizontalScroll, observerOptions)
  })
  observer.observe(horizontalScroll, observerOptions)
}
