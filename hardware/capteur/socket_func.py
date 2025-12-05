import socket
import time



def send_id(ip,port,id_capteur):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((ip, port))
    print("Connecté au serveur")
    i = 0
    running = True
    while running:
        message = str("SEND-" + id_capteur)
        s.sendall(message.encode("utf-8"))
        print('sended')
        data = s.recv(1024)
        print('d',data)
        if'REGISTERED' in data.decode("utf-8").strip() :
            print("Réponse du serveur :", data.decode("utf-8").strip())
            running = False
        i += 1
        time.sleep(1)
    s.close()
    return data.decode("utf-8").strip()

def send_data(ip,port,data):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    print(s)
    s.connect((ip, port))
    print("Connecté au serveur")
    i = 0
    running = True
    while running:
        message = str("DATA-" + str(data))
        s.sendall(message.encode("utf-8"))
        print('sended')
        data = s.recv(1024)
        print('d',data)
        if 'ClEAR' in data.decode("utf-8").strip() :
            print("Réponse du serveur :", data.decode("utf-8").strip())
            running = False
        i += 1
        time.sleep(1)
    s.close()
    return data.decode("utf-8").strip()
