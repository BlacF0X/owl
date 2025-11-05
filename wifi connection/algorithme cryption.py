boitier_central = ('ssid','paswd')

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
    return new_text,state


def create_wifi_name(boitier_central,state):
    k = encryption(boitier_central[1])
    crypted = 'OWL-{}-{}'.format(k,wifi_states.index(state))
    return crypted

encrypted_text = create_wifi_name(boitier_central,wifi_states[0])
print(encrypted_text)
print(decryption(encrypted_text))