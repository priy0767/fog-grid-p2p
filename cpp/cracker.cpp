#include <emscripten.h>
#include <string.h>
#include <math.h>

extern "C" {

    // A simple visual proof that C++ is running
    // This function just adds numbers, but we call it from JS to test WASM
    EMSCRIPTEN_KEEPALIVE
    int test_connection(int a, int b) {
        return a + b;
    }

    // THE REAL WORK: MD5 Brute Force Logic (Simplified for Demo)
    // In a real hackathon, we would import a tiny md5.h library.
    // For this demo, we will simulate the "work" to show the CPU load.
    
    EMSCRIPTEN_KEEPALIVE
    int crack_password(int start_index, int end_index, int target_hash_simulated) {
        
        // Loop through the chunk assigned to this worker
        for (int i = start_index; i < end_index; i++) {
            
            // 1. Simulate heavy hashing math (burn CPU cycles)
            double math_heavy = sin(i) * cos(i) * tan(i);
            
            // 2. Check if this index is the "password"
            // In the real demo, "123456" is the magic number (the password)
            if (i == target_hash_simulated) {
                return i; // FOUND IT!
            }
        }
        
        return -1; // Not found in this chunk
    }
}