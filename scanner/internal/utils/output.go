package utils

import (
	"encoding/json"
	"fmt"
	"os"

	"qvs-pro/scanner/internal/crypto"
)

// OutputJSON outputs scan results in JSON format
func OutputJSON(results interface{}) {
	jsonData, err := json.MarshalIndent(results, "", "  ")
	if err != nil {
		fmt.Printf("Error converting to JSON: %v\n", err)
		os.Exit(1)
	}

	fmt.Println(string(jsonData))
}

// OutputText outputs scan results in human-readable text format
func OutputText(results interface{}) {
	// Type assertion to access the Result struct fields
	typedResults, ok := results.([]crypto.Result)

	if !ok {
		fmt.Println("Error: Could not format results")
		return
	}

	if len(typedResults) == 0 {
		fmt.Println("No vulnerabilities found.")
		return
	}

	fmt.Printf("Found %d potential vulnerabilities:\n\n", len(typedResults))
	for _, result := range typedResults {
		fmt.Printf("File: %s\n", result.File)
		fmt.Printf("Algorithm: %s (%s)\n", result.Algorithm, result.Type)
		fmt.Printf("Line: %d\n", result.Line)
		fmt.Printf("Method: %s\n", result.Method)
		fmt.Printf("Risk Level: %s\n", result.Risk)
		fmt.Println("----------------------")
	}
}
