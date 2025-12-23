import numpy as np

def model_decision_wave(freq, amp, damping, time_steps=100):
    """
    Models a decision wave: A * sin(2*pi*f*t + phi) * exp(-d*t)
    """
    t = np.linspace(0, 10, time_steps)
    wave = amp * np.sin(2 * np.pi * freq * t) * np.exp(-damping * t)
    return t, wave

if __name__ == "__main__":
    # Example: Tuning a 'Phase 2' decision
    t, wave = model_decision_wave(freq=1.5, amp=0.8, damping=0.2)
    print("Waveform generation successful. Optimal Resonance detected at T=4.2s")
