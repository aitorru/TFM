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
extern "C" fn _box(
    public_key_pointer: *const c_char,
    private_key_pointer: *const c_char,
    nonce_pointer: *const c_char,
    message_pointer: *const c_char,
) -> *mut c_char {
    let message: &str;
    let nonce: &str;
    let public_key: &str;
    let private_key: &str;

    unsafe {
        message = CStr::from_ptr(message_pointer)
            .to_str()
            .expect("Could not parse secret key");
        nonce = CStr::from_ptr(nonce_pointer)
            .to_str()
            .expect("Could not parse secret key");
        public_key = CStr::from_ptr(public_key_pointer)
            .to_str()
            .expect("Could not parse public key");
        private_key = CStr::from_ptr(private_key_pointer)
            .to_str()
            .expect("Could not parse public key");
    }

    let decoded_base64_nonce = general_purpose::STANDARD.decode(nonce).unwrap();

    let decoded_base64_public_key = general_purpose::STANDARD.decode(public_key).unwrap();

    let decoded_base64_private_key = general_purpose::STANDARD.decode(private_key).unwrap();

    // First 32 bytes of the message have to be zeroes
    let message_start: &[u8; 32] = &[0; 32];
    let message_final = message.as_bytes();

    let full_message_slice = [message_start, message_final].concat();

    // Create a vec to store the result
    let mut out = vec![0u8; message.as_bytes().len() + 32];
    sodalite::box_(
        &mut out,
        &full_message_slice,
        &decoded_base64_nonce
            .try_into()
            .expect("Nonce with incorrect lenght"),
        &decoded_base64_public_key
            .try_into()
            .expect("Public key with incorrect lenght"),
        &decoded_base64_private_key
            .try_into()
            .expect("Private key with incorrect lenght"),
    )
    .expect("Could not encrypt");

    let trimmed = &out[16..];
    CString::new(general_purpose::STANDARD.encode(trimmed))
        .expect("Error converting to pointer")
        .into_raw()
}

#[no_mangle]
extern "C" fn _unbox(
    p_public_key_pointer: *const c_char,
    s_secret_key_pointer: *const c_char,
    nonce_pointer: *const c_char,
    message_pointer: *const c_char,
) -> *mut c_char {
    let p_public_key: &str;
    let s_secret_key: &str;
    let nonce: &str;
    let message: &str;

    unsafe {
        p_public_key = CStr::from_ptr(p_public_key_pointer)
            .to_str()
            .expect("Could not parse public key");
        s_secret_key = CStr::from_ptr(s_secret_key_pointer)
            .to_str()
            .expect("Could not parse secret key");
        nonce = CStr::from_ptr(nonce_pointer)
            .to_str()
            .expect("Could not parse nonce");
        message = CStr::from_ptr(message_pointer)
            .to_str()
            .expect("Could not parse message");
    }

    let decoded_base64_p_public_key = general_purpose::STANDARD.decode(p_public_key).unwrap();

    let decoded_base64_s_secret_key = general_purpose::STANDARD.decode(s_secret_key).unwrap();

    let decoded_base64_nonce = general_purpose::STANDARD.decode(nonce).unwrap();

    let decoded_base64_message = general_purpose::STANDARD.decode(message).unwrap();

    // The message has to have 16 0s at the start
    let message_start: &[u8; 16] = &[0; 16];
    let message_final = decoded_base64_message.as_slice();

    let full_message_slice = [message_start, message_final].concat();

    let mut out = vec![0u8; full_message_slice.len()];

    let _result = sodalite::box_open(
        &mut out,
        &full_message_slice,
        &decoded_base64_nonce.try_into().unwrap(),
        &decoded_base64_p_public_key.try_into().unwrap(),
        &decoded_base64_s_secret_key.try_into().unwrap(),
    );
    let trimmed = &out[32..];
    CString::new(trimmed)
        .expect("Error converting to pointer")
        .into_raw()
}

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
extern "C" fn _unsecret_box(
    secret_key_pointer: *const c_char,
    nonce_pointer: *const c_char,
    secret_message_pointer: *const c_char,
) -> *mut c_char {
    let secret_key: &str;
    let nonce: &str;
    let secret_message: &str;

    unsafe {
        secret_key = CStr::from_ptr(secret_key_pointer)
            .to_str()
            .expect("Could not parse secret key");
        nonce = CStr::from_ptr(nonce_pointer)
            .to_str()
            .expect("Could not parse secret key");
        secret_message = CStr::from_ptr(secret_message_pointer)
            .to_str()
            .expect("Could not parse secret key");
    }

    let decoded_base64_secret_key = general_purpose::STANDARD.decode(secret_key).unwrap();
    let decoded_base64_secret_key_u8: &[u8] = &decoded_base64_secret_key;

    let decoded_base64_nonce = general_purpose::STANDARD.decode(nonce).unwrap();
    let decoded_base64_nonce_u8: &[u8] = &decoded_base64_nonce;

    let decoded_base64_secret_message = general_purpose::STANDARD.decode(secret_message).unwrap();
    let decoded_base64_secret_message_u8: &[u8] = &decoded_base64_secret_message;

    // The message has to have 16 0s at the start
    let message_start: &[u8; 16] = &[0; 16];
    let message_final: &[u8] = decoded_base64_secret_message_u8;

    let full_message_slice = [message_start, message_final].concat();

    let mut out = vec![0u8; full_message_slice.len()];
    let _result = sodalite::secretbox_open(
        &mut out,
        &full_message_slice,
        decoded_base64_nonce_u8
            .try_into()
            .expect("Nonce with incorrect lenght"),
        decoded_base64_secret_key_u8
            .try_into()
            .expect("Key with incorrect lenght"),
    );
    // Ignore the first 32 bytes
    let trimmed = &out[32..];
    CString::new(trimmed)
        .expect("Error converting to pointer")
        .into_raw()
}

