import network
import socket
import time
import decrypt
from picozero import pico_temp_sensor, pico_led
import machine
import rp2
import sys
import binascii

TIMEOUT_S = 10


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
    wlan.active(True)
    print('v', ssid, password)
    wlan.connect(ssid, password)
    t0 = time.time()
    connected = False

    while time.time() - t0 < TIMEOUT_S:
        if wlan.isconnected():
            connected = True
            break
        time.sleep(0.5)
        pico_led.on()
        time.sleep(0.2)
        pico_led.off()
        time.sleep(0.2)
    if connected:
        print("Connecté !", wlan.ifconfig())
        return wlan, ssid, True
    else:
        print("Timeout, on annule la connexion")
        wlan.disconnect()  # si dispo dans ta version, sinon:
        wlan.active(False)
        return wlan, ssid, False


def get_wifi():
    liste_net = scanning()
    print('get')
    print(liste_net)
    if len(liste_net) > 0:
        for d in liste_net:
            print(d)
            if 'OWL' in d['ssid']:
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
    else:
        return None, None, -1




