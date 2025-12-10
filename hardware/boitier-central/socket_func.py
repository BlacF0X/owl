import socket
import json_rel
HOST = "127.0.0.1" # écoute sur localhost
PORT = 5268        # choisis un port libre > 1024


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


def listen(Port):
    print('listen')
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind((HOST, Port))
    s.listen(5)
    s.settimeout(180)
    wifi_state = -1
    print(f"Serveur en écoute sur le port {Port}...")

    try:
        conn, addr = s.accept()
        print("Client connecté :", addr)
    except OSError:
        print('error (timeout accept)')
        s.close()
        print('return to 1')
        return 1

    print('toppipo')
    try:
        data = conn.recv(1024)
    except OSError as e:
        print("Erreur recv:", e)
    if not data:
        print("Client a fermé la connexion (data vide)")

    message = data.decode("utf-8")
    print("Reçu :", message)
    good = False
    if "SEND" in message:
        c_type = message.split('-')[1]
        cpid = get_captor_nbr(c_type)
        json_rel.new_captor(c_type, cpid)
        conn.sendall(("REGISTERED-" + str(cpid)).encode("utf-8"))
        print('sended')
        running = False
        wifi_state = 1
        good = True
    elif "DATA" in message:
        data_raw = message.split('-')[3]
        cap_id = message.split('-')[1]
        print("DATA RAW:", data_raw, "ID:", cap_id)
        conn.sendall(b"ClEAR")
        print("clearsend")
        running = False
        wifi_state = 1
        good = True
    else:
        print("Message inconnu")
        wifi_state = 1


    conn.close()
    s.close()
    return wifi_state,good
