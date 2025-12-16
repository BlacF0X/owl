import network
import urequests
import json
import json_rel

# URL de ton API (Attention: si tu testes en local, localhost ne marchera pas sur le Pico)
# En prod: "https://ton-domaine.vercel.app/api"
API_URL = "http://192.168.1.49:8080/api" 
API_KEY = "sk_owl_p@0UgN7M27k8tnsB7I9zUf4N@gePA5rkJEe2Lfzt%7woP7YhwZrsh^3CK*UOnw!6QN9P%93n*Yf1pYx2@44gvyuO#XLbhYY#H03t3ocPDv@BBWqyJGsZ17gjb1Qk$1Id" # Ta clé OWL_API_KEY définie dans le .env backend

def register_hub():
    infos = json_rel.get_infos()
    hub_serial = infos["id"] # Ex: "CC1"
    
    # Vérifier si on a un email configuré
    if "user_email" not in infos:
        print("Pas d'email configuré, impossible d'enregistrer le hub")
        return False

    email = infos["user_email"]
    
    url = f"{API_URL}/hubs/provision"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    payload = {
        "hub_serial": hub_serial,
        "email": email
    }

    print(f"Tentative d'enregistrement Hub {hub_serial} pour {email}...")

    try:
        response = urequests.post(url, headers=headers, json=payload)
        print("Status Code:", response.status_code)
        print("Response:", response.text)
        
        if response.status_code == 200 or response.status_code == 201:
            print("✅ Hub enregistré avec succès !")
            response.close()
            return True
        else:
            print("❌ Echec enregistrement API")
            response.close()
            return False
    except Exception as e:
        print("❌ Erreur connexion API:", e)
        return False