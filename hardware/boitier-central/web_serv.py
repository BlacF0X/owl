import network
import socket
import ure
import time
import json_rel

AP_SSID = "OwlRegistering"
AP_PASS = "RegisterOwlScoobodoo"

def start_config_portal():
    """Lance l'AP + portail, affiche variable + scan WiFi, et renvoie (ssid, pwd, email, timezone)."""
    infos = json_rel.get_infos()
    my_value = infos["id"]
    last_ssid = infos["home_wifi"]["ssid"]
    last_pwd = infos["home_wifi"]["psd"]
    # France métropolitaine ≈ GMT+1 en heure standard (CET) [web:40][web:45]
    last_tz = infos.get("timezone", "GMT+1")

    # ----- AP pour le portail -----
    sta_main = network.WLAN(network.STA_IF)
    sta_main.active(False)

    ap = network.WLAN(network.AP_IF)
    ap.config(essid=AP_SSID, password=AP_PASS)
    ap.active(True)
    while not ap.active():
        time.sleep(0.1)

    print("AP actif, SSID:", AP_SSID)
    print("Config AP:", ap.ifconfig())

    # ----- STA séparée pour scanner -----
    scanner = network.WLAN(network.STA_IF)
    scanner.active(True)

    def scan_networks():
        nets = scanner.scan()
        options = ""
        for net in nets:
            ssid = net[0].decode()
            rssi = net[3]
            options += f'<option value="{ssid}">{ssid} (RSSI {rssi})</option>'
        if not options:
            options = '<option value="">Aucun réseau trouvé</option>'
        return options

    def timezone_options(selected_tz):
        # Mapping offset -> label avec exemples de villes/zones [web:25][web:32]
        tz_map = {
            -12: "GMT-12 (Etc/GMT+12, Baker Island)",
            -11: "GMT-11 (Pacific/Midway, Niue)",
            -10: "GMT-10 (Pacific/Honolulu, Hawaii)",
            -9:  "GMT-9 (America/Anchorage)",
            -8:  "GMT-8 (America/Los_Angeles, Pacific Time)",
            -7:  "GMT-7 (America/Denver, Mountain Time)",
            -6:  "GMT-6 (America/Chicago, Central Time)",
            -5:  "GMT-5 (America/New_York, Eastern Time)",
            -4:  "GMT-4 (America/Halifax, Atlantic Time)",
            -3:  "GMT-3 (America/Sao_Paulo, Buenos Aires)",
            -2:  "GMT-2 (Atlantic/South_Georgia)",
            -1:  "GMT-1 (Atlantic/Azores, Cape Verde)",
             0:  "GMT (Europe/London, Lisbon, Dublin)",
             1:  "GMT+1 (Europe/Paris, Berlin, Madrid)",   # ton cas courant [web:42][web:45]
             2:  "GMT+2 (Athens, Helsinki, South Africa)",
             3:  "GMT+3 (Moscow, Nairobi, Istanbul)",
             4:  "GMT+4 (Dubai, Baku)",
             5:  "GMT+5 (Pakistan, Maldives)",
             5.5:"GMT+5:30 (India, Sri Lanka)",
             6:  "GMT+6 (Bangladesh, Bhutan)",
             7:  "GMT+7 (Bangkok, Jakarta, Vietnam)",
             8:  "GMT+8 (Beijing, Singapore, Hong Kong)",
             9:  "GMT+9 (Tokyo, Seoul)",
             9.5:"GMT+9:30 (Central Australia)",
            10:  "GMT+10 (Sydney, Guam)",
            11:  "GMT+11 (Solomon Islands, New Caledonia)",
            12:  "GMT+12 (Auckland, Fiji)",
        }

        html = ""
        for offset, label in tz_map.items():
            # value compacte pour ton code : GMT, GMT+1, GMT-5, GMT+5.5, etc.
            if offset == 0:
                value = "GMT"
            elif offset > 0:
                # garde l'écriture exacte (5 ou 5.5)
                value = "GMT+{}".format(int(offset) if offset == int(offset) else offset)
            else:
                value = "GMT{}".format(int(offset) if offset == int(offset) else offset)

            sel = " selected" if value == selected_tz else ""
            html += f'<option value="{value}"{sel}>{label}</option>'
        return html

    def build_page():
        ip = ap.ifconfig()[0]
        wifi_options = scan_networks()
        tz_opts = timezone_options(last_tz)
        return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pico W config</title>
  <style>
    body {{
      font-family: Arial, sans-serif;
      background: #f2f5fa;
      margin: 0;
      padding: 0;
    }}
    .container {{
      max-width: 480px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      padding: 24px 20px;
    }}
    h1 {{
      font-size: 1.6rem;
      margin-top: 0;
      color: #2551cc;
      text-align: center;
    }}
    h2 {{
      font-size: 1.1rem;
      margin-top: 1.4rem;
      color: #333;
    }}
    p {{
      margin: 0.3rem 0;
      color: #444;
      font-size: 0.95rem;
    }}
    .info {{
      background: #eef3ff;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }}
    label {{
      display: block;
      margin-top: 0.8rem;
      font-weight: 600;
      font-size: 0.9rem;
    }}
    select, input[type=text] {{
      width: 100%;
      padding: 8px 10px;
      margin-top: 0.2rem;
      border-radius: 6px;
      border: 1px solid #ccc;
      font-size: 0.95rem;
      box-sizing: border-box;
    }}
    input[type=submit] {{
      margin-top: 1.2rem;
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 6px;
      background: #2551cc;
      color: white;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }}
    input[type=submit]:hover {{
      background: #1a3da0;
    }}
    .small {{
      font-size: 0.8rem;
      color: #777;
      text-align: center;
      margin-top: 1rem;
    }}
  </style>
</head>
<body>
  <div class="container">
    <h1>Pico W – Portail WiFi</h1>

    <div class="info">
      <p><b>AP SSID :</b> {AP_SSID}</p>
      <p><b>IP du Pico :</b> {ip}</p>
      <p><b>Valeur interne :</b> {my_value}</p>
      <p><b>Dernier SSID choisi :</b> {last_ssid}</p>
      <p><b>Dernier mot de passe :</b> {last_pwd}</p>
      <p><b>Timezone actuelle :</b> {last_tz}</p>
      <p>Exemple : GMT+1 ≈ Europe/Paris, Berlin</p>
    </div>

    <h2>Configurer le WiFi</h2>
    <form action="/" method="GET">
      <label for="ssid">Réseau WiFi</label>
      <select id="ssid" name="ssid">
        {wifi_options}
      </select>

      <label for="pwd">Mot de passe</label>
      <input type="text" id="pwd" name="pwd" placeholder="Mot de passe WiFi" />

      <label for="email">Email du compte OwL</label>
      <input type="text" id="email" name="email" placeholder="votre@email.com" />

      <label for="timezone">Fuseau horaire</label>
      <select id="timezone" name="timezone">
        {tz_opts}
      </select>

      <input type="submit" value="Enregistrer">
    </form>

    <p class="small">Connecte-toi à <b>{AP_SSID}</b> puis ouvre <b>http://{ip}</b>.</p>
  </div>
</body>
</html>"""

    # ----- serveur HTTP -----
    addr = socket.getaddrinfo("0.0.0.0", 80)[0][-1]
    s = socket.socket()
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(addr)
    s.listen(1)
    print("Serveur HTTP sur http://", ap.ifconfig()[0])

    creds = (None, None, None, None)
    server_running = True

    while server_running:
        cl, addr = s.accept()
        cl_file = cl.makefile("rwb", 0)

        request_line = cl_file.readline().decode()
        print("Request:", request_line)

        try:
            path = request_line.split(" ")[1]
        except IndexError:
            path = "/"

        m_ssid   = ure.search(r"ssid=([^& ]+)", path)
        m_pwd    = ure.search(r"pwd=([^& ]+)", path)
        m_email  = ure.search(r"email=([^& ]+)", path)
        m_tz     = ure.search(r"timezone=([^& ]+)", path)

        while True:
            line = cl_file.readline()
            if not line or line == b"\r\n":
                break

        if m_ssid and m_pwd and m_email and m_tz:
            last_ssid = m_ssid.group(1)
            last_pwd  = m_pwd.group(1)
            user_email = m_email.group(1).replace("%40", "@")
            tz_value = m_tz.group(1)

            # Gestion du + dans la query string (souvent décodé en espace) [web:23][web:48]
            tz_value = tz_value.replace(" ", "+")
            tz_value = tz_value.replace("%2B", "+")

            print("SSID choisi:", last_ssid)
            print("Mot de passe:", last_pwd)
            print("E-mail:", user_email)
            print("Timezone:", tz_value)

            ok_page = f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pico W config</title>
  <style>
    body {{
      font-family: Arial, sans-serif;
      background: #f2f5fa;
      margin: 0;
      padding: 0;
    }}
    .container {{
      max-width: 480px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      padding: 24px 20px;
    }}
    h1 {{
      font-size: 1.6rem;
      margin-top: 0;
      color: #2551cc;
      text-align: center;
    }}
    p {{
      margin: 0.4rem 0;
      color: #444;
      font-size: 0.95rem;
      text-align: center;
    }}
  </style>
</head>
<body>
  <div class="container">
    <h1>Configuration enregistrée</h1>
    <p>Le Pico a bien reçu la configuration WiFi.</p>
    <p><b>SSID :</b> {last_ssid}</p>
    <p><b>Mot de passe :</b> {last_pwd}</p>
    <p><b>Fuseau horaire :</b> {tz_value}</p>
    <p>Vous pouvez maintenant fermer cette page.</p>
  </div>
</body>
</html>"""
            cl.send(b"HTTP/1.0 200 OK\r\nContent-Type: text/html\r\n\r\n")
            cl.send(ok_page)
            cl.close()

            creds = (last_ssid, last_pwd, user_email, tz_value)
            s.close()
            server_running = False
        else:
            page = build_page()
            cl.send(b"HTTP/1.0 200 OK\r\nContent-Type: text/html\r\n\r\n")
            cl.send(page)
            cl.close()

    ap.active(False)
    scanner.active(False)
    return creds