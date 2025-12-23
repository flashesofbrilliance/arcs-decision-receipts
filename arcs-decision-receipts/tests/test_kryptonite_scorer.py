from arcs_decision_receipts.kryptonite_scorer import score_risk


def test_score_risk_legacy_bias():
    jd = "We are a legacy org with process-heavy, strictly defined roles."
    score = score_risk(jd, "legacy-corp")
    assert 0.3 <= score <= 1.0


def test_score_risk_catalyst_text():
    jd = "Agile, cross-functional team with velocity and ability to pivot."
    score = score_risk(jd, "startup")
    assert 0.0 <= score <= 0.6

