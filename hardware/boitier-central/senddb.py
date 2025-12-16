import network
import time
import urequests
import ujson
import json_rel,time_process

base = json_rel.get_infos()
WIFI_SSID = base["home_wifi"]["ssid"]
WIFI_PASSWORD = base["home_wifi"]["psd"]

API_URL = "http://10.229.38.125:8080/api/ingest"   # adapte IP/port
API_KEY = "sk_owl_p@0UgN7M27k8tnsB7I9zUf4N@gePA5rkJEe2Lfzt%7woP7YhwZrsh^3CK*UOnw!6QN9P%93n*Yf1pYx2@44gvyuO#XLbhYY#H03t3ocPDv@BBWqyJGsZ17gjb1Qk$1Id"

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        wlan.connect(WIFI_SSID, WIFI_PASSWORD)
        timeout = 15
        while not wlan.isconnected() and timeout > 0:
            time.sleep(1)
            timeout -= 1
            print('la coco')
    if not wlan.isconnected():
        print("error")
        raise RuntimeError("WiFi KO")
    else:
        print("lesgo")
    return wlan



def send_payload(d_type,data):
    print(d_type,data)
    HUB_SERIAL = json_rel.get_infos()["id"]
    time_now = time_process.transform_time()
    print(time_now)
    if d_type == "CTH":
        temp_avg = 0
        for d in data["temp"]:
            temp_avg += float(d)
        temp_avg = temp_avg/len(data["temp"])
        hum_avg = 0
        for d in data["hum"]:
            hum_avg += float(d)
        hum_avg = hum_avg/len(data["hum"])
        payload = {
            "hub_serial": HUB_SERIAL,
            "readings": [
                {
                    "hardware_id":d_type+"-"+data["c_id"]+"-"+"T",
                    "type": "temperature",
                    "timestamp":time_now,
                    "value": temp_avg,
                    "sensor_name":d_type+"-"+data["c_id"]+"-"+"T"
                },
                {
                    "hardware_id":d_type+"-"+data["c_id"]+"-"+"H",
                    "type": "humidity",
                    "timestamp":time_now,
                    "value": hum_avg,
                    "sensor_name":d_type+"-"+data["c_id"]+"-"+"H"
                }
            ]
        }

    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    print(payload)
    print("goresp")
    resp = urequests.post(API_URL, data=ujson.dumps(payload), headers=headers)
    print("Status:", resp.status_code)
    print(resp.text)
    resp.close()

def body(data_type,data):
    wlan = connect_wifi()
    time.sleep(2)
    send_payload(data_type,data)
    wlan.active(False)