#[cfg(test)]
mod tests {
    use std::ffi::{CStr, CString};

    use crate::{_box, _secret_box, _unbox, _unsecret_box, hash, verify};

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
    }
    #[test]
    fn data_into_and_out_secret_box() {
        let key = "RGLSbtumR+PLDGKX2/WVqfnPL/rglGyRs0U1DQppJm8=";
        let key_ptr = CString::new(key).expect("Failed");
        let nonce = "ApAsVLwI0S+2RNpxdblflLiVF4Sp3Dlk";
        let nonce_ptr = CString::new(nonce).expect("Failed");

        let message = "deno!";
        let message_ptr = CString::new(message).expect("Failed");

        let _out = _secret_box(key_ptr.as_ptr(), nonce_ptr.as_ptr(), message_ptr.as_ptr());
        let out_str = unsafe {
            CStr::from_ptr(_out)
                .to_str()
                .expect("Error exporting the result")
        };
        assert_eq!(
            out_str, "tIT+cUYJiozEPwb9BwY/1wIrolhY",
            "Encrypted data does not match"
        );
        let out_ptr = CString::new(out_str).expect("Failed converting to ptr");
        let to_verify = _unsecret_box(key_ptr.as_ptr(), nonce_ptr.as_ptr(), out_ptr.as_ptr());
        let to_verify_src = unsafe {
            CStr::from_ptr(to_verify)
                .to_str()
                .expect("Error exporting the result")
        };
        assert_eq!(to_verify_src, message, "Unencrypted data does not match");
    }
    #[test]
    fn data_into_box() {
        let peer_public_key = "WwNYorEmuuVFQ5MroQHmvunWk8pK7Pev7vOF2F0rti8=";
        let peer_public_key_ptr = CString::new(peer_public_key).expect("");
        let self_private_key = "S/tr7AxAFnt376o7VTMt5vVQ8sqPDzNMjOQ2hOWCB9I=";
        let self_private_key_ptr = CString::new(self_private_key).expect("");
        // Self public key 2MKROc1DwI42Zi4nthGmECkT67aLs30DA1TpyPNx4S0=
        let nonce = "ApAsVLwI0S+2RNpxdblflLiVF4Sp3Dlk";
        let nonce_ptr = CString::new(nonce).expect("Failed");
        let message = "deno!";
        let message_ptr = CString::new(message).expect("Failed");

        let _out = _box(
            peer_public_key_ptr.as_ptr(),
            self_private_key_ptr.as_ptr(),
            nonce_ptr.as_ptr(),
            message_ptr.as_ptr(),
        );
        let out_str = unsafe {
            CStr::from_ptr(_out)
                .to_str()
                .expect("Error exporting the result")
        };

        assert_eq!(out_str, "K5lmw6xAfEflb0XT9kDXo4L06qpr")
    }
    #[test]
    fn data_into_and_out_box() {
        let peer_public_key = "WwNYorEmuuVFQ5MroQHmvunWk8pK7Pev7vOF2F0rti8=";
        let peer_public_key_ptr = CString::new(peer_public_key).expect("");
        let self_private_key = "S/tr7AxAFnt376o7VTMt5vVQ8sqPDzNMjOQ2hOWCB9I=";
        let self_private_key_ptr = CString::new(self_private_key).expect("");
        // Self public key 2MKROc1DwI42Zi4nthGmECkT67aLs30DA1TpyPNx4S0=
        let nonce = "ApAsVLwI0S+2RNpxdblflLiVF4Sp3Dlk";
        let nonce_ptr = CString::new(nonce).expect("Failed");
        let message = "deno!";
        let message_ptr = CString::new(message).expect("Failed");

        let _out = _box(
            peer_public_key_ptr.as_ptr(),
            self_private_key_ptr.as_ptr(),
            nonce_ptr.as_ptr(),
            message_ptr.as_ptr(),
        );
        let out_str = unsafe {
            CStr::from_ptr(_out)
                .to_str()
                .expect("Error exporting the result")
        };

        assert_eq!(out_str, "K5lmw6xAfEflb0XT9kDXo4L06qpr");

        let out_ptr = CString::new(out_str).expect("Failed converting to ptr");

        let to_verify = _unbox(
            peer_public_key_ptr.as_ptr(),
            self_private_key_ptr.as_ptr(),
            nonce_ptr.as_ptr(),
            out_ptr.as_ptr(),
        );
        let to_verify_src = unsafe {
            CStr::from_ptr(to_verify)
                .to_str()
                .expect("Error exporting the result")
        };
        assert_eq!(to_verify_src, message, "Unencrypted data does not match");
    }
}
