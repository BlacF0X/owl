import json_rel,main_co

def create_wifis_data():
    psd = json_rel.get_infos()['password']
    E2 = main_co.create_wifi_name(psd,1)
    E1 = main_co.create_wifi_name(psd,0)
    json_rel.save_data("emits",[E1,E2])
