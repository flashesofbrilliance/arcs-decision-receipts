import numpy as np

from arcs_decision_receipts.waveform_optimizer import model_decision_wave


def test_model_decision_wave_shape():
    t, wave = model_decision_wave(freq=1.0, amp=1.0, damping=0.1, time_steps=50)
    assert t.shape == (50,)
    assert wave.shape == (50,)
    # Basic property: max amplitude should not exceed initial amplitude
    assert np.max(np.abs(wave)) <= 1.0 + 1e-6

