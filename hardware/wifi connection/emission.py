import network

ssid = 'ssid'
password = 'password'


def emit(ssid,password):
    ap = network.WLAN(network.AP_IF)
    ap.config(essid=ssid, password=password)
    ap.active(True)
