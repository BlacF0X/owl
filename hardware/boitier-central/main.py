import _thread
import time
import network
from machine import Pin
import wifi_data,emit,json_rel,web_serv,shared,setclock,socket_func,register



running_thread = True
button_count = 0
last_count = 0
count = 0

ws = 1
shared.change_wifi_state(ws)
send = False
led = True

if len(json_rel.get_infos()["emits"]) == 0:
    print('create')
    wifi_data.create_wifis_data()
ap = None

if json_rel.get_infos()["home_wifi"]["ssid"] != "":
    print("setclock1")
    setclock.body()
    print("fin")
    
def core1_thread_function(name, delay):
    global ws,ap
    while running_thread:
        print('top',ws)
        if ws == 0:
            if ap is not None:
                emit.un_emit(ap)
            base = json_rel.get_infos()
            wifi = base["emits"]
            wifi = wifi[ws]
            psd = json_rel.get_infos()["password"]
            ap = emit.emit(wifi,psd,False)
            if not ap == None:
                ws = socket_func.listen("",5000)
                shared.change_wifi_state(ws)
            else:
                ws = 1
                shared.change_wifi_state(ws)
        elif ws == 1:
            base = json_rel.get_infos()
            wifi = base["emits"]
            wifi = wifi[ws]
            psd = json_rel.get_infos()["password"]
            ap = emit.emit(wifi,psd)    
            if not ap == None:
                ws,good = socket_func.listen("",5000)
                shared.change_wifi_state(ws)
            else:
                ws = 1
                shared.change_wifi_state(ws)
        time.sleep(1)
        print(ws)
               
        


def core0_main_func():
    global running_thread
    global button_count
    global send
    global led
    global ws
    global last_count
    order = 0
    red_led = Pin(15,Pin.OUT)
    green_led = Pin(13,Pin.OUT)
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
        order = (button_count//5)+1
        send = False
        button_count = 0
        if order >= 6:
            for i in range(3):
                green_led.value(1)
                time.sleep(0.1)
                green_led.value(0)
                time.sleep(0.1)
                green_led.value(1)
                time.sleep(0.1)
                green_led.value(0)
                time.sleep(0.1)
            ap = network.WLAN(network.AP_IF)
            ap.active(False)
            ssid, pwd, email = web_serv.start_config_portal()
            print("ReÃ§u depuis portail:", ssid, pwd,email)
            json_rel.save_data("home_wifi", {"ssid": ssid, "psd": pwd})
            json_rel.save_data("user_email", email)
            register.try_connect_and_register()
            ap = network.WLAN(network.AP_IF)
            ap.active(False)
            print('setclock')
            setclock.body()
            ws = 1
            shared.change_wifi_state(1)
            print("finish")
        elif order >= 3:
            ws = 0
            shared.change_wifi_state(ws)
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
            
    
_thread.start_new_thread(core1_thread_function, ("Core 1", 90))
try:
    while True:
        core0_main_func()
        time.sleep(0.2)
except KeyboardInterrupt:
    running_thread = False
    time.sleep(0.3)
finally:
    wlan = network.WLAN(network.STA_IF)
    wlan.active(False)
    ap = network.WLAN(network.AP_IF)
    ap.active(False)
    shared.change_wifi_state(0)
print("Second thread terminated gracefully.")
print("Main thread terminated gracefully.")