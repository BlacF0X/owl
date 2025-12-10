import network
import time
from picozero import pico_led
import shared


def emit(ssid, password):
    staif = network.WLAN(network.STA_IF)
    staif.active(False)
    ap = network.WLAN(network.AP_IF)
    ap.active(False)
    ap.config(essid=ssid, password=password)
    ap.active(True)
    while ap.active() == False:
        time.sleep(0.5)
    pico_led.on()
    print('Point d\'accès actif. IP:', ap.ifconfig()[0])
    #ws = 1
    # while not ap.isconnected() or ws == 1:
    #    time.sleep(5)
    #    ws = shared.get_wifi_state()
    #    print(ws)
    #    print('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH')
    return ap


def un_emit(ap):
    ap.active(False)
    ap.deinit()
    ap = None


