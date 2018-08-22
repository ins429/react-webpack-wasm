import React, { Component } from 'react'

const wasm = import('pjlee-hello-rust-conf/helloRustConf.js')

class App extends Component {
  state = {
    isLoading: true
  }
  wasm = null

  componentDidMount() {
    wasm.then(module => {
      this.wasm = module
      this.setState({
        isLoading: false
      })
    })
  }

  render() {
    const { isLoading } = this.state

    return isLoading ? (
      <div>Loading...</div>
    ) : (
      <div>
        hello world
        <button onClick={this.wasm.greet}>toggle</button>
      </div>
    )
  }
}

export default App
