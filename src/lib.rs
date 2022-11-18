#[no_mangle]
extern "C" fn add(x: f64, y: f64) -> f64 {
    x + y
}

#[cfg(test)]
mod tests {
    use crate::add;

    #[test]
    fn add_ffi() {
        let result = add(2.0, 2.0);
        assert_eq!(result, 4.0);
    }
}
