import network
import socket
from time import sleep
from picozero import pico_temp_sensor, pico_led
import machine
import rp2
import sys
import binascii

ssid = 'ssid'
password = 'password'


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
    print(ssid, password)
    wlan.connect(ssid, password)
    while wlan.isconnected() == False:
        if rp2.bootsel_button() == 1:
            sys.exit()
        print('Waiting for connection...')
        pico_led.on()
        sleep(0.2)
        pico_led.off()
        sleep(0.2)
    pico_led.on()
    print(wlan.ifconfig())


liste_net = scanning()
for d in liste_net:
    if 'test' in d['ssid']:
        print(d["ssid"])
        connect(d['ssid'], 'password')

