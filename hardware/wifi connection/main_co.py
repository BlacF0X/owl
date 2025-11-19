import emit
import time
boitier_central = ('ssid','aaaaaaaa')
wifi_states = ['nouveau_boitier','recolte']

def encryption(text):
    new_text = ''
    for char in text:
        new_text += str(ord(char))+'|'
    return new_text


def decryption(text):
    enc = text.split('-')[1].split('|')[:-1]
    state = text.split('-')[2]
    new_text = ''
    print(enc)
    for char in enc:
        new_text += str(chr(int(char)))
    return (new_text,state)


def lister_clients_connectes(ap_interface):
    # La méthode status('stations') renvoie une liste de tuples
    # où chaque tuple contient l'adresse MAC d'un client.
    clients = ap_interface.status('stations')
    print(clients)
    if clients:
        print(f"\n{len(clients)} appareil(s) connecté(s) :")
        for mac_address_tuple in clients:
            # Formatage de l'adresse MAC pour l'affichage (ex: b'x01x02x03...')
            mac_hex = ':'.join(f'{b:02x}' for b in mac_address_tuple[0])
            print(f"- MAC: {mac_hex}")
    else:
        print("\nAucun appareil connecté pour l'instant.")

def create_wifi_name(boitier_central,state):
    k = encryption(boitier_central[1])
    crypted = 'OWL-{}-{}'.format(k,wifi_states.index(state))
    return crypted

encrypted_text = create_wifi_name(boitier_central,wifi_states[0])
ap = emit.emit(encrypted_text,decryption(encrypted_text)[0])
while True:
    ap.status('stations')
    lister_clients_connectes(ap)
    time.sleep(5)
emit.un_emit(ap)
