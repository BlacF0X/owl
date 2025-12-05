import network
import time
from picozero import pico_led


def emit(ssid, password):
    ap = network.WLAN(network.AP_IF)
    ap.config(essid=ssid, password=password)
    ap.active(True)
    while ap.active() == False:
        time.sleep(1)
    pico_led.on()
    print('Point d\'accès actif. IP:', ap.ifconfig()[0])
    while not ap.isconnected():
        print('waiting for device')
        time.sleep(1)
    return ap


def un_emit(ap):
    ap.active(False)
    ap.deinit()
    ap = None


