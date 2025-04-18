package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"

	"qvs-pro/scanner/internal/crypto"
	"qvs-pro/scanner/internal/utils"
)

const version = "1.0.0"

func main() {
	// Define command-line flags
	dirToScan := flag.String("dir", "", "Directory or file to scan (default: current directory)")
	outputJSON := flag.Bool("json", false, "Output results as JSON")
	verbose := flag.Bool("verbose", false, "Enable verbose output")
	versionFlag := flag.Bool("version", false, "Print the version")

	// Parse command-line flags
	flag.Parse()

	// Check if version flag is set
	if *versionFlag {
		fmt.Printf("qvs-pro scanner v%s\n", version)
		return
	}

	// If no directory specified, use current directory
	if *dirToScan == "" {
		currentDir, err := os.Getwd()
		if err != nil {
			fmt.Printf("Error getting current directory: %v\n", err)
			os.Exit(1)
		}
		*dirToScan = currentDir
	}

	absPath, err := filepath.Abs(*dirToScan)
	if err != nil {
		fmt.Printf("Error resolving path: %v\n", err)
		os.Exit(1)
	}

	if *verbose {
		fmt.Printf("Scanning: %s\n", absPath)
	}

	fileInfo, err := os.Stat(absPath)
	if err != nil {
		fmt.Printf("Error reading path: %v\n", err)
		os.Exit(1)
	}

	var results []crypto.Result
	scanner := crypto.NewScanner(*verbose)

	if fileInfo.IsDir() {
		results = scanner.ScanDirectory(absPath)
	} else {
		results = scanner.ScanFile(absPath)
	}

	if *verbose {
		fmt.Printf("\nScan complete. Found %d potential vulnerabilities.\n\n", len(results))
	}

	// Output results
	if *outputJSON {
		utils.OutputJSON(results)
	} else {
		utils.OutputText(results)
	}
}
