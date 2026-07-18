import sqlite3

conn = sqlite3.connect(r"c:\makethon\data\river_monitor.db")
cursor = conn.cursor()
cursor.execute("SELECT raw_packet, received_at FROM readings ORDER BY id DESC LIMIT 5")
rows = cursor.fetchall()
if not rows:
    print("No data found.")
for row in rows:
    print(f"[{row[1]}] {row[0]}")
conn.close()
