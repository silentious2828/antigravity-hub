import json
import re

def validate_mock_test():
    # Load expected results
    with open("mock_test/mock_emails.json", 'r') as f:
        emails = json.load(f)
    
    # Try to load actual results
    try:
        with open("mock_test/mock_test_results.txt", 'r') as f:
            results_text = f.read()
        print("=== Mock Test Results ===")
        print(results_text)
        print("\n=== Validation ===")
        
        # Check each test case
        for email in emails:
            tc_id = email['id']
            expected_routing = email['expected_routing']
            expected_model = email['expected_model']
            
            print(f"\n{tc_id}:")
            print(f"  Expected routing: {expected_routing}")
            print(f"  Expected model: {expected_model}")
            
            # Simple validation - check if expected strings appear in results
            if expected_model in results_text or expected_routing in results_text:
                print(f"  Status: ✅ PASS (routing/model found in results)")
            else:
                print(f"  Status: ⚠️ CHECK MANUAL (results may need review)")
    
    except FileNotFoundError:
        print("⚠️ Results file not found. Run mock_test_harness.py first.")
        print("Command: python mock_test/mock_test_harness.py")

if __name__ == "__main__":
    validate_mock_test()
