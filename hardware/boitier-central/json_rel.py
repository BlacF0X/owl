import json


def get_infos():
    with open("info.json",'r') as f:
        loaded = json.load(f)
        return loaded


def save_infos(cap_nbr,psw,capid : list):
    base = get_infos()



def save_data_received(d_type,data):
    if d_type == "CTH":
        processed_data = {"temp":[],"hum":[]}
        data = data.split('|')
        for d in data:
            if d != "":
                dt = d.split(',')
                ind = 0
                for data in dt:
                    temp = ""
                    for l in data:
                        print(l)
                        if l != '(' and l != ')':
                            temp += l
                    if ind == 0:
                        processed_data["temp"].append(temp)
                    else:
                        processed_data["hum"].append(temp)
                    ind += 1
        for f in processed_data["hum"]:
            print(float(f))
                            
                            
                            
def save_data(d_type,data):
    base = get_infos()
    base[d_type] = data
    print(data)
    print(base)
    with open("info.json", "w") as f:
        json.dump(base,f)

def new_captor(c_type,capid):
    base = get_infos()
    liste_capteur = base["capteurs"]
    liste_capteur.append({"type":c_type,"id":capid})
    save_data("capteurs",liste_capteur)
    save_data("cap_nbrs",len(liste_capteur))