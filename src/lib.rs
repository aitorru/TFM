use base64::engine::general_purpose;
use base64::Engine;
use std::{
    ffi::{CStr, CString},
    os::raw::c_char,
};

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
// "box" is a reserved name.
// Public key
#[no_mangle]
extern "C" fn _box() {}

#[no_mangle]
extern "C" fn un_box() {}

// Secret key
#[no_mangle]
extern "C" fn _secret_box(
    secret_key_pointer: *const c_char,
    nonce_pointer: *const c_char,
    message_pointer: *const c_char,
) -> *mut c_char {
    let secret_key: &str;
    let nonce: &str;
    let message: &str;

    unsafe {
        secret_key = CStr::from_ptr(secret_key_pointer)
            .to_str()
            .expect("Could not parse secret key");
        nonce = CStr::from_ptr(nonce_pointer)
            .to_str()
            .expect("Could not parse secret key");
        message = CStr::from_ptr(message_pointer)
            .to_str()
            .expect("Could not parse secret key");
    }

    let decoded_base64_secret_key = general_purpose::STANDARD.decode(secret_key).unwrap();
    let decoded_base64_secret_key_u8: &[u8] = &decoded_base64_secret_key;

    let decoded_base64_nonce = general_purpose::STANDARD.decode(nonce).unwrap();
    let decoded_base64_nonce_u8: &[u8] = &decoded_base64_nonce;

    // The message has to have 32 0s at the start
    let message_start: &[u8; 32] = &[0; 32];
    let message_final: &[u8] = message.as_bytes();

    let full_message_slice = [message_start, message_final].concat();

    let mut out = vec![0u8; message.as_bytes().len() + 32];
    let _result = sodalite::secretbox(
        &mut out,
        &full_message_slice,
        decoded_base64_nonce_u8
            .try_into()
            .expect("Nonce with incorrect lenght"),
        decoded_base64_secret_key_u8
            .try_into()
            .expect("Secret key with incorrect lenght"),
    );
    let trimmed = &out[16..];
    // Ignore the first 16 bytes.
    CString::new(general_purpose::STANDARD.encode(trimmed))
        .expect("Error converting to pointer")
        .into_raw()
}

#[no_mangle]
extern "C" fn unsecret_box() {}

#[cfg(test)]
mod tests {
    use std::ffi::CString;

    use base64::{engine::general_purpose, Engine};

    use crate::{_secret_box, hash, verify};

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

    #[test]
    fn data_into_secret_box() {
        let key = "RGLSbtumR+PLDGKX2/WVqfnPL/rglGyRs0U1DQppJm8=";
        let key_ptr = CString::new(key).expect("Failed");
        let nonce = "ApAsVLwI0S+2RNpxdblflLiVF4Sp3Dlk";
        let nonce_ptr = CString::new(nonce).expect("Failed");

        let message = "deno!";
        let message_ptr = CString::new(message).expect("Failed");

        let _out = _secret_box(key_ptr.as_ptr(), nonce_ptr.as_ptr(), message_ptr.as_ptr());
        // TODO: Compare to an actual encrypted data chunk
    }
}
