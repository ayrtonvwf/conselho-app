/* eslint-disable */

let table
let table_header
let horizontal_scroll
let fixed_table
let fixed_column
let right_interval
let left_interval
let is_touching = false
let observer

function dettectTouchStart() {
  is_touching = true
  window.removeEventListener('touchstart', dettectTouchStart)
}
window.addEventListener('touchstart', dettectTouchStart)

function scrollOnMousePosition(event) {
  let left = horizontal_scroll.getBoundingClientRect().left
  let width = horizontal_scroll.offsetWidth
  let x = event.clientX

  if (x < left+100) {
    if (right_interval) {
      clearInterval(right_interval)
      right_interval = undefined
    }
    if (!left_interval && horizontal_scroll.scrollLeft) {
      left_interval = setInterval(() => {
        horizontal_scroll.scrollBy({left: -100, behavior: 'smooth'})
        if (!horizontal_scroll.scrollLeft) {
          stopScrollOnMouseOut()
        }
      }, 100)
      horizontal_scroll.style.cursor = 'w-resize'
    }
  } else if (left+width - x < 100) {
    if (left_interval) {
      clearInterval(left_interval)
      left_interval = undefined
    }
    if (!right_interval && horizontal_scroll.scrollLeft + horizontal_scroll.offsetWidth < table.offsetWidth) {
      right_interval = setInterval(() => {
        horizontal_scroll.scrollBy({left: 100, behavior: 'smooth'})
        if (horizontal_scroll.scrollLeft + horizontal_scroll.offsetWidth === table.offsetWidth) {
          stopScrollOnMouseOut()
        }
      }, 100)
      horizontal_scroll.style.cursor = 'e-resize'
    }
  } else {
    if (left_interval) {
      clearInterval(left_interval)
      left_interval = undefined
      horizontal_scroll.style.cursor = 'auto'
    }
    if (right_interval) {
      clearInterval(right_interval)
      right_interval = undefined
      horizontal_scroll.style.cursor = 'auto'
    }
  }
}

function stopScrollOnMouseOut() {
  if (left_interval) {
    clearInterval(left_interval)
    left_interval = undefined
    horizontal_scroll.style.cursor = 'auto'
  }
  if (right_interval) {
    clearInterval(right_interval)
    right_interval = undefined
    horizontal_scroll.style.cursor = 'auto'
  }
}

function positionTableHeader() {
  let offset = table.getBoundingClientRect().top
  if (offset > 0) {
    fixed_table.style.display = 'none'
    return
  }

  fixed_table.style.display = 'table'
  fixed_table.style.marginTop = (-offset)+'px'
}

function positionTableCol() {
  if (!fixed_column) {
    return
  }

  let offset = horizontal_scroll.scrollLeft
  if (!offset) {
    fixed_column.style.display = 'none'
    return
  }

  fixed_column.style.display = 'table'
  fixed_column.style.marginLeft = offset+'px'
}

function calculateTableHeaderWidth() {
  let ths = table_header.querySelectorAll('th')
  ths.forEach((th, i) => {
    let pos = i+1
    let width = th.offsetWidth+'px'
    fixed_table.querySelector('th:nth-child('+pos+')').style.minWidth = width
    fixed_table.querySelector('th:nth-child('+pos+')').style.maxWidth = width
  })
}

