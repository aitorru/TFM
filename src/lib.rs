use std::{
    ffi::{CStr, CString},
    os::raw::c_char,
};

#[no_mangle]
extern "C" fn add(x: f64, y: f64) -> f64 {
    x + y
}

#[no_mangle]
extern "C" fn string_test() -> *mut c_char {
    let string_to_return = CString::new("Hola mundo").expect("Error converting to c_char");
    string_to_return.into_raw()
}

#[no_mangle]
extern "C" fn hash(input_text_pointer: *const c_char, cost: u32) -> *mut c_char {
    let password: &str;

    unsafe {
        password = CStr::from_ptr(input_text_pointer)
            .to_str()
            .expect("Could not parse string.");
    }
    let resulting_hash = bcrypt::hash(password, cost).unwrap();
    let cstring = CString::new(resulting_hash.as_str()).expect("Error converting to c_char");
    cstring.into_raw()
}

#[no_mangle]
extern "C" fn verify(password_pointer: *const c_char, hash_pointer: *const c_char) -> bool {
    let password: &str;
    let hash: &str;

    // As strings are pointers Rust cannot stop UB.
    unsafe {
        password = CStr::from_ptr(password_pointer)
            .to_str()
            .expect("Could not parse string.");
        hash = CStr::from_ptr(hash_pointer)
            .to_str()
            .expect("Could not parse string.");
    }

    let result = bcrypt::verify(password, hash);
    match result {
        Ok(_) => return true,
        Err(_) => return false,
    }
}

#[cfg(test)]
mod tests {
    use std::ffi::CString;

    use crate::{add, hash, verify};

    #[test]
    fn add_ffi() {
        let result = add(2.0, 2.0);
        assert_eq!(result, 4.0);
    }

    #[test]
    fn verify_ffi() {
        let hash = "$2a$12$LDcfCoNer8N.qDtkgjZekOBLdqB5uJbXPSEnfgiOAZhvw.S4FwT/6";
        let text = "ilovedeno";
        let result: bool;

        let hash_ptr = CString::new(hash).expect("Failed");
        let text_ptr = CString::new(text).expect("Failed");
        result = verify(text_ptr.as_ptr(), hash_ptr.as_ptr());

        assert!(result);
    }

    #[test]
    fn hash_and_verify_ffi() {
        let target_text = "iloverust";

        let text_ptr = CString::new(target_text).expect("Failed");

        let hashed = hash(text_ptr.as_ptr(), 12);

        assert!(
            verify(text_ptr.as_ptr(), hashed),
            "The hash did not verify."
        );
    }
}
