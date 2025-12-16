import time
import json_rel

def transform_time():
    info = json_rel.get_infos()
    tmz = str(info["timezone"])
    sign = "+" if tmz.startswith("+") else "-"
    offset_hours = int(tmz[1:])
    if offset_hours < 0:
        offset_hours = 0
    if offset_hours > 14:
        offset_hours = 14

    tz_str = "{}{:02d}:00".format(sign, offset_hours)
    now = time.localtime()
    date = "{:04d}-{:02d}-{:02d}T{:02d}:{:02d}:{:02d}.000{}".format(
        now[0],  # année
        now[1],  # mois
        now[2],  # jour
        now[3],  # heure
        now[4],  # minute
        now[5],  # seconde
        tz_str
    )
    print(tz_str)
    print(date)
    return date