function mountFixedColumn() {
  let prev_fixed_col = document.querySelector('[data-fixed_column]')
  if (prev_fixed_col) {
    horizontal_scroll.removeChild(prev_fixed_col)
  }

  fixed_column = fixed_table.cloneNode(false)
  fixed_column.style.top = '10px' // .table margin
  fixed_column.style.marginTop = '0px'
  fixed_column.style.borderRight = '1px solid darkgray'
  fixed_column.dataset.fixed_column = 'fixed_column'
  fixed_column.style.zIndex = 10
  let fixed_column_tbody = table.querySelector('tbody')
  if (fixed_column_tbody) {
    fixed_column_tbody = fixed_column_tbody.cloneNode()
    let fixed_column_thead = fixed_table.querySelector('thead').cloneNode()
    let fixed_column_thead_tr = fixed_table.querySelector('tr').cloneNode()
    let fixed_column_thead_th = fixed_table.querySelector('th').cloneNode(true)
    let original_th = table.querySelector('th')

    fixed_column.style.width = original_th.offsetWidth+'px'

    let height = original_th.offsetHeight+'px'

    fixed_column_thead_th.style.height = height
    fixed_column_thead_th.style.minHeight = height
    fixed_column_thead_th.style.maxHeight = height

    fixed_column_thead_tr.appendChild(fixed_column_thead_th)
    fixed_column_thead.appendChild(fixed_column_thead_tr)
    fixed_column.appendChild(fixed_column_thead).cloneNode()
    table.querySelectorAll('tbody>tr').forEach((tr, i) => {
      let pos = i+1
      let fixed_column_tbody_tr = tr.cloneNode()
      let fixed_column_tbody_td = tr.querySelector('td').cloneNode(true)
      let height = table.querySelector('tbody>tr:nth-child('+pos+')>td').offsetHeight+'px'

      fixed_column_tbody_td.style.height = height
      fixed_column_tbody_td.style.minHeight = height
      fixed_column_tbody_td.style.maxHeight = height

      fixed_column_tbody_tr.appendChild(fixed_column_tbody_td)
      fixed_column_tbody.appendChild(fixed_column_tbody_tr)
    })
    fixed_column.appendChild(fixed_column_tbody)
    horizontal_scroll.appendChild(fixed_column)
  }
}

export default function superTable() {
  table = document.querySelector('table:not([data-fixed_table])')
  horizontal_scroll = document.querySelector('.table')
  if (observer) {
    observer.disconnect()
  }

  if (!table || !horizontal_scroll) {
    return
  }

  let prev_fixed_table = horizontal_scroll.querySelector('table[data-fixed_table=fixed_table]')
  if (prev_fixed_table) {
    horizontal_scroll.removeChild(prev_fixed_table)
  }

  table_header = table.querySelector('thead')
  fixed_table = document.createElement('table')
  fixed_table.style.position = 'absolute'
  fixed_table.style.backgroundColor = 'white'
  fixed_table.style.display = 'none'
  fixed_table.style.top = '0px'
  fixed_table.style.left = '0px'
  fixed_table.style.zIndex = 11
  fixed_table.dataset.fixed_table = 'fixed_table'
  fixed_table.appendChild(table_header.cloneNode(true))

  calculateTableHeaderWidth()
  mountFixedColumn()

  table.style.position = 'relative'

  horizontal_scroll.removeEventListener('mouseout', stopScrollOnMouseOut)
  horizontal_scroll.removeEventListener('mousemove', scrollOnMousePosition)
  window.removeEventListener('scroll', positionTableHeader)
  window.removeEventListener('resize', positionTableHeader)
  horizontal_scroll.removeEventListener('scroll', positionTableCol)

  if (!is_touching) {
    horizontal_scroll.addEventListener('mousemove', scrollOnMousePosition)
    horizontal_scroll.addEventListener('mouseout', stopScrollOnMouseOut)
  }
  window.addEventListener('scroll', positionTableHeader)
  window.addEventListener('resize', positionTableHeader)
  horizontal_scroll.addEventListener('scroll', positionTableCol)

  horizontal_scroll.appendChild(fixed_table)

  let observer_options = {
    attributes: false,
    childList: true,
    subtree: true
  }

  observer = new MutationObserver(() => {
    observer.disconnect()

    calculateTableHeaderWidth()
    mountFixedColumn()

    observer.observe(horizontal_scroll, observer_options)
  })
  observer.observe(horizontal_scroll, observer_options)
}
