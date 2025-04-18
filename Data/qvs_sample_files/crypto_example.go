package main

import (
	"crypto/aes"
	_ "crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"fmt"
)

func main() {
	// RSA example
	privateKey, _ := rsa.GenerateKey(rand.Reader, 2048)

	// AES example
	key := make([]byte, 32)
	rand.Read(key)
	block, _ := aes.NewCipher(key)

	// SHA-256 example
	h := sha256.New()
	h.Write([]byte("hello world"))
	fmt.Printf("%x\n", h.Sum(nil))
}
