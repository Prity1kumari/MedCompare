from app.db.session import SessionLocal,engine

try:
    conn=engine.connect()
    print("database connection is successful")
    conn.close()

except Exception as e:
    print("database connection is failed")
    print(e)  