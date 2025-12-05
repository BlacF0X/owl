import _thread
import time
import scan
import network
import socket
import socket_func
import json_rel
from machine import Pin
from picozero import pico_led

running_thread = True
wlan = None
type_cap = "CF"
glb_psd = ""

registered = False

to_send_later = []

sensor = Pin(15, Pin.IN)
data = ""
data_send_timer = 2


def get_data():
    liste_data = []
    if type_cap == "CF":
        for i in range(5):
            time.sleep(2)
            liste_data.append(sensor.value())
        avg = 0
        for i in liste_data:
            avg += int(i)
        avg = avg / len(liste_data)
        if avg >= 0.5:
            return "0"
        else:
            return "1"


def new_co_func(ssid, psd):
    print('newco')
    global wlan, registered
    okay = False
    while not okay:
        wlan, ssid, okay = scan.connect(ssid, psd)
        print('wln', wlan.ifconfig())
        print('s', ssid)
        response = False
        while not response:
            if int(ssid[-1]) == 0:
                ip = wlan.ifconfig()[-2]
                print(ip)
                resp = socket_func.send_id(ip, 5000, type_cap)
                print(resp)
                if "REGISTERED" in resp:
                    json_rel.save_data("capteur", {"c_type": "CF", "id": resp.split('-')[1]})
                    json_rel.save_data("wifi_psd", psd)
                    response = True
                    registered = True
            time.sleep(1)


def info_connection(ssid, psd):
    print('infoco')
    okay = False
    global data
    wlan, ssid, okay = scan.connect(ssid, psd)
    if okay:
        print('wln', wlan.ifconfig())
        print('s', ssid)
        response = False
        while not response:
            if int(ssid[-1]) == 1:
                ip = wlan.ifconfig()[-2]
                data_plus = "DATA-" + json_rel.get_infos()["capteur"]["id"] + data
                print(data_plus)
                resp = socket_func.send_data(ip, 5000, data_plus)
                if "ClEAR" in resp:
                    json_rel.save_captor_data("")
                    response = True
        return resp
    else:
        print('not okay')
        return None


def core0_main_func():
    global glb_psd, resp, data_send_timer, registered
    ssid, psd, state = scan.get_wifi()
    print(ssid, psd, state)
    if int(state) == -1:
        pass
    elif int(state) == 0:
        print('r', registered)
        if registered:
            state = 1
        else:
            new_co_func(ssid, psd)
    elif int(state) == 1 and data_send_timer <= 0:
        if not registered:
            new_co_func(ssid, psd)
        else:
            resp = info_connection(ssid, psd)
            print(resp)
            if 'CLEAR' in resp:
                data_send_timer == 1
    print('state : ', state)


def core1_thread_func(name, delay):
    global running_thread, data, data_send_timer
    hour_data = []
    while running_thread:
        print('thread1')
        time.sleep(60)
        temp_data = get_data()
        hour_data.append(temp_data)
        data_send_timer -= 1
        if data_send_timer <= 0:
            for d in hour_data:
                data += str(d) + "|"
            data = data[:-2]
            hour_data = []
        print('data: ', data)
        print('data_timer :', data_send_timer)


if json_rel.get_infos()['wifi_psd'] == "":
    registered = False
else:
    registered = True

_thread.start_new_thread(core1_thread_func, ("Core 1", 3))
try:
    while running_thread:
        core0_main_func()
        time.sleep(60)
        pico_led.on()
        time.sleep(0.1)
        pico_led.off()
        time.sleep(0.1)
        pico_led.on()
        time.sleep(0.1)
        pico_led.off()
        time.sleep(0.1)
        pico_led.on()
        time.sleep(0.1)
        pico_led.off()
except KeyboardInterrupt:
    running_thread = False
    print("arret manuel")
else:
    running_thread = False
finally:
    print('end')
