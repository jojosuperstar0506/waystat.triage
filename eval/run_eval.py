"""Evaluation script.

Runs the full triage pipeline against the synthetic dataset and compares
results to hand-labeled ground truth. Outputs accuracy metrics per stage.

Run from project root:
    python eval/run_eval.py

Outputs:
  - eval/results.json          — full per-email results
  - eval/eval_summary.md       — human-readable summary report
"""

import json
import sys
import time
from pathlib import Path
from collections import defaultdict

# Add backend to path so we can import the pipeline
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from anthropic import Anthropic
from app.triage import triage_email


def load_data():
    root = Path(__file__).resolve().parent.parent

    emails = []
    with open(root / "data" / "synthetic_emails.json") as f:
        for e in json.load(f)["emails"]:
            e.setdefault("source", "external")
            emails.append(e)

    try:
        with open(root / "data" / "synthetic_internal_items.json") as f:
            for item in json.load(f)["items"]:
                item.setdefault("source", "internal")
                item.setdefault("to", "ryan@waystationai.com")
                emails.append(item)
    except FileNotFoundError:
        pass

    labels = {}
    with open(root / "data" / "ground_truth_labels.json") as f:
        for l in json.load(f)["labels"]:
            l.setdefault("source", "external")
            labels[l["email_id"]] = l

    try:
        with open(root / "data" / "ground_truth_labels_internal.json") as f:
            for l in json.load(f)["labels"]:
                l.setdefault("source", "internal")
                labels[l["email_id"]] = l
    except FileNotFoundError:
        pass

    return emails, labels


def run_eval():
    emails, ground_truth = load_data()
    client = Anthropic()

    per_email_results = []
    classification_correct = 0
    source_correct = 0
    needs_ryan_correct = 0
    priority_in_range = 0
    action_correct = 0
    by_category_correct = defaultdict(lambda: {"correct": 0, "total": 0})
    by_source_correct = defaultdict(lambda: {
        "classification_correct": 0,
        "needs_ryan_correct": 0,
        "priority_in_range": 0,
        "total": 0,
    })

    confusion = defaultdict(lambda: defaultdict(int))  # actual -> predicted -> count

    start = time.time()
    for email in emails:
        eid = email["id"]
        truth = ground_truth.get(eid)
        if not truth:
            print(f"[SKIP] {eid} — no ground truth label")
            continue

        try:
            result = triage_email(client, email, email_id=eid)
        except Exception as e:
            print(f"[FAIL] {eid}: {e}")
            per_email_results.append({"email_id": eid, "ok": False, "error": str(e)})
            continue

        # Source accuracy
        pred_source = result.classification.source
        true_source = truth["source"]
        src_ok = (pred_source == true_source)
        if src_ok:
            source_correct += 1

        # Classification accuracy
        pred_cat = result.classification.category
        true_cat = truth["category"]
        cat_ok = (pred_cat == true_cat)
        if cat_ok:
            classification_correct += 1
        by_category_correct[true_cat]["total"] += 1
        if cat_ok:
            by_category_correct[true_cat]["correct"] += 1
        confusion[true_cat][pred_cat] += 1

        # needs_ryan accuracy
        nr_ok = (result.priority.needs_ryan == truth["needs_ryan"])
        if nr_ok:
            needs_ryan_correct += 1

        # Priority in expected range
        lo, hi = truth["expected_priority_range"]
        pr_ok = (lo <= result.priority.score <= hi)
        if pr_ok:
            priority_in_range += 1

        # Source-bucketed metrics
        by_source_correct[true_source]["total"] += 1
        if cat_ok:
            by_source_correct[true_source]["classification_correct"] += 1
        if nr_ok:
            by_source_correct[true_source]["needs_ryan_correct"] += 1
        if pr_ok:
            by_source_correct[true_source]["priority_in_range"] += 1

        # Action correctness (exact match)
        act_ok = (result.drafted_response.suggested_action == truth["expected_action"])
        if act_ok:
            action_correct += 1

        per_email_results.append({
            "email_id": eid,
            "ok": True,
            "predicted": {
                "source": pred_source,
                "category": pred_cat,
                "needs_ryan": result.priority.needs_ryan,
                "priority_score": result.priority.score,
                "action": result.drafted_response.suggested_action,
                "classification_confidence": result.classification.confidence,
            },
            "truth": {
                "source": true_source,
                "category": true_cat,
                "needs_ryan": truth["needs_ryan"],
                "priority_range": truth["expected_priority_range"],
                "action": truth["expected_action"],
            },
            "correct": {
                "source": src_ok,
                "category": cat_ok,
                "needs_ryan": nr_ok,
                "priority_in_range": pr_ok,
                "action": act_ok,
            },
            "notes": truth.get("notes"),
            "draft_body": result.drafted_response.draft_body,
            "classification_reasoning": result.classification.reasoning,
            "priority_reasoning": result.priority.reasoning,
        })

    elapsed = time.time() - start
    n = len([r for r in per_email_results if r.get("ok")])

    summary = {
        "n_emails": n,
        "elapsed_seconds": round(elapsed, 1),
        "metrics": {
            "source_accuracy": round(source_correct / n, 3) if n else 0,
            "classification_accuracy": round(classification_correct / n, 3) if n else 0,
            "needs_ryan_accuracy": round(needs_ryan_correct / n, 3) if n else 0,
            "priority_in_range_rate": round(priority_in_range / n, 3) if n else 0,
            "action_exact_match_rate": round(action_correct / n, 3) if n else 0,
        },
        "by_source_metrics": {
            src: {
                "total": v["total"],
                "classification_accuracy": round(v["classification_correct"] / v["total"], 3) if v["total"] else 0,
                "needs_ryan_accuracy": round(v["needs_ryan_correct"] / v["total"], 3) if v["total"] else 0,
                "priority_in_range_rate": round(v["priority_in_range"] / v["total"], 3) if v["total"] else 0,
            }
            for src, v in by_source_correct.items()
        },
        "per_category_accuracy": {
            cat: {
                "correct": v["correct"],
                "total": v["total"],
                "accuracy": round(v["correct"] / v["total"], 3) if v["total"] else 0,
            }
            for cat, v in by_category_correct.items()
        },
        "confusion_matrix": {k: dict(v) for k, v in confusion.items()},
    }

    out_dir = Path(__file__).resolve().parent
    with open(out_dir / "results.json", "w") as f:
        json.dump({"summary": summary, "per_email": per_email_results}, f, indent=2)

    # Markdown report
    md = render_markdown(summary, per_email_results)
    with open(out_dir / "eval_summary.md", "w") as f:
        f.write(md)

    print("\n" + "=" * 60)
    print("EVAL COMPLETE")
    print("=" * 60)
    print(f"Emails: {n}")
    print(f"Time: {elapsed:.1f}s")
    print()
    print(f"Classification accuracy: {summary['metrics']['classification_accuracy']:.1%}")
    print(f"needs_ryan accuracy:     {summary['metrics']['needs_ryan_accuracy']:.1%}")
    print(f"Priority in-range rate:  {summary['metrics']['priority_in_range_rate']:.1%}")
    print(f"Action exact-match rate: {summary['metrics']['action_exact_match_rate']:.1%}")
    print()
    print(f"Full results: {out_dir / 'results.json'}")
    print(f"Report:       {out_dir / 'eval_summary.md'}")


