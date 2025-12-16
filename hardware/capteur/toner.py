from machine import Pin, PWM
import time

# PWM configuration
buzzer = PWM(Pin(1))

def beep(frequency, duration):
    """
    Generates a tone in the buzzer.
    :param frequency: Frequency in Hz.
    :param duration: Duration in seconds.
    """
    buzzer.freq(frequency)
    buzzer.duty_u16(32768)  # Duty cycle at 50%
    time.sleep(duration)
    buzzer.duty_u16(0)      # Turn off the buzzer