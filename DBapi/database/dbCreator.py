import sqlite3
from os import unlink

# unlink("./database/database.db")
with sqlite3.connect("./database.db") as con:
    with open("./database_schema.sql") as schemaFile:
        con.executescript(schemaFile.read())
