let table
let table_header
let horizontal_scroll
let fixed_table
let right_interval
let left_interval

function scrollOnMousePosition(event) {
    let left = horizontal_scroll.getBoundingClientRect().left
    let width = horizontal_scroll.offsetWidth
    let x = event.clientX

    if (x < left+100) {
        if (right_interval) {
            clearInterval(right_interval)
            right_interval = undefined
        }
        if (!left_interval) {
            left_interval = setInterval(() => {
                horizontal_scroll.scrollBy({left: -100, behavior: 'smooth'})
            }, 100)
        }
    } else if (left+width - x < 100) {
        if (left_interval) {
            clearInterval(left_interval)
            left_interval = undefined
        }
        if (!right_interval) {
            right_interval = setInterval(() => {
                horizontal_scroll.scrollBy({left: 100, behavior: 'smooth'})
            }, 100)
        }
    } else {
        if (left_interval) {
            clearInterval(left_interval)
            left_interval = undefined
        }
        if (right_interval) {
            clearInterval(right_interval)
            right_interval = undefined
        }
    }
}

function stopScrollOnMouseOut() {
    if (left_interval) {
        clearInterval(left_interval)
        left_interval = undefined
    }
    if (right_interval) {
        clearInterval(right_interval)
        right_interval = undefined
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

function calculateTableHeaderWidth() {
    let ths = table_header.querySelectorAll('th')
    ths.forEach((th, i) => {
        let pos = i+1
        let width = th.offsetWidth+'px'
        fixed_table.querySelector('th:nth-child('+pos+')').style.minWidth = width
        fixed_table.querySelector('th:nth-child('+pos+')').style.maxWidth = width
    })
}

function superTable() {
    table = document.querySelector('table:not([data-fixed_table])')
    horizontal_scroll = document.querySelector('.table')

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
    fixed_table.dataset.fixed_table = 'fixed_table'
    fixed_table.appendChild(table_header.cloneNode(true))

    calculateTableHeaderWidth()

    table.style.position = 'relative'

    horizontal_scroll.removeEventListener('mouseout', stopScrollOnMouseOut)
    horizontal_scroll.removeEventListener('mousemove', scrollOnMousePosition)
    window.removeEventListener('scroll', positionTableHeader)
    window.removeEventListener('DOMSubtreeMofified', positionTableHeader)

    horizontal_scroll.addEventListener('mousemove', scrollOnMousePosition)
    horizontal_scroll.addEventListener('mouseout', stopScrollOnMouseOut)
    window.addEventListener('scroll', positionTableHeader)

    horizontal_scroll.appendChild(fixed_table)

    let observer = new MutationObserver(calculateTableHeaderWidth)
    observer.observe(horizontal_scroll, {
        attributes: false,
        childList: true,
        subtree: true
    })
}