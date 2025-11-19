import _thread
import time
from machine import Pin


def core1_thread_function(name, delay):
    button = Pin(0, Pin.IN, Pin.PULL_UP)
    while True:
        print(button.value())
        time.sleep(0.1)


def core0_main_func():
    i = 1000
    while i > 0:
        print('0' + str(i))
        i -= 1
        time.sleep(0.5)


_thread.start_new_thread(core1_thread_function, ("Core 1", 0.5))
core0_main_func()

