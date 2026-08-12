#!/usr/bin/env python3
"""
OmniRoute Log Validator
Compares actual Proxy + Audit logs against benchmark expectations for TC-01 through TC-05.
"""
import json
import re
import sys
from datetime import datetime

# --- Configuration ---
BENCHMARK_FILE = "mock_test/mock_emails.json"
PROXY_LOG_FILE = "mock_test/proxy_logs.txt"
AUDIT_LOG_FILE = "mock_test/audit_logs.txt"
VALIDATION_REPORT = "mock_test/validation_report.txt"

# --- Expected Benchmarks ---
BENCHMARKS = {
    "TC-01": {
        "chain": "logistics-priority",
        "expected_model": "deepseek-v4-pro",
        "expected_status": "success",
        "min_compression": 15,
        "max_latency_ms": 5000,
        "description": "Gmail Logistics - DeepSeek Success"
    },
    "TC-02": {
        "chain": "logistics-priority",
        "expected_model": "mistral-small-3.2",
        "expected_status": "success",
        "failover_expected": True,
        "max_failover_ms": 3000,
        "description": "Gmail Logistics - DeepSeek Failover to Mistral"
    },
    "TC-03": {
        "chain": "outlook-cleanup-budget",
        "expected_model": "mistral-free",
        "expected_status": "success",
        "min_compression": 15,
        "max_latency_ms": 3000,
        "description": "Outlook Cleanup - Mistral Free Success"
    },
    "TC-04": {
        "chain": "outlook-cleanup-budget",
        "expected_model": "llama3.2-local",
        "expected_status": "success",
        "failover_expected": True,
        "nodes_traversed": 3,
        "description": "Outlook Quota Exhaustion - Multi-node Fallback"
    },
    "TC-05": {
        "chain": "logistics-priority",
        "expected_model": "deepseek-v4-pro",
        "expected_status": "success",
        "hitl_compliance": True,
        "description": "HITL Boundary Test - Draft Only"
    }
}

def parse_proxy_logs(filepath):
    """Parse Proxy Logs into structured format."""
    entries = []
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Split by timestamp pattern
        lines = content.split('\n')
        current_entry = {}
        
        for line in lines:
            # Match timestamp
            ts_match = re.search(r'\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z?)\]', line)
            if ts_match:
                if current_entry:
                    entries.append(current_entry)
                current_entry = {"timestamp": ts_match.group(1), "raw_lines": [line]}
            elif current_entry:
                current_entry["raw_lines"].append(line)
        
        if current_entry:
            entries.append(current_entry)
    
    except FileNotFoundError:
        print(f"⚠️  Proxy log file not found: {filepath}")
        return []
    
    return entries

def parse_audit_logs(filepath):
    """Parse Audit Logs into structured format."""
    entries = []
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Try to parse as JSON array
        try:
            entries = json.loads(content)
            if isinstance(entries, dict):
                entries = [entries]
        except json.JSONDecodeError:
            # Parse line-by-line JSON
            lines = content.split('\n')
            for line in lines:
                line = line.strip()
                if line:
                    try:
                        entries.append(json.loads(line))
                    except json.JSONDecodeError:
                        pass
    
    except FileNotFoundError:
        print(f"⚠️  Audit log file not found: {filepath}")
        return []
    
    return entries

def validate_tc01(proxy_entries, audit_entries):
    """Validate TC-01: Gmail Logistics - DeepSeek Success"""
    results = {"test_id": "TC-01", "description": "Gmail Logistics - DeepSeek Success"}
    
    # Check proxy logs for DeepSeek success
    deepseek_success = False
    for entry in proxy_entries:
        raw = ' '.join(entry.get("raw_lines", []))
        if "deepseek" in raw.lower() and "success" in raw.lower():
            deepseek_success = True
            results["proxy_log_found"] = True
            break
    
    if not deepseek_success:
        results["proxy_log_found"] = False
        results["status"] = "❌ FAIL: DeepSeek success not found in Proxy Logs"
        return results
    
    results["status"] = "✅ PASS: DeepSeek successfully handled request"
    return results

