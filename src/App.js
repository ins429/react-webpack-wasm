import React, { Component } from 'react'

const wasm = import('./rust/http/pkg/http')
const imagenie = import('./rust/imagenie/pkg/imagenie')

class App extends Component {
  state = {
    isLoading: true,
    imageSrc: null,
    thumbnailSrc: null,

    mousedown: false,
    dragStartX: null,
    dragStartY: null,
    dragEndX: null,
    dragEndY: null
  }
  wasm = null

  componentDidMount() {
    imagenie.then(module => {
      this.wasm = module
      this.setState({
        isLoading: false
      })
    })
  }

  render() {
    const {
      isLoading,
      message,
      invertSrc,
      imageSrc,
      thumbnailSrc,
      cropSrc
    } = this.state

    return isLoading ? (
      <div>Loading...</div>
    ) : (
      <div>
        <input
          type="file"
          onChange={e => {
            const reader = new FileReader()

            if (e.target.files[0]) {
              reader.readAsArrayBuffer(e.target.files[0])
              reader.onload = evt => {
                const {
                  target: { result: buffer }
                } = evt
                const imageUint8Array = new Uint8Array(buffer)
                const imageSrc = this.wasm.run(imageUint8Array)
                console.log('done1')
                const thumbnailSrc = this.wasm.gen_thumbnail(imageUint8Array)
                console.log('done2')
                // const invertSrc = this.wasm.invert(imageUint8Array)

                this.setState({
                  imageUint8Array,
                  imageSrc,
                  thumbnailSrc
                  // invertSrc
                })
              }
            }
          }}
        />
        <button
          disabled={isLoading}
          onClick={() => {
            this.setState({
              imageSrc: null,
              thumbnailSrc: null,
              // invertSrc: null,
              cropSrc: null
            })

            const r = new Request(
              'https://www.rust-lang.org/logos/rust-logo-256x256-blk.png'
            )

            fetch(r)
              .then(resp => resp.arrayBuffer())
              .then(buffer => {
                const imageUint8Array = new Uint8Array(buffer)
                const imageSrc = this.wasm.run(imageUint8Array)
                const thumbnailSrc = this.wasm.gen_thumbnail(imageUint8Array)
                // const invertSrc = this.wasm.invert(imageUint8Array)

                this.setState({
                  imageUint8Array,
                  imageSrc,
                  thumbnailSrc
                  // invertSrc
                })
              })
          }}
        >
          Load
        </button>
        {imageSrc && (
          <div>
            original image
            <img
              src={`data:image/png;base64,${imageSrc}`}
              draggable="false"
              onMouseDown={e => {
                console.log(
                  'onMouseDown',
                  e.pageX - e.target.offsetLeft,
                  e.pageY - e.target.offsetTop
                )
                this.setState({
                  mousedown: true,
                  absoulteStartX: e.pageX,
                  absoulteStartY: e.pageY,
                  dragStartX: e.pageX - e.target.offsetLeft,
                  dragStartY: e.pageY - e.target.offsetTop
                })
              }}
              onMouseMove={e => {
                if (this.state.mousedown) {
                  this.setState({
                    dragEndX: e.pageX - e.target.offsetLeft,
                    dragEndY: e.pageY - e.target.offsetTop
                  })
                }
              }}
              onMouseUp={() => {
                const {
                  imageUint8Array,
                  dragStartX,
                  dragStartY,
                  dragEndX,
                  dragEndY
                } = this.state
                const cropSrc = this.wasm.crop(
                  imageUint8Array,
                  dragStartX,
                  dragStartY,
                  dragEndX - dragStartX,
                  dragEndY - dragStartY
                )

                this.setState({
                  cropSrc,
                  mousedown: false,
                  absoulteStartX: null,
                  absoulteStartY: null,
                  dragStartX: null,
                  dragStartY: null,
                  dragEndX: null,
                  dragEndY: null
                })
              }}
              onMouseLeave={() =>
                this.setState({
                  mousedown: false,
                  absoulteStartX: null,
                  absoulteStartY: null,
                  dragStartX: null,
                  dragStartY: null,
                  dragEndX: null,
                  dragEndY: null
                })
              }
              onDragStart={() => false}
            />
          </div>
        )}
        {thumbnailSrc && (
          <div>
            thumbnail image
            <img src={`data:image/png;base64,${thumbnailSrc}`} />
          </div>
        )}
        {invertSrc && (
          <div>
            invert image
            <img src={`data:image/png;base64,${invertSrc}`} />
          </div>
        )}
        {cropSrc && (
          <div>
            crop image
            <img src={`data:image/png;base64,${cropSrc}`} />
          </div>
        )}
        {this.state.mousedown && (
          <div
            style={{
              position: 'absolute',
              background: '#ccc',
              opacity: 0.5,
              left: this.state.absoulteStartX,
              top: this.state.absoulteStartY,
              width: this.state.dragEndX - this.state.dragStartX,
              height: this.state.dragEndY - this.state.dragStartY
            }}
          />
        )}
      </div>
    )
  }
}

export default App
