import json
import os
from datetime import datetime

LOG_DIR = "/tmp/qa-extractor-logs"

def ensure_log_dir():
    os.makedirs(LOG_DIR, exist_ok=True)

def create_session_log():
    ensure_log_dir()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    session_id = f"session_{timestamp}"
    log_file = os.path.join(LOG_DIR, f"{session_id}.json")
    
    return {
        "session_id": session_id,
        "log_file": log_file,
        "timestamp": timestamp,
        "stages": {}
    }

def log_stage(session, stage_name, data):
    if "stages" not in session:
        session["stages"] = {}
    
    session["stages"][stage_name] = {
        "timestamp": datetime.now().isoformat(),
        "data": data
    }
    
    with open(session["log_file"], "w") as f:
        json.dump(session, f, indent=2)
    
    return session

def log_sentence_processing(session, original, cleaned, focused, parsed_count):
    log_stage(session, "sentence_processing", {
        "total_sentences": original,
        "after_cleaning": cleaned,
        "after_topic_filter": focused,
        "successfully_parsed": parsed_count
    })

def log_pattern_matches(session, patterns):
    log_stage(session, "pattern_matches", patterns)

def log_quality_results(session, total, passed, failed_by_reason):
    log_stage(session, "quality_filtering", {
        "total_candidates": total,
        "passed": passed,
        "failed": len(failed_by_reason),
        "failure_reasons": failed_by_reason
    })

def log_final_output(session, qa_pairs):
    log_stage(session, "final_output", {
        "count": len(qa_pairs),
        "questions": [qa["question"] for qa in qa_pairs]
    })

def get_latest_log():
    ensure_log_dir()
    logs = [f for f in os.listdir(LOG_DIR) if f.endswith('.json')]
    if not logs:
        return None
    latest = max(logs)
    with open(os.path.join(LOG_DIR, latest)) as f:
        return json.load(f)