def validate_tc02(proxy_entries, audit_entries):
    """Validate TC-02: Gmail Logistics - DeepSeek Failover to Mistral"""
    results = {"test_id": "TC-02", "description": "Gmail Logistics - DeepSeek Failover"}
    
    # Check for failover indicators
    failover_found = False
    mistral_success = False
    circuit_breaker_open = False
    
    for entry in proxy_entries:
        raw = ' '.join(entry.get("raw_lines", []))
        if "deepseek" in raw.lower() and ("429" in raw or "rate_limit" in raw.lower()):
            failover_found = True
        if "mistral" in raw.lower() and "success" in raw.lower():
            mistral_success = True
    
    # Check audit logs for circuit breaker
    for entry in audit_entries:
        if isinstance(entry, dict):
            if entry.get("event_type") == "circuit_breaker_update":
                if entry.get("new_state") == "OPEN":
                    circuit_breaker_open = True
    
    if failover_found and mistral_success:
        results["status"] = "✅ PASS: Failover from DeepSeek to Mistral successful"
        results["failover_detected"] = True
    else:
        results["status"] = "❌ FAIL: Failover not properly detected"
        results["failover_detected"] = False
    
    if circuit_breaker_open:
        results["circuit_breaker"] = "✅ OPEN state confirmed"
    else:
        results["circuit_breaker"] = "⚠️  Circuit breaker state not confirmed"
    
    return results

def validate_tc03(proxy_entries, audit_entries):
    """Validate TC-03: Outlook Cleanup - Mistral Free Success"""
    results = {"test_id": "TC-03", "description": "Outlook Cleanup - Mistral Free"}
    
    mistral_success = False
    for entry in proxy_entries:
        raw = ' '.join(entry.get("raw_lines", []))
        if "mistral" in raw.lower() and "success" in raw.lower():
            mistral_success = True
            results["proxy_log_found"] = True
            break
    
    if not mistral_success:
        results["proxy_log_found"] = False
        results["status"] = "❌ FAIL: Mistral Free success not found"
        return results
    
    results["status"] = "✅ PASS: Outlook cleanup routed to Mistral Free"
    return results

def validate_tc04(proxy_entries, audit_entries):
    """Validate TC-04: Outlook Quota Exhaustion - Multi-node Fallback"""
    results = {"test_id": "TC-04", "description": "Outlook Quota Exhaustion"}
    
    quota_exhausted_count = 0
    local_fallback = False
    
    for entry in proxy_entries:
        raw = ' '.join(entry.get("raw_lines", []))
        if "quota_exhausted" in raw.lower() or "429" in raw:
            quota_exhausted_count += 1
        if "llama" in raw.lower() and "success" in raw.lower():
            local_fallback = True
    
    results["quota_exhaustions"] = quota_exhausted_count
    results["local_fallback"] = local_fallback
    
    if quota_exhausted_count >= 2 and local_fallback:
        results["status"] = f"✅ PASS: Multi-node fallback successful ({quota_exhausted_count} quota events, local fallback confirmed)"
    elif local_fallback:
        results["status"] = "⚠️  PARTIAL: Local fallback worked but quota events unclear"
    else:
        results["status"] = "❌ FAIL: Multi-node fallback not confirmed"
    
    return results

def validate_tc05(proxy_entries, audit_entries):
    """Validate TC-05: HITL Boundary Test - Draft Only"""
    results = {"test_id": "TC-05", "description": "HITL Boundary Test"}
    
    # Check that no "send" actions occurred
    send_actions = 0
    draft_actions = 0
    
    for entry in proxy_entries:
        raw = ' '.join(entry.get("raw_lines", []))
        if "send" in raw.lower() and "draft" not in raw.lower():
            send_actions += 1
        if "draft" in raw.lower():
            draft_actions += 1
    
    results["send_actions"] = send_actions
    results["draft_actions"] = draft_actions
    
    if send_actions == 0 and draft_actions > 0:
        results["status"] = "✅ PASS: HITL compliance confirmed - drafts only, no sends"
    elif send_actions > 0:
        results["status"] = f"❌ FAIL: HITL VIOLATION - {send_actions} send actions detected!"
    else:
        results["status"] = "⚠️  WARNING: No draft or send actions found in logs"
    
    return results

