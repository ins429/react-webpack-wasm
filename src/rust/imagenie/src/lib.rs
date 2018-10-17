extern crate futures;
extern crate js_sys;
extern crate wasm_bindgen;
extern crate wasm_bindgen_futures;
extern crate web_sys;
extern crate base64;
#[macro_use]
extern crate serde_derive;
extern crate image;

use wasm_bindgen::prelude::*;
use image::{DynamicImage};
use web_sys::console;

#[wasm_bindgen]
pub fn run(img: &[u8]) -> String {
    base64::encode(img)
}

#[wasm_bindgen]
pub fn gen_thumbnail(img: &[u8]) -> String {
    let dynamicImage = image::load_from_memory(img).unwrap().thumbnail(100, 100);
    let mut buf = Vec::new();

    dynamicImage.write_to(&mut buf, image::ImageOutputFormat::PNG).expect("Unable to write");

    base64::encode(&buf)
}

#[wasm_bindgen]
pub fn decode_and_thumbnail(img_base_64: &str) -> String {
    let buf: Vec<u8> = base64::decode(&img_base_64).unwrap();
    gen_thumbnail(&buf)
}

#[wasm_bindgen]
pub fn crop(img: &[u8], x: u32, y: u32, width: u32, height: u32) -> String {
    let mut dynamicImage = image::load_from_memory(img).unwrap().crop(x, y, width, height);
    let mut buf = Vec::new();

    dynamicImage.write_to(&mut buf, image::ImageOutputFormat::PNG).expect("Unable to write");

    base64::encode(&buf)
}

#[wasm_bindgen]
pub fn decode_and_crop(img_base_64: &str, x: u32, y: u32, width: u32, height: u32) -> String {
    let buf: Vec<u8> = base64::decode(&img_base_64).unwrap();
    crop(&buf, x, y, width, height)
}

#[wasm_bindgen]
pub fn decode_and_invert(img_base_64: &str) -> String {
    let buf: Vec<u8> = base64::decode(&img_base_64).unwrap();
    invert(&buf)
}

#[wasm_bindgen]
pub fn invert(img: &[u8]) -> String {
    let mut dynamicImage = image::load_from_memory(img).unwrap();
        dynamicImage.invert();
    let mut buf = Vec::new();

    dynamicImage.write_to(&mut buf, image::ImageOutputFormat::PNG).expect("Unable to write");

    base64::encode(&buf)
}

fn log_which_image(image: &DynamicImage) {
    match *image {
        DynamicImage::ImageLuma8(ref a) => console::log_1(&"ImageLuma8".into()),

        DynamicImage::ImageLumaA8(ref a) => console::log_1(&"ImageLumaA8".into()),

        DynamicImage::ImageRgb8(ref a) => console::log_1(&"ImageRgb8".into()),

        DynamicImage::ImageRgba8(ref a) => console::log_1(&"ImageRgba8".into()),

        DynamicImage::ImageBgr8(ref a) => console::log_1(&"ImageBgr8".into()),

        DynamicImage::ImageBgra8(ref a) => console::log_1(&"ImageBgra8".into()),
    }
}

// specialkey
