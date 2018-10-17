extern crate futures;
extern crate js_sys;
extern crate wasm_bindgen;
extern crate wasm_bindgen_futures;
extern crate web_sys;
#[macro_use]
extern crate serde_derive;

use futures::{future, Future};
use js_sys::Promise;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::future_to_promise;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, RequestMode, Response};

#[derive(Debug, Serialize, Deserialize)]
pub struct Data {
    pub message: String,
}

#[wasm_bindgen]
pub fn run() -> Promise {
    let mut opts = RequestInit::new();
    opts.method("GET");
    opts.mode(RequestMode::Cors);

    let request = Request::new_with_str_and_init(
        "http://localhost:4000/ping",
        &opts,
    ).unwrap();

    // request
    //     .headers()
    //     .set("Accept", "application/vnd.github.v3+json")
    //     .unwrap();

    let window = web_sys::window().unwrap();
    let request_promise = window.fetch_with_request(&request);

    let future = JsFuture::from(request_promise)
        .and_then(|resp_value| {
            // `resp_value` is a `Response` object.
            assert!(resp_value.is_instance_of::<Response>());
            let resp: Response = resp_value.dyn_into().unwrap();
            resp.json()
        }).and_then(|json_value: Promise| {
            // Convert this other `Promise` into a rust `Future`.
            JsFuture::from(json_value)
        }).and_then(|json| {
            // Use serde to parse the JSON into a struct.
            let data: Data = json.into_serde().unwrap();

            // Send the `Data` struct back to JS as an `Object`.
            future::ok(JsValue::from_serde(&data).unwrap())
        });

    // Convert this Rust `Future` back into a JS `Promise`.
    future_to_promise(future)
}
