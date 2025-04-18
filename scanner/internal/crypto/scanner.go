package crypto

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// Result represents a vulnerability finding
type Result struct {
	File      string `json:"file"`
	Algorithm string `json:"algorithm"`
	Type      string `json:"type"`
	Line      int    `json:"line"`
	Method    string `json:"method"`
	Risk      string `json:"risk"` // Added risk level
}

// DetectionRule defines a pattern to detect vulnerable crypto
type DetectionRule struct {
	AlgorithmType string
	AlgorithmName string
	Method        string
	Pattern       string
	RiskLevel     string // Added risk level
}

// Scanner handles the scanning process
type Scanner struct {
	Verbose bool
	Rules   []DetectionRule
}

// NewScanner creates a new scanner instance
func NewScanner(verbose bool) *Scanner {
	return &Scanner{
		Verbose: verbose,
		Rules: []DetectionRule{
			{"Standard", "RSA", "Function Name", `RSA\.encrypt|RSACipher|rsa\.newkeys|KeyPairGenerator\.getInstance\("RSA"\)|crypto\.generateKeyPairSync\('rsa'`, "High"},
			{"Standard", "RSA", "Import Statement", `from cryptography\.hazmat\.primitives\.asymmetric import rsa|import rsa|import java.security.KeyPairGenerator|const crypto = require\('crypto'\)`, "High"},
			{"Standard", "RSA", "Configuration", `algorithm = "RSA"|keyGen\.initialize\(2048\)`, "High"},
			{"Standard", "AES-128", "Function Name", `AES\.encrypt|AESCipher|Cipher\.getInstance\("AES|crypto\.createCipheriv\('aes-128-cbc'`, "Medium"},
			{"Standard", "AES-128", "Import Statement", `from cryptography\.hazmat\.primitives\.ciphers import Cipher, algorithms|import javax.crypto.Cipher|const crypto = require\('crypto'\)`, "Medium"},
			{"Standard", "AES-128", "Configuration", `cipher = "AES"|algorithms\.AES\(key_128|KeyGenerator\.getInstance\("AES"\)\.init\(128\)`, "Medium"},
			{"Standard", "ECC", "Function Name", `ECDSA\.sign|ECCCipher|SigningKey\.generate`, "High"},
			{"Standard", "ECC", "Import Statement", `from cryptography\.hazmat\.primitives\.asymmetric import ec|from ecdsa import SigningKey`, "High"},
			{"Standard", "ECC", "Configuration", `curve = "secp256r1"|curve = "prime256v1"`, "High"},
			{"Standard", "DH", "Function Name", `DHParameterSpec|DHGenParameterSpec|DiffieHellmanGroup|createDiffieHellman`, "High"},
			{"Standard", "DH", "Import Statement", `import javax.crypto.spec.DHParameterSpec|const dh = crypto.createDiffieHellman`, "High"},
			{"PostQuantum", "CRYSTALS-Kyber", "Import Statement", `import pqcrypto.kem.kyber|from kyber import Kyber`, "Low"},
			{"PostQuantum", "CRYSTALS-Dilithium", "Import Statement", `import pqcrypto.sign.dilithium|from dilithium import Dilithium`, "Low"},
		},
	}
}

// ScanDirectory scans all files in a directory recursively
func (s *Scanner) ScanDirectory(dir string) []Result {
	var results []Result
	
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}
		
		// Skip certain directories and file types
		if s.shouldSkip(path) {
			return nil
		}
		
		if s.Verbose {
			fmt.Printf("Scanning file: %s\n", path)
		}
		
		fileResults := s.ScanFile(path)
		results = append(results, fileResults...)
		
		if s.Verbose && len(fileResults) > 0 {
			fmt.Printf("Found %d vulnerabilities in file: %s\n", len(fileResults), path)
		}
		
		return nil
	})
	
	if err != nil {
		fmt.Printf("Error reading directory: %v\n", err)
	}
	
	return results
}

// ScanFile scans a single file for vulnerable crypto
func (s *Scanner) ScanFile(filePath string) []Result {
	var results []Result

	// Skip certain file types
	if s.shouldSkip(filePath) {
		return results
	}

	content, err := os.ReadFile(filePath)
	if err != nil {
		fmt.Printf("Error reading file %s: %v\n", filePath, err)
		return results
	}

	lines := strings.Split(string(content), "\n")
	for i, line := range lines {
		for _, rule := range s.Rules {
			if match, _ := regexp.MatchString(rule.Pattern, line); match {
				results = append(results, Result{
					File:      filePath,
					Algorithm: rule.AlgorithmName,
					Type:      rule.AlgorithmType,
					Line:      i + 1,
					Method:    rule.Method,
					Risk:      rule.RiskLevel,
				})
				
				if s.Verbose {
					fmt.Printf("Match found: %s (Line %d) Method: %s Risk: %s\n", 
						rule.AlgorithmName, i+1, rule.Method, rule.RiskLevel)
				}
			}
		}
	}

	return results
}

// shouldSkip determines if a file should be skipped during scanning
func (s *Scanner) shouldSkip(path string) bool {
	// Skip node_modules, .git, etc.
	if strings.Contains(path, "node_modules") || 
	   strings.Contains(path, ".git") ||
	   strings.Contains(path, "__pycache__") ||
	   strings.Contains(path, "vendor") {
		return true
	}
	
	// Only scan certain file extensions
	ext := strings.ToLower(filepath.Ext(path))
	validExts := []string{".go", ".java", ".js", ".ts", ".py", ".php", ".rb", ".c", ".cpp", ".h", ".cs", ".swift"}
	
	for _, validExt := range validExts {
		if ext == validExt {
			return false
		}
	}
	
	return true
}
