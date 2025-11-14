#!/usr/bin/env python3
"""
Automatic QA Extraction Pipeline
1. Extract quality paragraphs from PDF
2. Refine paragraphs into chunks
3. Discover important topics
4. Extract QA pairs
"""

import sys
import os
import json
import subprocess
import tempfile

def run_command(cmd):
    """Run a command and return output."""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout, result.stderr

def main():
    if len(sys.argv) < 2:
        print("Usage: auto_qa_extractor.py <pdf_file> [quality_score] [num_qa]")
        print("Example: auto_qa_extractor.py 'Pokemon.pdf' 70 25")
        sys.exit(1)
    
    pdf_file = sys.argv[1]
    quality_score = sys.argv[2] if len(sys.argv) > 2 else "70"
    num_qa = sys.argv[3] if len(sys.argv) > 3 else "25"
    
    base_name = os.path.splitext(pdf_file)[0]
    
    print("\n" + "="*60)
    print("🤖 AUTOMATIC QA EXTRACTION PIPELINE")
    print("="*60)
    print(f"📄 PDF: {pdf_file}")
    print(f"🎯 Quality threshold: {quality_score}")
    print(f"❓ Target QA pairs: {num_qa}")
    
    # Step 1: Extract paragraphs
    print("\n📖 Step 1: Extracting quality paragraphs...")
    para_json = f"{base_name}_paragraphs.json"
    cmd = f'python3 ~/Desktop/theexpanse/backend/utils/paragraph_summary.py "{pdf_file}" "all" {quality_score} save'
    stdout, stderr = run_command(cmd)
    
    # Parse extraction stats
    if "Quality paragraphs" in stderr:
        for line in stderr.split('\n'):
            if "Quality paragraphs" in line:
                print(f"   ✓ {line.strip()}")
    
    # Step 2: Refine paragraphs
    print("\n✂️ Step 2: Refining paragraphs...")
    refined_json = f"{base_name}_refined.json"
    cmd = f'python3 ~/Desktop/theexpanse/backend/utils/paragraph_refiner.py "{para_json}" 200 50 > "{refined_json}"'
    stdout, stderr = run_command(cmd)
    
    if "Refined paragraphs:" in stderr:
        for line in stderr.split('\n'):
            if "Refined paragraphs:" in line:
                print(f"   ✓ {line.strip()}")
    
    # Step 3: Discover topics
    print("\n🔍 Step 3: Discovering important topics...")
    cmd = f'python3 ~/Desktop/theexpanse/backend/utils/discover_topics.py "{refined_json}" 10'
    stdout, stderr = run_command(cmd)
    
    # Extract discovered topics
    topics = []
    if "SUGGESTED TOPICS" in stdout:
        for line in stdout.split('\n'):
            if line.startswith('["'):
                # Parse the topic list
                import ast
                topics = ast.literal_eval(line)
                print(f"   ✓ Found topics: {', '.join(topics[:6])}")
                break
    
    if not topics:
        print("   ⚠️ No topics found, using defaults")
        topics = ["the", "and", "of", "to", "in", "a"]
    
    # Step 4: Extract QA pairs
    print("\n❓ Step 4: Extracting Q&A pairs...")
    topics_json = json.dumps(topics[:8])  # Use top 8 topics
    cmd = f"python3 ~/Desktop/theexpanse/backend/utils/qa_from_refined.py '{refined_json}' '{topics_json}' {num_qa}"
    stdout, stderr = run_command(cmd)
    
    # Parse QA results
    if "FINAL OUTPUT:" in stderr:
        for line in stderr.split('\n'):
            if "After deduplication:" in line:
                print(f"   ✓ {line.strip()}")
    
    # Save final QA pairs
    qa_json = f"{base_name}_qa.json"
    if stdout:
        try:
            qa_data = json.loads(stdout)
            with open(qa_json, 'w') as f:
                json.dump(qa_data, f, indent=2)
            print(f"   ✓ Saved {len(qa_data.get('qa_pairs', []))} Q&A pairs to {qa_json}")
            
            # Display sample QA pairs
            print("\n📝 SAMPLE Q&A PAIRS:")
            print("-"*40)
            for i, qa in enumerate(qa_data.get('qa_pairs', [])[:5], 1):
                print(f"{i}. Q: {qa['question']}")
                print(f"   A: {qa['answer_short']}")
                print()
        except:
            print("   ⚠️ Failed to parse QA results")
    
    print("="*60)
    print("✅ PIPELINE COMPLETE!")
    print(f"📁 Output files:")
    print(f"   - {para_json} (extracted paragraphs)")
    print(f"   - {refined_json} (refined paragraphs)")
    print(f"   - {qa_json} (Q&A pairs)")
    print("="*60)

if __name__ == "__main__":
    main()
