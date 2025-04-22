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
	File              string `json:"file"`
	Algorithm         string `json:"algorithm"`
	Type              string `json:"type"`
	Line              int    `json:"line"`
	Method            string `json:"method"`
	Risk              string `json:"risk"`
	VulnerabilityType string `json:"vulnerability_type"` // What type of quantum vulnerability (Shor's, Grover's, etc.)
	Description       string `json:"description"`        // Description of the vulnerability
	Recommendation    string `json:"recommendation"`     // Recommendation for remediation
}

// DetectionRule defines a pattern to detect vulnerable crypto
type DetectionRule struct {
	AlgorithmType     string
	AlgorithmName     string
	Method            string
	Pattern           string
	RiskLevel         string
	VulnerabilityType string
	Description       string
	Recommendation    string
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
			{
				"PublicKey", "RSA", "Function Name",
				`RSA\.encrypt|RSACipher|rsa\.newkeys|KeyPairGenerator\.getInstance\("RSA"\)|crypto\.generateKeyPairSync\('rsa'`,
				"High",
				"Shor's Algorithm",
				"RSA encryption is vulnerable to quantum attacks using Shor's algorithm, which can factor large integers in polynomial time",
				"Replace with quantum-resistant algorithm ML-KEM (CRYSTALS-Kyber) for key encapsulation or consider hybrid approaches",
			},
			{
				"PublicKey", "RSA", "Import Statement",
				`from cryptography\.hazmat\.primitives\.asymmetric import rsa|import rsa|import java.security.KeyPairGenerator|const crypto = require\('crypto'\)`,
				"High",
				"Shor's Algorithm",
				"RSA cryptography libraries are vulnerable to quantum attacks using Shor's algorithm",
				"Replace with NIST-standardized post-quantum cryptography libraries using ML-KEM",
			},
			{
				"PublicKey", "RSA", "Configuration",
				`algorithm = "RSA"|keyGen\.initialize\(2048\)`,
				"High",
				"Shor's Algorithm",
				"RSA key generation with any key size is vulnerable to quantum attacks",
				"Replace with ML-KEM (CRYSTALS-Kyber) with appropriate parameter sets",
			},
			{
				"SymmetricKey", "AES-128", "Function Name",
				`AES\.encrypt|AESCipher|Cipher\.getInstance\("AES|crypto\.createCipheriv\('aes-128-cbc'`,
				"Medium",
				"Grover's Algorithm",
				"AES-128 provides only 64 bits of security against quantum attacks using Grover's algorithm",
				"Upgrade to AES-256 which provides adequate security against known quantum attacks",
			},
			{
				"SymmetricKey", "AES-128", "Import Statement",
				`from cryptography\.hazmat\.primitives\.ciphers import Cipher, algorithms|import javax.crypto.Cipher|const crypto = require\('crypto'\)`,
				"Medium",
				"Grover's Algorithm",
				"Symmetric encryption libraries that use AES-128 by default offer reduced security against quantum attacks",
				"Explicitly configure the library to use AES-256 instead of AES-128",
			},
			{
				"SymmetricKey", "AES-128", "Configuration",
				`cipher = "AES"|algorithms\.AES\(key_128|KeyGenerator\.getInstance\("AES"\)\.init\(128\)`,
				"Medium",
				"Grover's Algorithm",
				"AES with 128-bit key size provides inadequate security against quantum computers",
				"Increase key size to 256 bits (AES-256) to maintain adequate security margin",
			},
			{
				"PublicKey", "ECC", "Function Name",
				`ECDSA\.sign|ECCCipher|SigningKey\.generate`,
				"High",
				"Shor's Algorithm",
				"Elliptic Curve Cryptography is vulnerable to quantum attacks using a variant of Shor's algorithm",
				"Replace with quantum-resistant ML-DSA (CRYSTALS-Dilithium) or SLH-DSA (SPHINCS+) for digital signatures",
			},
			{
				"PublicKey", "ECC", "Import Statement",
				`from cryptography\.hazmat\.primitives\.asymmetric import ec|from ecdsa import SigningKey`,
				"High",
				"Shor's Algorithm",
				"Elliptic Curve Cryptography libraries are vulnerable to quantum attacks",
				"Replace with post-quantum signature schemes like ML-DSA or SLH-DSA",
			},
			{
				"PublicKey", "ECC", "Configuration",
				`curve = "secp256r1"|curve = "prime256v1"`,
				"High",
				"Shor's Algorithm",
				"All ECC curves are vulnerable to quantum computing attacks regardless of size",
				"Replace with quantum-resistant signature schemes like ML-DSA (CRYSTALS-Dilithium)",
			},
			{
				"PublicKey", "DH", "Function Name",
				`DHParameterSpec|DHGenParameterSpec|DiffieHellmanGroup|createDiffieHellman`,
				"High",
				"Shor's Algorithm",
				"Diffie-Hellman key exchange is vulnerable to quantum attacks via the discrete logarithm problem",
				"Replace with ML-KEM (CRYSTALS-Kyber) for quantum-resistant key exchange",
			},
			{
				"PublicKey", "DH", "Import Statement",
				`import javax.crypto.spec.DHParameterSpec|const dh = crypto.createDiffieHellman`,
				"High",
				"Shor's Algorithm",
				"Diffie-Hellman library imports indicate vulnerable key exchange methods",
				"Replace with post-quantum key encapsulation mechanisms like ML-KEM",
			},
			{
				"PostQuantum", "CRYSTALS-Kyber", "Import Statement",
				`import pqcrypto.kem.kyber|from kyber import Kyber`,
				"Low",
				"Quantum-Resistant",
				"CRYSTALS-Kyber is a NIST-standardized post-quantum key encapsulation mechanism",
				"Correctly implemented, this algorithm provides resistance to known quantum attacks",
			},
			{
				"PostQuantum", "CRYSTALS-Dilithium", "Import Statement",
				`import pqcrypto.sign.dilithium|from dilithium import Dilithium`,
				"Low",
				"Quantum-Resistant",
				"CRYSTALS-Dilithium is a NIST-standardized post-quantum digital signature algorithm",
				"Correctly implemented, this algorithm provides resistance to known quantum attacks",
			},
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
					File:              filePath,
					Algorithm:         rule.AlgorithmName,
					Type:              rule.AlgorithmType,
					Line:              i + 1,
					Method:            rule.Method,
					Risk:              rule.RiskLevel,
					VulnerabilityType: rule.VulnerabilityType,
					Description:       rule.Description,
					Recommendation:    rule.Recommendation,
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
