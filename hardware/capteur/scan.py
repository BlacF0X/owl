import network
import socket
import time
import decrypt
from picozero import pico_temp_sensor, pico_led
import machine
import rp2
import sys
import binascii

TIMEOUT_S = 180


def scanning():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    networks = wlan.scan()
    list_net = []
    for i, w in enumerate(networks):
        list_net.append({"ssid": w[0].decode(), "bssid": binascii.hexlify(w[1]).decode(), 'channel': w[2], 'rssi': w[3],
                         'security': w[4], 'hidden': w[5]})
    print(list_net)
    return list_net


def connect(ssid, password):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(False)
    wlan.active(True)
    while not wlan.active():
        print('activation')
    print('v', ssid, password)
    wlan.connect(ssid, password)
    connected = False
    while not connected:
        print('connection')
        if wlan.isconnected():
            connected = True
            break
        time.sleep(0.5)
        pico_led.on()
        time.sleep(0.2)
        pico_led.off()
        time.sleep(0.2)
    print("Connecté !", wlan.ifconfig())
    return wlan, ssid, True


def get_wifi():
    liste_net = scanning()
    print('get')
    print(liste_net)
    if len(liste_net) > 0:
        for d in liste_net:
            if 'OWL' in d['ssid']:
                print('owl')
                psd, state = decrypt.decryption(d['ssid'])
                print("st", state)
                print("psd", psd)
                if int(state) == 0:
                    print(int(state))
                    return d['ssid'], psd, state
                elif int(state) == 1:
                    return d['ssid'], psd, state
                else:
                    return d['ssid'], None, -1
    else:
        return None, None, -1
    return None, None, -1




