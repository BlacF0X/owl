import scan
import emit

wifi_1 = ('testssid','testpwd')
wifi_2 = ('testssid','testpwd')
wifis = [wifi_1,wifi_2]

emission_state = True

def switch(wifis):
    global emission_state
    emission_state  = not emission_state
    if emission_state:
        emission.emit(wifis[0][0], wifis[0][1])
    else:
        connection.connect(wifis[1][0], wifis[1][1])
