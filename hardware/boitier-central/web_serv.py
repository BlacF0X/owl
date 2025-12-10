import network
import socket
import ure
import time
import json_rel

AP_SSID = "OwlRegistering"
AP_PASS = "RegisterOwlScoobodoo"

def start_config_portal():
    """Lance l'AP + portail, affiche variable + scan WiFi, et renvoie (ssid, pwd)."""
    my_value = json_rel.get_infos()["id"]
    last_ssid = json_rel.get_infos()["home_wifi"]["ssid"]
    last_pwd = json_rel.get_infos()["home_wifi"]["psd"]

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
    scanner.active(True)  # uniquement pour wlan.scan()[web:3][web:12][web:18]

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

    def build_page():
        ip = ap.ifconfig()[0]
        wifi_options = scan_networks()
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
    </div>

    <h2>Configurer le WiFi</h2>
    <form action="/" method="GET">
      <label for="ssid">Réseau WiFi</label>
      <select id="ssid" name="ssid">
        {wifi_options}
      </select>

      <label for="pwd">Mot de passe</label>
      <input type="text" id="pwd" name="pwd" placeholder="Entrez le mot de passe" />

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

    creds = (None, None)
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

        m_ssid = ure.search(r"ssid=([^& ]+)", path)
        m_pwd  = ure.search(r"pwd=([^& ]+)", path)

        while True:
            line = cl_file.readline()
            if not line or line == b"\r\n":
                break

        if m_ssid and m_pwd and m_ssid.group(1) != "":
            last_ssid = m_ssid.group(1)
            last_pwd  = m_pwd.group(1)
            print("SSID choisi:", last_ssid)
            print("Mot de passe:", last_pwd)

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
    .btn {{
      margin-top: 1.6rem;
      display: block;
      width: 100%;
      padding: 10px;
      border-radius: 6px;
      border: none;
      background: #2551cc;
      color: white;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      text-align: center;
    }}
    .btn:active {{
      background: #1a3da0;
    }}
  </style>
</head>
<body>
  <div class="container">
    <h1>Configuration enregistrée</h1>
    <p>Le Pico a bien reçu la configuration WiFi.</p>
    <p><b>SSID :</b> {last_ssid}</p>
    <p><b>Mot de passe :</b> {last_pwd}</p>
    <p>Vous pouvez maintenant fermer cette page.</p>
  </div>
</body>
</html>"""
            cl.send(b"HTTP/1.0 200 OK\r\nContent-Type: text/html\r\n\r\n")
            cl.send(ok_page)
            cl.close()

            creds = (last_ssid, last_pwd)
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


