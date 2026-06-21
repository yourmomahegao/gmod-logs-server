from core.celery import app
from core.functions import run_query

@app.task
def insert_log(steam_id: str, steam_id64: str, nickname: str, data: str, type_id: int, action_id: int, connection="default"):
    run_query("""INSERT INTO gmodlogs_log
                     (steam_id, steam_id64, nickname, data, type_id, action_id, insertion_datetime)
                 VALUES
                     (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)""", args=(steam_id, steam_id64, nickname, data, type_id, action_id), connection=connection)
