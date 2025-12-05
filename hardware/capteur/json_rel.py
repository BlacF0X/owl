import json


def get_infos():
    with open("info.json", 'r') as f:
        loaded = json.load(f)
        return loaded


def save_infos(cap_nbr, psw, capid: list):
    base = get_infos()


def save_data(d_type, data):
    base = get_infos()
    base[d_type] = data
    print(data)
    print(base)
    with open("info.json", "w") as f:
        json.dump(base, f)


def save_captor_data(data):
    with open("data.json", 'w') as f:
        json.dump(data, f)


def new_captor(c_type, capid):
    base = get_infos()
    liste_capteur = base["capteurs"]
    liste_capteur.append({"type": c_type, "id": capid})
    save_data("capteurs", liste_capteur)
    save_data("cap_nbrs", len(liste_capteur))
