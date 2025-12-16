import api_client
import network
import time
import json_rel

def try_connect_and_register():
    infos = json_rel.get_infos()
    ssid = infos["home_wifi"].get("ssid")
    pwd = infos["home_wifi"].get("psd")
    
    if ssid and pwd:
        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)
        wlan.connect(ssid, pwd)
        
        # Attente simple
        max_wait = 10
        while max_wait > 0: 
            if wlan.isconnected():
                break
            max_wait -= 1
            time.sleep(1)
            
        if wlan.isconnected():
            print("Connecté au WiFi maison, tentative d'enregistrement API...")
            api_client.register_hub()

            # Une fois enregistré, on peut déconnecter le STA si on veut économiser, 
            # ou le garder pour envoyer les données plus tard
        else:
            print("Impossible de se connecter au WiFi maison")
        wlan.active(False)
            
    

# À appeler au démarrage du script, avant les threads