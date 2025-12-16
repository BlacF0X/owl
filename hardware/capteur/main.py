import _thread
import time
import scan
import network
import socket
import socket_func
import json_rel
import json
import shared,toner
from machine import Pin
from picozero import pico_led
import temp_sensor

running_thread = True
wlan = None
type_cap = "CTH"
glb_psd = ""

registered = False

to_send_later = []

sensor = Pin(15,Pin.IN)
data = ""
data_send_timer = 6





def get_data():
    liste_data = []
    if type_cap == "CF":
        for i in range(5):
            time.sleep(12)
            liste_data.append(sensor.value())
        avg = 0
        for i in liste_data:
            avg += int(i)
        avg = avg /len(liste_data)
        if avg >= 0.5:
            return "0"
        else:
            return "1"
    elif type_cap == "CTH":
        for i in range(5):
            time.sleep(12)
            liste_data.append(temp_sensor.read_captor())
        avg = [0,0]
        for i in liste_data:
            avg[0] += i[0]
            avg[1] += i[1]
        avg[0] = avg[0]/len(liste_data)
        avg[1] = avg[1]/len(liste_data)
        for i in range(2):    
            toner.beep(1200,0.05)
        return (avg[0],avg[1])

def new_co_func(ssid,psd):
    print('newco')
    global wlan,registered
    okay = False
    while not okay:
        wlan,ssid,okay = scan.connect(ssid, psd)
        print('wln',wlan.ifconfig())
        print('s',ssid)
        response = False
        while not response:
            if int(ssid[-1]) == 0:
                ip = wlan.ifconfig()[-2]
                print(ip)
                resp = socket_func.send_id(ip,5000,type_cap)
                print(resp)
                if "REGISTERED" in resp:
                    json_rel.save_data("capteur",{"c_type":type_cap,"id":resp.split('-')[1]})
                    json_rel.save_data("wifi_psd",psd)
                    response = True
                    registered = True
            time.sleep(1)

def info_connection(ssid,psd):
    print('infoco')
    okay = False
    global data
    
    wlan,ssid,okay = scan.connect(ssid, psd)
    if okay:
        print('wln',wlan.ifconfig())
        print('s',ssid)
        if int(ssid[-1]) == 1:
            ip = wlan.ifconfig()[-2]
            print('ip',ip)
            old_data = json_rel.captor_data_read()['data']
            datatemp = data
            print(old_data)
            if len(old_data) > 0:
                for d in old_data:
                    datatemp += "|"+str(d)
            data_plus = "DATA-"+json_rel.get_infos()["capteur"]["id"]+"-"+ json_rel.get_infos()["capteur"]["c_type"] +"-"+ datatemp
            
            print(data_plus)
            print("Client IFCONFIG:", wlan.ifconfig())
            print("Client connecte vers", ip, 5000)
            
            resp = socket_func.send_data(ip,5000,data_plus)
            print('rsp',resp)
            if resp == None:
                print('not okay')
                json_rel.save_captor_data(datatemp,False)
                return None
            
            elif "ClEAR" in resp:
                with open("data.json",'w') as f:
                    json.dump({"data":[]},f)
                    data = ""
                wlan.active(False)
        return resp
    else:
        print('not okay')
        return None


def core0_main_func():
    global glb_psd,resp,data,data_send_timer,registered
    ssid,psd,state = scan.get_wifi()
    print(ssid,psd,state)
    data_send_timer = shared.get_timer_state()
    if int(state) == -1:
        if data_send_timer <= 0:
            print('0:-1')
            print(data)
            json_rel.save_captor_data(data,True)
            data = ""
            data_send_timer = 6
            shared.change_timer_state(data_send_timer)
    elif int(state) == 0:
        print('r' ,registered)
        if registered:
            state = 1
        else:
            new_co_func(ssid,psd)
    elif int(state) == 1 and data_send_timer <= 0 or len(json_rel.captor_data_read()["data"]) > 0:
        print('0:1')
        if not registered:
            print('not registered')
            new_co_func(ssid,psd)
        else:
            resp = info_connection(ssid,psd)
            print('r',resp)
            if not resp == None and resp == 'CLEAR':
                data_send_timer = 6
                shared.change_timer_state(data_send_timer)
                print('reset')
    print('state : ',state)
            

            
def core1_thread_func(name,delay):
    global running_thread,data,data_send_timer
    hour_data = []
    while running_thread:
        print('thread1')
        time.sleep(240)
        temp_data = get_data()
        hour_data.append(temp_data)
        data_send_timer -= 1
        shared.change_timer_state(data_send_timer)
        if data_send_timer <= 0:
            for d in hour_data:
                data += str(d)+"|"
            hour_data = []
        print('data: ',data)
        print('data_timer :',data_send_timer)




if json_rel.get_infos()['wifi_psd'] == "":
    registered = False
else:
    registered = True

_thread.start_new_thread(core1_thread_func,("Core 1", 3))
try:
    while running_thread:
        core0_main_func()
        time.sleep(120)
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
    wlan = network.WLAN(network.STA_IF)
    wlan.active(False)
    ap = network.WLAN(network.AP_IF)
    ap.active(False)