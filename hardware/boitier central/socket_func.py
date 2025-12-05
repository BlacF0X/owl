import socket
import json_rel
HOST = ""          # écoute sur toutes les interfaces
PORT = 5000        # choisis un port libre > 1024


def get_captor_nbr(captype):
    infos = json_rel.get_infos()
    nbr = infos['cap_nbrs']
    print('ct ',captype)
    counter = 1
    if nbr > 1:
        for cpt in infos['capteurs']:
            if cpt['type'] == captype:
                counter += 1
        tosend = "00"+str(counter)
        tosend = tosend[-3:]
        print('tosend : ',tosend)
        return tosend
    elif nbr == 1:
        if infos['capteurs'][0]['type'] == captype:
            return "002"
        else:
            return "001"
    else:
        return "001"

def listen(Host,Port):
    s= socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind((Host, Port))
    s.listen(1)
    wifi_state = -1
    print(f"Serveur en écoute sur le port {PORT}...")
    conn, addr = s.accept()
    running = True
    while running:
        data = conn.recv(1024)
        message = data.decode("utf-8")
        print("Reçu :", message)
        if "SEND" in message:
            c_type = message.split('-')[1]
            print('t ',c_type)
            cpid = get_captor_nbr(c_type)
            json_rel.new_captor(c_type,cpid)
            print('i ',cpid)
            conn.sendall(b"REGISTERED-"+str(cpid))
            print('sended')
            running = False
            wifi_state = 1
        elif "DATA" in message:
            data_raw = message.split('-')[2]
            cap_id = message.split('-')[1]
            print(data_raw)
            conn.sendall(b"ClEAR")
            print("clearsend")
        else:
            wifi_state = 0
    conn.close()
    s.close()
    return wifi_state