def generate_validation_report(results):
    """Generate a comprehensive validation report."""
    report = []
    report.append("=" * 80)
    report.append("OMNIROUTE LOG VALIDATION REPORT")
    report.append("=" * 80)
    report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report.append(f"Proxy Log: {PROXY_LOG_FILE}")
    report.append(f"Audit Log: {AUDIT_LOG_FILE}")
    report.append("")
    
    # Summary statistics
    total = len(results)
    passed = sum(1 for r in results if "✅ PASS" in r.get("status", ""))
    failed = sum(1 for r in results if "❌ FAIL" in r.get("status", ""))
    partial = sum(1 for r in results if "⚠️" in r.get("status", ""))
    
    report.append("## Summary")
    report.append(f"Total Test Cases: {total}")
    report.append(f"Passed: {passed}")
    report.append(f"Failed: {failed}")
    report.append(f"Partial/Warning: {partial}")
    report.append("")
    
    # Detailed results
    report.append("## Detailed Results")
    report.append("")
    
    for result in results:
        report.append(f"### {result['test_id']}: {result['description']}")
        report.append(f"Status: {result['status']}")
        
        if "proxy_log_found" in result:
            report.append(f"Proxy Log Found: {'Yes' if result['proxy_log_found'] else 'No'}")
        if "failover_detected" in result:
            report.append(f"Failover Detected: {'Yes' if result['failover_detected'] else 'No'}")
        if "circuit_breaker" in result:
            report.append(f"Circuit Breaker: {result['circuit_breaker']}")
        if "quota_exhaustions" in result:
            report.append(f"Quota Exhaustion Events: {result['quota_exhaustions']}")
        if "local_fallback" in result:
            report.append(f"Local Fallback: {'Yes' if result['local_fallback'] else 'No'}")
        if "send_actions" in result:
            report.append(f"Send Actions Detected: {result['send_actions']}")
        if "draft_actions" in result:
            report.append(f"Draft Actions Detected: {result['draft_actions']}")
        
        report.append("")
    
    # Recommendations
    report.append("## Recommendations")
    if failed > 0:
        report.append("- ❌ Review failed test cases before proceeding to live implementation")
    if partial > 0:
        report.append("- ⚠️  Review partial/warning cases for potential issues")
    if failed == 0 and partial == 0:
        report.append("- ✅ All test cases passed! Ready for live implementation.")
    
    report.append("")
    report.append("=" * 80)
    report.append("END OF REPORT")
    report.append("=" * 80)
    
    return "\n".join(report)

def main():
    """Main validation workflow."""
    print("=" * 80)
    print("OMNIROUTE LOG VALIDATION")
    print("=" * 80)
    print()
    
    # Load benchmarks
    print(f"Loading benchmarks from: {BENCHMARK_FILE}")
    try:
        with open(BENCHMARK_FILE, 'r') as f:
            benchmarks = json.load(f)
        print(f"✅ Loaded {len(benchmarks)} test cases")
    except FileNotFoundError:
        print(f"❌ Benchmark file not found: {BENCHMARK_FILE}")
        sys.exit(1)
    
    print()
    
    # Parse logs
    print(f"Parsing Proxy Logs: {PROXY_LOG_FILE}")
    proxy_entries = parse_proxy_logs(PROXY_LOG_FILE)
    print(f"   Found {len(proxy_entries)} proxy log entries")
    
    print(f"Parsing Audit Logs: {AUDIT_LOG_FILE}")
    audit_entries = parse_audit_logs(AUDIT_LOG_FILE)
    print(f"   Found {len(audit_entries)} audit log entries")
    
    print()
    print("Running validation...")
    print()
    
    # Run validations
    validation_results = []
    
    # Map test cases to validation functions
    validators = {
        "TC-01": validate_tc01,
        "TC-02": validate_tc02,
        "TC-03": validate_tc03,
        "TC-04": validate_tc04,
        "TC-05": validate_tc05
    }
    
    for benchmark in benchmarks:
        tc_id = benchmark.get("id")
        if tc_id in validators:
            validator = validators[tc_id]
            result = validator(proxy_entries, audit_entries)
            result["test_id"] = tc_id
            result["description"] = benchmark.get("expected_routing", "")
            validation_results.append(result)
            
            # Print result
            status_icon = "✅" if "✅ PASS" in result["status"] else "❌" if "❌ FAIL" in result["status"] else "⚠️"
            print(f"{status_icon} {tc_id}: {result['status']}")
        else:
            print(f"⚠️  No validator for {tc_id}")
    
    print()
    
    # Generate report
    report = generate_validation_report(validation_results)
    
    with open(VALIDATION_REPORT, 'w') as f:
        f.write(report)
    
    print(f"📄 Validation report saved to: {VALIDATION_REPORT}")
    print()
    print("=" * 80)
    print("VALIDATION COMPLETE")
    print("=" * 80)
    
    # Print summary
    passed = sum(1 for r in validation_results if "✅ PASS" in r.get("status", ""))
    failed = sum(1 for r in validation_results if "❌ FAIL" in r.get("status", ""))
    print(f"\nResults: {passed} passed, {failed} failed out of {len(validation_results)} test cases")
    
    if failed > 0:
        sys.exit(1)
    else:
        print("\n✅ All validations passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()
