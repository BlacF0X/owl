import emit
import time

boitier_central = ('ssid', 'aaaaaaaa')
wifi_states = ['nouveau_boitier', 'recolte']


def encryption(text):
    new_text = ''
    for char in text:
        new_text += str(ord(char)) + '|'
    return new_text


def decryption(text):
    enc = text.split('-')[1].split('|')[:-1]
    state = text.split('-')[2]
    new_text = ''
    print(enc)
    for char in enc:
        new_text += str(chr(int(char)))
    return (new_text, state)


def lister_clients_connectes(ap_interface):
    clients = ap_interface.status('stations')
    print(clients)
    if clients:
        print(f"\n{len(clients)} appareil(s) connecté(s) :")
        for mac_address_tuple in clients:
            mac_hex = ':'.join(f'{b:02x}' for b in mac_address_tuple[0])
            # print(f"- MAC: {mac_hex}") # J'ai commenté cette ligne pour la sécu du projet. Décommente la si besoin pour le dev mais n'oublie pas de la recommenter pour la prod
    else:
        print("\nAucun appareil connecté pour l'instant.")


def create_wifi_name(psd, state):
    k = encryption(psd)
    crypted = 'OWL-{}-{}'.format(k, state)
    return crypted



