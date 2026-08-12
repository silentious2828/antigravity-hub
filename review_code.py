#!/usr/bin/env python3
"""
Code Reviewer Script for Kilo Projects
Validates Python files, checks imports, tests, and documentation completeness.
"""

import ast
import json
import os
import sys


def find_project_python_files(root_dir):
    """Find all .py files in the project, excluding venv and __pycache__."""
    py_files = []
    
    # Check root level .py files
    try:
        for f in os.listdir(root_dir):
            fpath = os.path.join(root_dir, f)
            if os.path.isfile(fpath) and f.endswith('.py') and not f.startswith('.'):
                # Skip venv-related files at root
                if '.venv' not in fpath and 'supply-chain-api/.venv' not in fpath:
                    py_files.append(fpath)
    except FileNotFoundError:
        pass
    
    # Check subdirectories (excluding venv)
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip .venv directories
        dirnames[:] = [d for d in dirnames if d != '.venv']
        for f in filenames:
            if f.endswith('.py'):
                full_path = os.path.join(dirpath, f)
                # Skip venv/lib paths
                if '.venv' not in full_path and 'venv/lib' not in full_path:
                    py_files.append(full_path)
    
    return py_files


def check_syntax(filepath):
    """Check Python syntax validity."""
    try:
        with open(filepath, 'r') as f:
            source = f.read()
        ast.parse(source)
        return True, "valid syntax"
    except SyntaxError as e:
        return False, f"SyntaxError: {e.msg} at line {e.lineno}"
    except Exception as e:
        return False, f"Error: {e}"


def check_imports(filepath):
    """Check that imports can be parsed."""
    try:
        with open(filepath, 'r') as f:
            source = f.read()
        tree = ast.parse(source)
        imports = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append(alias.name)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.append(node.module)
        return True, f"Found {len(imports)} import statements"
    except Exception as e:
        return False, f"Parse error: {e}"


def check_test_file(filepath):
    """Check if file is a test file."""
    basename = os.path.basename(filepath)
    if basename.startswith('test_') and basename.endswith('.py'):
        return True
    return False


def check_notebook_doc(filepath):
    """Check if .ipynb notebook has documentation cells."""
    if not filepath.endswith('.ipynb'):
        return None
    try:
        import json
        with open(filepath) as f:
            nb = json.load(f)
        code_cells = [c for c in nb['cells'] if c['cell_type'] == 'code']
        md_cells = [c for c in nb['cells'] if c['cell_type'] == 'markdown']
        return True, f"{len(nb['cells'])} cells ({len(code_cells)} code, {len(md_cells)} md)"
    except Exception as e:
        return False, f"Error: {e}"
    return None


def review_python_file(filepath):
    """Review a single Python file and return results."""
    results = {
        'file': os.path.basename(filepath),
        'syntax_valid': False,
        'imports_parsed': False,
        'is_test': False
    }
    
    # Check syntax
    valid, message = check_syntax(filepath)
    results['syntax_valid'] = valid
    if not valid:
        results['issues'] = results.get('issues', []) + [f"SYNTAX: {message}"]
    
    # Check imports
    valid, message = check_imports(filepath)
    results['imports_parsed'] = valid
    if not valid:
        results['issues'] = results.get('issues', []) + [f"IMPORTS: {message}"]
    
    # Check if test file
    if check_test_file(filepath):
        results['is_test'] = True
    
    return results


def review_project(project_root):
    """Review all Python files in a project directory."""
    results = {
        'project': os.path.basename(project_root),
        'total_files': 0,
        'valid_syntax': 0,
        'imports_parsed': 0,
        'test_files': 0,
        'issues': []
    }
    
    py_files = find_project_python_files(project_root)
    results['total_files'] = len(py_files)
    
    for filepath in py_files:
        file_result = review_python_file(filepath)
        results['valid_syntax'] += 1 if file_result['syntax_valid'] else 0
        results['imports_parsed'] += 1 if file_result['imports_parsed'] else 0
        
        if file_result['is_test']:
            results['test_files'] += 1
        
        if file_result.get('issues'):
            results['issues'].extend(file_result['issues'])
    
    # Check notebooks
    for dirpath, dirnames, filenames in os.walk(project_root):
        dirnames[:] = [d for d in dirnames if d != '.venv']
        for f in filenames:
            if f.endswith('.ipynb'):
                results['total_files'] += 1  # Count notebooks as files
                np_result = check_notebook_doc(os.path.join(dirpath, f))
                if valid:
                    pass
                else:
                    results['issues'].append(f"NOTEBOOK: {f.split('/')[-1]}: {message}")
                results['notebooks'] = results.get('notebooks', 0) + 1
    
    return results


def main():
    root = "/Volumes/Orico e7400 1TB/my-project"
    
    # Define project directories
    projects = {
        "supply_chain_optimizer": "/Volumes/Orico e7400 1TB/my-project/supply_chain_optimizer.py",
        "data_agent_kit": "/Volumes/Orico e7400 1TB/my-project/src/data_agent_kit",
        "supply-chain-api": "/Volumes/Orico e7400 1TB/my-project/supply-chain-api",
    }
    
    results = {}
    
    for name, path in projects.items():
        if os.path.exists(path):
            # For supply_chain_optimizer.py, it's a file, not a directory
            if name == "supply_chain_optimizer":
                file_result = review_python_file(path)
                results[name] = {
                    'project': name,
                    'total_files': 1 if os.path.exists(path) else 0,
                    'valid_syntax': 1 if file_result['syntax_valid'] else 0,
                    'imports_parsed': 1 if file_result['imports_parsed'] else 0,
                    'test_files': 0,
                    'issues': file_result.get('issues', [])
                }
            else:
                results[name] = review_project(path)
        else:
            results[name] = f"Directory not found: {path}"
    
    # Print results
    print("=" * 60)
    print("CODE REVIEWER: Kilo Projects Code Analysis")
    print("=" * 60)
    
    total_files = 0
    total_syntax_ok = 0
    total_imports_ok = 0
    total_tests = 0
    
    for name, result in results.items():
        print(f"\n--- {result['project']} ---")
        if isinstance(result, dict) and 'project' in result:
            # Single file project
            print(f"  File: {result['project'].split('/')[-1]}")
            print(f"  Total files: {result['total_files']}")
            print(f"  Valid syntax: {result['valid_syntax']}")
            print(f"  Imports parsed: {result['imports_parsed']}")
            print(f"  Test files: {result['test_files']}")
            if result['issues']:
                print(f"  Issues: {len(result['issues'])}")
                for issue in result['issues']:
                    print(f"    - {issue}")
            total_syntax_ok += result['valid_syntax']
            total_imports_ok += result['imports_parsed']
        else:
            print(result)
    
    print(f"\n{'=' * 60}")
    print(f"SUMMARY: {total_syntax_ok} files with valid syntax, "
          f"{total_imports_ok} imports parsed across all projects")
    print("=" * 60)


if __name__ == "__main__":
    main()
