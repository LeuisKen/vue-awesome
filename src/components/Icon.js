import { get, register } from './register'

export default {
  template: `
    <svg version="1.1"
      class="{{klass}}"
      role="{{label ? 'img' : 'presentation'}}"
      aria-label="{{label}}"
      x="{{x}}"
      y="{{y}}"
      width="{{width}}"
      height="{{height}}"
      viewBox="{{box}}"
      style="{{computedStyle}}">
      <slot>
        <path s-if="icon && icon.paths"
          s-for="path in icon.paths"
          d="{{path.d}}"
          style="{{path.style}}"/>
        <polygon s-if="icon && icon.polygons"
          s-for="polygon in icon.polygons"
          points="{{polygon.points}}"
          style="{{polygon.style}}"/>
        <g s-if="icon && icon.raw" s-html="icon.raw"/>
      </slot>
    </svg>
  `,
  initData () {
    return {
      x: 0,
      y: 0,
      childrenWidth: 0,
      childrenHeight: 0,
      outerScale: 1
    }
  },
  // dataTypes: {
  //   name (props, propName) {
  //     const val = props[propName]
  //     if (val == null) {
  //       return true
  //     }
  //     if (val) {
  //       if (!(get(val))) {
  //         console.warn(`Invalid prop: prop "name" is referring to an unregistered icon "${val}".` +
  //           `\nPlease make sure you have imported this icon before using it.`)
  //         return false
  //       }
  //       return true
  //     }
  //     console.warn(`Invalid prop: prop "name" is required and it must be string.`)
  //     return false
  //   },
  //   scale: DataTypes.oneOfType([
  //     DataTypes.string,
  //     DataTypes.number
  //   ]),
  //   spin: DataTypes.bool,
  //   inverse: DataTypes.bool,
  //   pulse: DataTypes.bool,
  //   flip: DataTypes.oneOf(['horizontal', 'vertical']),
  //   label: DataTypes.string
  // },
  computed: {
    normalizedScale () {
      let scale = this.data.get('scale')
      scale = typeof scale === 'undefined' ? 1 : Number(scale)
      let outerScale = this.data.get('outerScale')
      if (isNaN(scale) || scale <= 0) {
        console.warn(`Invalid prop: prop "scale" should be a number over 0.`, this)
        return outerScale
      }
      return scale * outerScale
    },
    klass () {
      let classList = ['fa-icon']
      if (this.data.get('spin')) {
        classList.push('fa-spin')
      }
      if (this.data.get('flip') === 'horizontal') {
        classList.push('fa-flip-horizontal')
      }
      if (this.data.get('flip') === 'vertical') {
        classList.push('fa-flip-vertical')
      }
      if (this.data.get('inverse')) {
        classList.push('fa-inverse')
      }
      if (this.data.get('pulse')) {
        classList.push('fa-pulse')
      }
      return classList
    },
    icon () {
      const name = this.data.get('name')
      if (name) {
        return get(name)
      }
      return null
    },
    box () {
      const icon = this.data.get('icon')
      if (icon) {
        return `0 0 ${icon.width} ${icon.height}`
      }
      return `0 0 ${this.data.get('width')} ${this.data.get('height')}`
    },
    ratio () {
      const icon = this.data.get('icon')
      if (!icon) {
        return 1
      }
      let { width, height } = icon
      return Math.max(width, height) / 16
    },
    width () {
      const icon = this.data.get('icon')
      return this.data.get('childrenWidth') || icon && icon.width / this.data.get('ratio') * this.data.get('normalizedScale') || 0
    },
    height () {
      const icon = this.data.get('icon')
      return this.data.get('childrenHeight') || icon && icon.height / this.data.get('ratio') * this.data.get('normalizedScale') || 0
    },
    computedStyle () {
      const normalizedScale = this.data.get('normalizedScale')
      if (normalizedScale === 1) {
        return {}
      }
      return {
        'font-size': normalizedScale + 'em'
      }
    },
    raw () {
      // generate unique id for each icon's SVG element with ID
      const icon = this.data.get('icon')
      if (!icon || !icon.raw) {
        return null
      }
      let raw = icon.raw
      let ids = {}
      raw = raw.replace(/\s(?:xml:)?id=(["']?)([^"')\s]+)\1/g, (match, quote, id) => {
        let uniqueId = getId()
        ids[id] = uniqueId
        return ` id="${uniqueId}"`
      })
      raw = raw.replace(/#(?:([^'")\s]+)|xpointer\(id\((['"]?)([^')]+)\2\)\))/g, (match, rawId, _, pointerId) => {
        let id = rawId || pointerId
        if (!id || !ids[id]) {
          return match
        }

        return `#${ids[id]}`
      })

      return raw
    }
  },
  trimWhitespace: 'all',
  attached () {
    if (this.data.get('icon')) {
      return
    }
    const childrenIcons = this.slot()[0].children.filter(
      child => isComponent(child)
    )
    childrenIcons.forEach(child => {
      child.data.set('outerScale', this.data.get('normalizedScale'))
    })
    let width = 0
    let height = 0
    childrenIcons.forEach(child => {
      width = Math.max(width, child.data.get('width'))
      height = Math.max(height, child.data.get('height'))
    })
    this.data.set('childrenWidth', width)
    this.data.set('childrenHeight', height)
    childrenIcons.forEach(child => {
      child.data.set('x', (width - child.data.get('width')) / 2)
      child.data.set('y', (height - child.data.get('height')) / 2)
    })
  },

  register
}

let cursor = 0xd4937
function getId () {
  return `fa-${(cursor++).toString(16)}`
}
function isComponent (node) {
  return node.hasOwnProperty('data')
}