def render_markdown(summary: dict, per_email: list[dict]) -> str:
    lines = ["# Waystation Triage — Eval Report", ""]
    lines.append(f"**N**: {summary['n_emails']} emails  ")
    lines.append(f"**Time**: {summary['elapsed_seconds']}s  ")
    lines.append(f"**Model**: claude-sonnet-4-6")
    lines.append("")
    lines.append("## Summary metrics")
    lines.append("")
    lines.append("| Metric | Score |")
    lines.append("|---|---|")
    for k, v in summary["metrics"].items():
        lines.append(f"| {k} | {v:.1%} |")
    lines.append("")
    lines.append("## Accuracy by category")
    lines.append("")
    lines.append("| Category | Correct | Total | Accuracy |")
    lines.append("|---|---|---|---|")
    for cat, v in sorted(summary["per_category_accuracy"].items()):
        lines.append(f"| {cat} | {v['correct']} | {v['total']} | {v['accuracy']:.1%} |")
    lines.append("")
    lines.append("## Misclassifications (where the system disagreed with ground truth)")
    lines.append("")
    misses = [r for r in per_email if r.get("ok") and not r["correct"]["category"]]
    if not misses:
        lines.append("_None — classification was perfect on this run._")
    else:
        for r in misses:
            lines.append(f"### {r['email_id']}")
            lines.append(f"- **Predicted**: {r['predicted']['category']} (conf {r['predicted']['classification_confidence']:.2f})")
            lines.append(f"- **Truth**: {r['truth']['category']}")
            lines.append(f"- **Model reasoning**: {r['classification_reasoning']}")
            lines.append(f"- **Label notes**: {r['notes']}")
            lines.append("")
    lines.append("## Priority calibration misses")
    lines.append("")
    pr_misses = [r for r in per_email if r.get("ok") and not r["correct"]["priority_in_range"]]
    if not pr_misses:
        lines.append("_All priority scores fell within expected ranges._")
    else:
        for r in pr_misses:
            lo, hi = r["truth"]["priority_range"]
            lines.append(f"- **{r['email_id']}**: predicted {r['predicted']['priority_score']}, expected [{lo}, {hi}]. Reasoning: {r['priority_reasoning']}")
        lines.append("")

    return "\n".join(lines)


if __name__ == "__main__":
    run_eval()
