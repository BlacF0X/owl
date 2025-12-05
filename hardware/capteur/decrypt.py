def decryption(text):
    enc = text.split('-')[1].split('|')[:-1]
    state = text.split('-')[2]
    new_text = ''
    for char in enc:
        new_text += str(chr(int(char)))
    return new_text,state
