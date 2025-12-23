import argparse

def score_risk(jd_text, company_archetype):
    """
    Scores the 'Kryptonite Risk' of a job description.
    1.0 = Pure Bureaucratic Kryptonite
    0.0 = Pure Catalyst Vacuum
    """
    risk_keywords = ["strictly defined", "siloed", "legacy", "compliance-first", "fixed role", "process-heavy"]
    catalyst_keywords = ["agile", "cross-functional", "entropy", "scale", "pivot", "transform", "velocity"]

    risk_count = sum(1 for word in risk_keywords if word in jd_text.lower())
    catalyst_count = sum(1 for word in catalyst_keywords if word in jd_text.lower())

    # Revealed Preference Penalty (Archetype Adjustment)
    pedigree_penalty = 0.3 if company_archetype.lower() == "legacy-corp" else 0.0

    k_risk = (risk_count / (catalyst_count + 1)) + pedigree_penalty
    return min(k_risk, 1.0)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ARCS Kryptonite Scorer")
    parser.add_argument("--jd", type=str, required=True, help="Job Description Text")
    parser.add_argument("--type", type=str, default="startup", help="Company Archetype (startup, legacy-corp)")
    args = parser.parse_args()

    risk = score_risk(args.jd, args.type)
    print(f"Kryptonite Risk Score: {risk:.2f}")
