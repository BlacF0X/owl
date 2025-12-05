import _thread
import time
from machine import Pin
import wifi_data, emit, json_rel
import socket_func

running_thread = True
button_count = 0
last_count = 0
count = 0

ws = -1
send = False
led = True

if len(json_rel.get_infos()["emits"]) == 0:
    print('create')
    wifi_data.create_wifis_data()
ap = None


def core1_thread_function(name, delay):
    global ws, ap
    while running_thread:
        print('top')
        if ws == 0:
            if ap is not None:
                emit.un_emit(ap)
            base = json_rel.get_infos()
            wifi = base["emits"]
            wifi = wifi[ws]
            print(wifi)
            psd = json_rel.get_infos()["password"]
            print(psd)
            ap = emit.emit(wifi, psd)
            ws = socket_func.listen("", 5000)
        elif ws == 1:
            if not ap.active():
                emit.un_emit(ap)
            base = json_rel.get_infos()
            wifi = base["emits"]
            wifi = wifi[ws]
            psd = json_rel.get_infos()["password"]
            ap = emit.emit(wifi, psd)
            ws = socket_func.listen("", 5000)
        time.sleep(delay)


def core0_main_func():
    global running_thread
    global button_count
    global send
    global led
    global ws
    global last_count
    order = 0
    red_led = Pin(15, Pin.OUT)
    green_led = Pin(13, Pin.OUT)
    button = Pin(0, Pin.IN, Pin.PULL_UP)
    if button.value() == 0:
        button_count += 1
    else:
        if last_count == button_count and button_count != 0:
            last_count = 0
            send = True
        else:
            last_count = button_count
    if led:
        red_led.value(1)
    else:
        red_led.value(0)
    led = not led
    if send:
        order = (button_count // 5) + 1
        send = False
        button_count = 0
        if order >= 10:
            running_thread = False
            for i in range(3):
                green_led.value(1)
                time.sleep(0.1)
                green_led.value(0)
                time.sleep(0.1)
        elif order >= 3:
            ws = 0
            print(ws)
            for i in range(2):
                green_led.value(1)
                time.sleep(0.1)
                green_led.value(0)
                time.sleep(0.2)
        elif order >= 1:
            green_led.value(1)
            time.sleep(0.1)
            green_led.value(0)
            time.sleep(0.1)
            if running_thread == False:
                running_trhead = True


_thread.start_new_thread(core1_thread_function, ("Core 1", 3))
try:
    while True:
        core0_main_func()
        time.sleep(0.2)
except KeyboardInterrupt:
    running_thread = False
    time.sleep(0.3)
    print("Second thread terminated gracefully.")
print("Main thread terminated gracefully.")
