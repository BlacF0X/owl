import network
import socket
import time
import struct
import json_rel
import machine
from machine import Pin



host = "pool.ntp.org"

led = Pin("LED", Pin.OUT)

ssid = json_rel.get_infos()['home_wifi']['ssid']
password = json_rel.get_infos()['home_wifi']['psd']

def set_time():
    timezone = json_rel.get_infos()["timezone"]
    print(timezone[0],timezone[1:])
    if timezone[0] == "+":
        tm_gmtoff = int(timezone[1:])*3600
        NTP_DELTA = 2208988800 - tm_gmtoff
    elif timezone[0] == "-":
        tm_gmtoff = int(timezone[1:])*3600
        NTP_DELTA = 2208988800 + tm_gmtoff
    NTP_QUERY = bytearray(48)
    NTP_QUERY[0] = 0x1B
    try:
        addr = socket.getaddrinfo(host, 123)[0][-1]
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    except:
        return 0
    try:
        s.settimeout(10)
        res = s.sendto(NTP_QUERY, addr)
        msg = s.recv(48)
    except:
        return 0
    finally:
        s.close()
    val = struct.unpack("!I", msg[40:44])[0]
    t = val - NTP_DELTA    
    tm = time.gmtime(t)
    machine.RTC().datetime((tm[0], tm[1], tm[2], tm[6] + 1, tm[3], tm[4], tm[5], 0))

def body():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)

    max_wait = 10
    while max_wait > 0:
        if wlan.status() < 0 or wlan.status() >= 3:
            break
        max_wait -= 1
        print('waiting for connection...')
        time.sleep(1)

    if wlan.status() != 3:
        print('network connection failed')
    else:
        print('connected')
        status = wlan.ifconfig()
        print( 'ip = ' + status[0] )
    time.sleep(5)
    led.on()
    if wlan.status()!= 3:
        led.off()
        wlan.active(False)
        return
    status = set_time()
    if status == 0:
        print('errorontheway')
    print('local')
    print(time.localtime())
    led.off()
    wlan.active(False)